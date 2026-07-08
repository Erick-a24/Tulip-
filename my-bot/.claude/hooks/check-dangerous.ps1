# check-dangerous.ps1 — warns before dangerous shell commands
# Runs as a PreToolUse hook on Bash and PowerShell tools.
# Exit 2 = block. Exit 0 = allow.
param()

$input_json = $input | Out-String
try { $data = $input_json | ConvertFrom-Json } catch { exit 0 }

$cmd = "$($data.tool_input.command) $($data.tool_input.restart)"

$dangerous = @(
    'rm\s+-rf',
    'Remove-Item.*-Recurse.*-Force',
    'del\s+/[sf]',
    'format\s+[a-z]:',
    'rd\s+/s',
    'Drop\s+Table',
    'DROP\s+TABLE',
    'TRUNCATE\s+TABLE',
    'git\s+push\s+.*--force',
    'git\s+reset\s+--hard',
    'git\s+clean\s+-f'
)

foreach ($p in $dangerous) {
    if ($cmd -match $p) {
        Write-Error "BARRY SAFETY: This command looks destructive ($p). Barry has blocked it. If you really want this done, please add it as a job on the web page so you can approve it explicitly."
        exit 2
    }
}

exit 0
