# save-result.ps1 — writes the result of a job back to tasks.json
# Usage: save-result.ps1 -JobId <id> -Status <done|stuck|needs_ok> -Note "plain text result"
param(
    [Parameter(Mandatory)][string]$JobId,
    [Parameter(Mandatory)][ValidateSet("done","stuck","needs_ok")][string]$Status,
    [string]$Note = "",
    [int]$ScoreCompleteness = 0,
    [int]$ScoreAccuracy     = 0,
    [int]$ScoreUsability    = 0
)
$ErrorActionPreference = "Stop"

$TASKS_FILE = Join-Path $PSScriptRoot "..\tasks.json"

$data = Get-Content $TASKS_FILE -Raw -Encoding utf8 | ConvertFrom-Json

$found = $false
if ($data.jobs) {
    foreach ($j in $data.jobs) {
        if ($j.id -eq $JobId) {
            $j.status      = $Status
            $j.result_note = $Note
            $j.updated_at  = [System.DateTime]::UtcNow.ToString("o")
            $found = $true
        }
    }
}

if (-not $found) {
    Write-Error "Job $JobId not found"
    exit 1
}

$scoreText = if ($ScoreCompleteness -gt 0) {
    " | Scores: completeness=$ScoreCompleteness accuracy=$ScoreAccuracy usability=$ScoreUsability"
} else { "" }

$logEntry = [PSCustomObject]@{
    time      = [System.DateTime]::UtcNow.ToString("o")
    job_id    = $JobId
    job_title = ($data.jobs | Where-Object { $_.id -eq $JobId } | Select-Object -First 1).title
    action    = "Completed$scoreText"
    outcome   = $Status
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

Write-Host "Saved: $JobId → $Status"
