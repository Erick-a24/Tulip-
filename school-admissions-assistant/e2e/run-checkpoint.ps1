$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Oggu\Documents\Tulip\school-admissions-assistant"

$output = & node e2e/smoke-test.js 2>&1
$exitCode = $LASTEXITCODE
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$logPath = "C:\Users\Oggu\Documents\Tulip\school-admissions-assistant\e2e\run-log.txt"

if ($exitCode -ne 0) {
    $failLines = (($output | Select-String "^FAIL" | ForEach-Object { $_.Line.Trim() }) -join " | ")
    if ([string]::IsNullOrWhiteSpace($failLines)) { $failLines = "Script crashed before reporting individual checks. Raw output: $($output -join ' ')" }

    Add-Content -Path $logPath -Value "$timestamp FAILED: $failLines"

    try {
        Import-Module BurntToast -ErrorAction Stop
        $shortMsg = $failLines.Substring(0, [Math]::Min(180, $failLines.Length))
        New-BurntToastNotification -Text "Checkpoint: smoke test FAILED", $shortMsg
    } catch {
        Add-Content -Path $logPath -Value "$timestamp NOTE: BurntToast notification could not be shown ($($_.Exception.Message))"
    }
} else {
    Add-Content -Path $logPath -Value "$timestamp PASSED"
}
