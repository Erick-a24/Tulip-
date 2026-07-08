param()
$ErrorActionPreference = "Stop"

$PORT       = 8080
$SCRIPT_DIR = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$TASKS_FILE = Join-Path $SCRIPT_DIR "..\tasks.json"
$INDEX_FILE = Join-Path $SCRIPT_DIR "index.html"

# --- Data helpers ---

function Read-Tasks {
    $raw  = Get-Content $TASKS_FILE -Raw -Encoding utf8
    $data = $raw | ConvertFrom-Json
    $jobs  = [System.Collections.ArrayList]::new()
    $log   = [System.Collections.ArrayList]::new()
    $corr  = [System.Collections.ArrayList]::new()
    if ($data.jobs)        { foreach ($x in $data.jobs)        { [void]$jobs.Add($x) } }
    if ($data.log)         { foreach ($x in $data.log)         { [void]$log.Add($x)  } }
    if ($data.corrections) { foreach ($x in $data.corrections) { [void]$corr.Add($x) } }
    [PSCustomObject]@{
        settings    = $data.settings
        jobs        = $jobs
        log         = $log
        corrections = $corr
    }
}

function Save-Tasks($t) {
    [PSCustomObject]@{
        settings    = $t.settings
        jobs        = @($t.jobs)
        log         = @($t.log)
        corrections = @($t.corrections)
    } | ConvertTo-Json -Depth 10 | Set-Content $TASKS_FILE -Encoding utf8
}

function New-Id {
    "job_$([System.DateTime]::UtcNow.ToString('yyyyMMddHHmmssff'))_$(Get-Random -Maximum 9999)"
}

function Now { [System.DateTime]::UtcNow.ToString("o") }

# --- HTTP helpers ---

function Send-Response($res, $code, $ctype, $body) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
    $res.StatusCode      = $code
    $res.ContentType     = $ctype
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
    $res.Close()
}

function Read-Body($req) {
    $r = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
    $b = $r.ReadToEnd()
    $r.Close()
    return $b
}

# --- Route handler ---

function Invoke-Request($req, $res) {
    $path = $req.Url.LocalPath
    $verb = $req.HttpMethod

    if ($verb -eq "OPTIONS") {
        $res.StatusCode = 200
        $res.Close()
        return
    }

    if ($verb -eq "GET" -and $path -eq "/") {
        Send-Response $res 200 "text/html; charset=utf-8" (Get-Content $INDEX_FILE -Raw -Encoding utf8)
        return
    }

    if ($verb -eq "GET" -and $path -eq "/api/tasks") {
        Send-Response $res 200 "application/json; charset=utf-8" (Read-Tasks | ConvertTo-Json -Depth 10)
        return
    }

    if ($verb -eq "POST" -and $path -eq "/api/jobs") {
        $b   = Read-Body $req | ConvertFrom-Json
        $t   = Read-Tasks
        $job = [PSCustomObject]@{
            id          = New-Id
            title       = [string]$b.title
            description = [string]$b.description
            priority    = [string]$b.priority
            status      = "waiting"
            result_note = ""
            created_at  = Now
            updated_at  = Now
        }
        [void]$t.jobs.Add($job)
        [void]$t.log.Add([PSCustomObject]@{
            time      = Now
            job_id    = $job.id
            job_title = $job.title
            action    = "Job added"
            outcome   = "waiting"
        })
        Save-Tasks $t
        Send-Response $res 201 "application/json; charset=utf-8" ($job | ConvertTo-Json -Depth 5)
        return
    }

    if ($verb -eq "PATCH" -and $path -match "^/api/jobs/([^/]+)$") {
        $id  = $Matches[1]
        $b   = Read-Body $req | ConvertFrom-Json
        $t   = Read-Tasks
        $job = $t.jobs | Where-Object { $_.id -eq $id } | Select-Object -First 1
        if (-not $job) {
            Send-Response $res 404 "text/plain" "Job not found"
        } else {
            if ($b.PSObject.Properties['status'])      { $job.status      = [string]$b.status }
            if ($b.PSObject.Properties['result_note']) { $job.result_note = [string]$b.result_note }
            $job.updated_at = Now
            Save-Tasks $t
            Send-Response $res 200 "application/json; charset=utf-8" ($job | ConvertTo-Json -Depth 5)
        }
        return
    }

    if ($verb -eq "POST" -and $path -match "^/api/jobs/([^/]+)/approve$") {
        $id  = $Matches[1]
        $t   = Read-Tasks
        $job = $t.jobs | Where-Object { $_.id -eq $id } | Select-Object -First 1
        if (-not $job) {
            Send-Response $res 404 "text/plain" "Job not found"
        } else {
            $job.status     = "done"
            $job.updated_at = Now
            [void]$t.log.Add([PSCustomObject]@{
                time      = Now
                job_id    = $job.id
                job_title = $job.title
                action    = "Owner approved"
                outcome   = "done"
            })
            Save-Tasks $t
            Send-Response $res 200 "application/json; charset=utf-8" ($job | ConvertTo-Json -Depth 5)
        }
        return
    }

    if ($verb -eq "POST" -and $path -match "^/api/jobs/([^/]+)/deny$") {
        $id  = $Matches[1]
        $t   = Read-Tasks
        $job = $t.jobs | Where-Object { $_.id -eq $id } | Select-Object -First 1
        if (-not $job) {
            Send-Response $res 404 "text/plain" "Job not found"
        } else {
            $job.status      = "stuck"
            $job.result_note = ($job.result_note + " [Owner declined]").Trim()
            $job.updated_at  = Now
            [void]$t.log.Add([PSCustomObject]@{
                time      = Now
                job_id    = $job.id
                job_title = $job.title
                action    = "Owner declined"
                outcome   = "stuck"
            })
            Save-Tasks $t
            Send-Response $res 200 "application/json; charset=utf-8" ($job | ConvertTo-Json -Depth 5)
        }
        return
    }

    Send-Response $res 404 "text/plain" "Not found"
}

# --- Start listener ---

$hl = New-Object System.Net.HttpListener
$hl.Prefixes.Add("http://localhost:$PORT/")

$startErr = $null
try { $hl.Start() } catch { $startErr = $_ }
if ($startErr) {
    Write-Error "Port $PORT is already in use."
    exit 1
}

Write-Host "Barry running at http://localhost:$PORT"

# --- Request loop ---

$running = $true
while ($running -and $hl.IsListening) {
    $ctx    = $null
    $getErr = $null
    try { $ctx = $hl.GetContext() } catch { $getErr = $_ }

    if ($getErr -or (-not $ctx)) {
        $running = $false
    } else {
        $req = $ctx.Request
        $res = $ctx.Response
        $res.Headers.Add("Access-Control-Allow-Origin",  "*")
        $res.Headers.Add("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS")
        $res.Headers.Add("Access-Control-Allow-Headers", "Content-Type")

        $handleErr = $null
        try { Invoke-Request $req $res } catch { $handleErr = $_ }
        if ($handleErr) {
            try {
                Send-Response $res 500 "text/plain" $handleErr.Exception.Message
            } catch {
                Write-Warning "Send-Response failed"
            }
        }
    }
}

$hl.Stop()
Write-Host "Barry stopped."
