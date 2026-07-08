# check-secrets.ps1 — blocks writing secrets/keys to files
# Runs as a PreToolUse hook on Write and Edit tools.
# Exit 2 = block. Exit 0 = allow.
param()

$input_json = $input | Out-String
try { $data = $input_json | ConvertFrom-Json } catch { exit 0 }

# Collect all text fields from the tool input
$text = @(
    $data.tool_input.content,
    $data.tool_input.new_string,
    $data.tool_input.old_string
) -join "`n"

$patterns = @(
    'password\s*=\s*["\x27][^"'\'']{4,}',
    'secret\s*=\s*["\x27][^"'\'']{4,}',
    'api_key\s*=\s*["\x27][^"'\'']{4,}',
    'api_secret\s*=\s*["\x27][^"'\'']{4,}',
    'private_key\s*=\s*["\x27][^"'\'']{4,}',
    'token\s*=\s*["\x27][^"'\'']{4,}',
    'sk-[A-Za-z0-9]{20,}',
    'AKIA[A-Z0-9]{16}',
    'ghp_[A-Za-z0-9]{36}'
)

foreach ($p in $patterns) {
    if ($text -match $p) {
        Write-Error "BARRY SAFETY: Looks like a secret or key is about to be written to a file. Remove it and use a placeholder like '<your-key-here>' instead."
        exit 2
    }
}

exit 0
