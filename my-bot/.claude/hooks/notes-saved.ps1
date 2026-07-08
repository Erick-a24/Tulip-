# notes-saved.ps1 - when a file in notes/ is saved, queue a Daily Wrap-Up job
# Runs as a PostToolUse hook on Write and Edit tools.
param()

$input_json = $input | Out-String
try { $data = $input_json | ConvertFrom-Json } catch { exit 0 }

$path = "$($data.tool_input.file_path)"

# Only trigger for files inside a notes/ folder
if ($path -notmatch '[/\\]notes[/\\]') { exit 0 }

$TASKS_FILE = Join-Path $PSScriptRoot "..\..\tasks.json"
if (-not (Test-Path $TASKS_FILE)) { exit 0 }

$raw  = Get-Content $TASKS_FILE -Raw -Encoding utf8 | ConvertFrom-Json

# Don't add a duplicate if one is already waiting or working
$already = $false
if ($raw.jobs) {
    $already = ($raw.jobs | Where-Object {
        $_.title -like "*Daily Wrap-Up*" -and ($_.status -eq "waiting" -or $_.status -eq "working")
    }).Count -gt 0
}
if ($already) { exit 0 }

$jobs  = [System.Collections.ArrayList]::new(); if ($raw.jobs)        { foreach ($x in $raw.jobs)        { [void]$jobs.Add($x) } }
$log   = [System.Collections.ArrayList]::new(); if ($raw.log)         { foreach ($x in $raw.log)         { [void]$log.Add($x)  } }
$corr  = [System.Collections.ArrayList]::new(); if ($raw.corrections) { foreach ($x in $raw.corrections) { [void]$corr.Add($x) } }

$now = [System.DateTime]::UtcNow.ToString("o")
$job = [PSCustomObject]@{
    id          = "job_$([System.DateTime]::UtcNow.ToString('yyyyMMddHHmmssff'))_auto"
    title       = "Daily Wrap-Up"
    description = "Notes file saved: $path. Read today's notes in notes/ and write a dated summary to log/ following the daily-wrapup skill."
    priority    = "Low"
    status      = "waiting"
    result_note = ""
    created_at  = $now
    updated_at  = $now
}
[void]$jobs.Add($job)
[void]$log.Add([PSCustomObject]@{
    time      = $now
    job_id    = $job.id
    job_title = $job.title
    action    = "Auto-queued (notes file saved)"
    outcome   = "waiting"
})

[PSCustomObject]@{
    settings    = $raw.settings
    jobs        = @($jobs)
    log         = @($log)
    corrections = @($corr)
} | ConvertTo-Json -Depth 10 | Set-Content $TASKS_FILE -Encoding utf8

Write-Host "Barry: Daily Wrap-Up queued (notes file saved)."
exit 0
