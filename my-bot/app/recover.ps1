# recover.ps1 - resets jobs that got stuck "working" for too long (Barry crashed mid-job)
# Call this at the start of every round. Safe to run repeatedly.
param(
    [int]$StuckAfterMinutes = 10
)
$ErrorActionPreference = "Stop"

$TASKS_FILE = Join-Path $PSScriptRoot "..\tasks.json"
$data = Get-Content $TASKS_FILE -Raw -Encoding utf8 | ConvertFrom-Json

$recovered = 0
$cutoff    = [System.DateTime]::UtcNow.AddMinutes(-$StuckAfterMinutes)

$jobs  = [System.Collections.ArrayList]::new()
$log   = [System.Collections.ArrayList]::new()
$corr  = [System.Collections.ArrayList]::new()
if ($data.jobs)        { foreach ($x in $data.jobs)        { [void]$jobs.Add($x) } }
if ($data.log)         { foreach ($x in $data.log)         { [void]$log.Add($x)  } }
if ($data.corrections) { foreach ($x in $data.corrections) { [void]$corr.Add($x) } }

foreach ($j in $jobs) {
    if ($j.status -ne "working") { continue }
    $updated = try { [datetime]::Parse($j.updated_at) } catch { $cutoff.AddMinutes(-1) }
    if ($updated -lt $cutoff) {
        $j.status      = "waiting"
        $j.result_note = "Auto-recovered: Barry was interrupted mid-run. Queued again."
        $j.updated_at  = [System.DateTime]::UtcNow.ToString("o")
        [void]$log.Add([PSCustomObject]@{
            time      = [System.DateTime]::UtcNow.ToString("o")
            job_id    = $j.id
            job_title = $j.title
            action    = "Recovered from interrupted run"
            outcome   = "waiting"
        })
        $recovered++
        Write-Host "Recovered: $($j.title)"
    }
}

if ($recovered -gt 0) {
    [PSCustomObject]@{
        settings    = $data.settings
        jobs        = @($jobs)
        log         = @($log)
        corrections = @($corr)
    } | ConvertTo-Json -Depth 10 | Set-Content $TASKS_FILE -Encoding utf8
}

Write-Host "Recovery check done. Recovered: $recovered job(s)."
