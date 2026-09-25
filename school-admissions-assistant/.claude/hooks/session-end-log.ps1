# session-end-log.ps1 — records that a session ended, for audit continuity
# Runs as a Stop hook (session-end). Always exits 0 — observational, not a gate.
param()

$input_json = $input | Out-String
try { $data = $input_json | ConvertFrom-Json } catch { $data = $null }

$LOG_FILE = Join-Path $PSScriptRoot "..\..\.claude\session-log.md"
if (-not (Test-Path $LOG_FILE)) {
    "# Session log`n`nOne line per session end, appended automatically by session-end-log.ps1 (a Stop hook).`n" | Set-Content $LOG_FILE -Encoding utf8
}

$now = [System.DateTime]::UtcNow.ToString("o")
$sessionId = if ($data.session_id) { $data.session_id } else { "unknown" }
Add-Content -Path $LOG_FILE -Value "- $now — session $sessionId ended" -Encoding utf8

exit 0
