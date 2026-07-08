# protect-rules.ps1 — blocks any attempt to overwrite CLAUDE.md or settings.json
# Runs as a PreToolUse hook on Write and Edit tools.
# Exit 2 = block. Exit 0 = allow.
param()

$input_json = $input | Out-String
try { $data = $input_json | ConvertFrom-Json } catch { exit 0 }

$path = "$($data.tool_input.file_path)"

$protected = @(
    'CLAUDE\.md$',
    '\.claude[/\\]settings\.json$',
    '\.claude[/\\]settings\.local\.json$'
)

foreach ($p in $protected) {
    if ($path -match $p) {
        Write-Error "BARRY SAFETY: Barry's rules file ($path) is read-only. It cannot be changed by Barry itself."
        exit 2
    }
}

exit 0
