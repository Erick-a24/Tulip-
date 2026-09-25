# check-env-commit.ps1 — blocks committing .env
# Runs as a PreToolUse hook on Bash/PowerShell.
# Exit 2 = block. Exit 0 = allow. Silent on success, exit-2 message on failure.
param()

$input_json = $input | Out-String
try { $data = $input_json | ConvertFrom-Json } catch { exit 0 }

$cmd = "$($data.tool_input.command)"

if ($cmd -notmatch 'git\s+commit') { exit 0 }

# Only a real risk if .env is actually staged right now.
$staged = & git diff --cached --name-only 2>$null
if ($LASTEXITCODE -ne 0) { exit 0 }

$envStaged = $staged | Where-Object { $_ -match '(^|[/\\])\.env$' }
if ($envStaged) {
    Write-Error "SENSOR: .env is staged for commit ($($envStaged -join ', ')). Blocked. Run 'git restore --staged <file>' to unstage it before committing."
    exit 2
}

exit 0
