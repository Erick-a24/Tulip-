# protect-rules.ps1 - blocks any attempt to overwrite The Admin rules files
# Runs as a PreToolUse hook on Write and Edit tools.
# Exit 2 = block. Exit 0 = allow.
param()

$input_json = $input | Out-String
try { $data = $input_json | ConvertFrom-Json } catch { exit 0 }

$path = "$($data.tool_input.file_path)"

$protected = @(
    "guardrail\.md$",
    "quality-rubric\.md$",
    "POLICY\.md$",
    "\.claude[/\\]settings\.json$",
    "\.claude[/\\]settings\.local\.json$"
)

foreach ($p in $protected) {
    if ($path -match $p) {
        Write-Error "ADMIN SAFETY: This is one of the approved rules files ($path). It is read-only to The Admin itself. Changes need the owner's explicit review, same as the Module 11 guardrail approval process."
        exit 2
    }
}

exit 0
