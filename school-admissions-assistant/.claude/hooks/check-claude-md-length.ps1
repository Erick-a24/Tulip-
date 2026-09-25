# check-claude-md-length.ps1 — blocks CLAUDE.md growing past 150 lines
# Runs as a PreToolUse hook on Write/Edit.
# Exit 2 = block. Exit 0 = allow. Silent on success, exit-2 message on failure.
param()

$input_json = $input | Out-String
try { $data = $input_json | ConvertFrom-Json } catch { exit 0 }

$path = "$($data.tool_input.file_path)"
# Scoped to The Admin's own CLAUDE.md only — this hook is wired into the repo
# root's settings.json (school-admissions-assistant/ has no .git of its own,
# so its own .claude/settings.json is never read by the live harness).
if ($path -notmatch '[Ss]chool-admissions-assistant[/\\]CLAUDE\.md$') { exit 0 }

$LIMIT = 150

if ($data.tool_input.content) {
    # Write tool: full new content is given directly.
    $resultLines = ($data.tool_input.content -split "`n").Count
} elseif ($data.tool_input.old_string -and (Test-Path $path)) {
    # Edit tool: simulate the replacement against the current file on disk.
    $current = Get-Content $path -Raw -Encoding utf8
    $updated = $current -replace [regex]::Escape($data.tool_input.old_string), $data.tool_input.new_string.Replace('$', '$$$$'), 1
    $resultLines = ($updated -split "`n").Count
} else {
    exit 0
}

if ($resultLines -gt $LIMIT) {
    Write-Error "SENSOR: CLAUDE.md would be $resultLines lines (limit $LIMIT). Blocked. Move detail into an L2 doc under docs/ or an L3 doc, and leave only navigation + critical rules in CLAUDE.md."
    exit 2
}

exit 0
