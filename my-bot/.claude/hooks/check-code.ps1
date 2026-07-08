# check-code.ps1 - traffic-light safety check after a code file is written
# Runs as a PostToolUse hook on Write and Edit tools.
# Green  (exit 0) - safe to proceed
# Amber  (exit 0) - works but degraded, shows a warning
# Red    (exit 2) - broken, Barry should undo and mark the job stuck
param()

$input_json = $input | Out-String
try { $data = $input_json | ConvertFrom-Json } catch { exit 0 }

$path = "$($data.tool_input.file_path)"

# Only check code files
$codeExtensions = @('.ps1', '.js', '.ts', '.py', '.sh', '.bat')
$ext = [System.IO.Path]::GetExtension($path).ToLower()
if ($ext -notin $codeExtensions) { exit 0 }

# --- PowerShell syntax check ---
if ($ext -eq '.ps1') {
    $tokens = $null
    $errors = $null
    $null = [System.Management.Automation.Language.Parser]::ParseFile(
        $path, [ref]$tokens, [ref]$errors
    )

    if ($errors -and $errors.Count -gt 0) {
        $msgs = ($errors | ForEach-Object { $_.Message }) -join "; "
        Write-Host "RED - Syntax errors found in $path"
        Write-Host "   Errors: $msgs"
        Write-Host "   Barry should undo this change and mark the job stuck."
        exit 2
    }

    Write-Host "GREEN - $path passed syntax check."
    exit 0
}

# --- JS/TS basic check (node --check if available) ---
if ($ext -in @('.js', '.ts')) {
    $nodeOk = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeOk) {
        $result = & node --check $path 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "RED - Syntax error in $path"
            Write-Host "   $result"
            Write-Host "   Barry should undo this change and mark the job stuck."
            exit 2
        }
        Write-Host "GREEN - $path passed syntax check."
    } else {
        Write-Host "AMBER - Cannot verify $path (node not installed). Proceeding - review manually."
    }
    exit 0
}

# --- All other code files ---
Write-Host "AMBER - $path written. No automatic check available for $ext - please review before running."
exit 0
