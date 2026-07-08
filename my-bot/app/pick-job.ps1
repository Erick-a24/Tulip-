# pick-job.ps1 — reads tasks.json, picks the best waiting job, marks it "working"
# Outputs the job as JSON to stdout. Exits 0 with JSON if a job was found, exits 1 if nothing to do.
param()
$ErrorActionPreference = "Stop"

$TASKS_FILE = Join-Path $PSScriptRoot "..\tasks.json"

$data = Get-Content $TASKS_FILE -Raw -Encoding utf8 | ConvertFrom-Json

$priOrder = @{ High = 0; Medium = 1; Low = 2 }

$job = $null
if ($data.jobs) {
    $job = $data.jobs |
        Where-Object { $_.status -eq "waiting" } |
        Sort-Object {
            $p = if ($_.priority) { $priOrder[$_.priority] } else { 1 }
            $t = if ($_.created_at) { [datetime]::Parse($_.created_at).Ticks } else { 0 }
            "$p|$t"
        } |
        Select-Object -First 1
}

if (-not $job) { exit 1 }

# Mark working
foreach ($j in $data.jobs) {
    if ($j.id -eq $job.id) {
        $j.status     = "working"
        $j.updated_at = [System.DateTime]::UtcNow.ToString("o")
    }
}

# Add log entry
$logEntry = [PSCustomObject]@{
    time      = [System.DateTime]::UtcNow.ToString("o")
    job_id    = $job.id
    job_title = $job.title
    action    = "Started"
    outcome   = "working"
}

$jobs  = [System.Collections.ArrayList]::new(); if ($data.jobs)        { foreach ($x in $data.jobs)        { [void]$jobs.Add($x) } }
$log   = [System.Collections.ArrayList]::new(); if ($data.log)         { foreach ($x in $data.log)         { [void]$log.Add($x)  } }
$corr  = [System.Collections.ArrayList]::new(); if ($data.corrections) { foreach ($x in $data.corrections) { [void]$corr.Add($x) } }
[void]$log.Add($logEntry)

[PSCustomObject]@{
    settings    = $data.settings
    jobs        = @($jobs)
    log         = @($log)
    corrections = @($corr)
} | ConvertTo-Json -Depth 10 | Set-Content $TASKS_FILE -Encoding utf8

# Output the job
$job | ConvertTo-Json -Depth 5
