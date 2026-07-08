# watcher.ps1 - watches tasks.json and prints a line when a new waiting job appears
# Run in the background; Monitor listens to its stdout.
param()

$TASKS_FILE = Join-Path $PSScriptRoot "..\tasks.json"
$lastWaiting = 0

while ($true) {
    try {
        $data    = Get-Content $TASKS_FILE -Raw -Encoding utf8 | ConvertFrom-Json
        $waiting = 0
        if ($data.jobs) {
            $waiting = @($data.jobs | Where-Object { $_.status -eq "waiting" }).Count
        }
        if ($waiting -gt $lastWaiting) {
            Write-Host "NEW_JOB_WAITING count=$waiting"
            [Console]::Out.Flush()
        }
        $lastWaiting = $waiting
    } catch {
        # tasks.json temporarily locked or missing - skip this tick
    }
    Start-Sleep -Seconds 20
}
