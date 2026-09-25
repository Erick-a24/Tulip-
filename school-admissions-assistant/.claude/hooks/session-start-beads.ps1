# session-start-beads.ps1 — re-injects open beads at the start of every session
# Runs as a SessionStart hook. Prints open (non-closed) items from
# .beads/status.jsonl to stdout so context isn't lost across a reset.
# Always exits 0 — observational, never blocks a session from starting.
param()

$STATUS_FILE = Join-Path $PSScriptRoot "..\..\.beads\status.jsonl"
if (-not (Test-Path $STATUS_FILE)) { exit 0 }

$openBeads = Get-Content $STATUS_FILE -Encoding utf8 | ForEach-Object {
    try { $_ | ConvertFrom-Json } catch { $null }
} | Where-Object { $_ -and $_.status -ne "closed" }

if ($openBeads.Count -eq 0) { exit 0 }

Write-Host "Open beads from .beads/status.jsonl (survive context resets):"
foreach ($b in $openBeads) {
    Write-Host "- [$($b.id)] $($b.title) (opened $($b.opened_at))"
}

exit 0
