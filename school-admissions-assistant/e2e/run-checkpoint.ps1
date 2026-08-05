$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Oggu\Documents\Tulip\school-admissions-assistant"

# Every invocation of this script is fired by Windows Task Scheduler (either its
# 6am daily trigger, or its "Run" action for an on-demand proof run) - never by a
# human running the test directly. TRIGGERED_BY records which of those it was.
$triggeredBy = if ($env:TRIGGERED_BY) { $env:TRIGGERED_BY } else { "task-scheduler-daily-6am" }

$output = & node e2e/smoke-test.js 2>&1
$exitCode = $LASTEXITCODE
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$logPath = "C:\Users\Oggu\Documents\Tulip\school-admissions-assistant\e2e\run-log.txt"

if ($exitCode -ne 0) {
    $failLines = (($output | Select-String "^FAIL" | ForEach-Object { $_.Line.Trim() }) -join " | ")
    if ([string]::IsNullOrWhiteSpace($failLines)) { $failLines = "Script crashed before reporting individual checks. Raw output: $($output -join ' ')" }

    Add-Content -Path $logPath -Value "$timestamp TRIGGERED_BY=$triggeredBy FAILED: $failLines"

    try {
        Import-Module BurntToast -ErrorAction Stop
        $shortMsg = $failLines.Substring(0, [Math]::Min(180, $failLines.Length))
        New-BurntToastNotification -Text "Checkpoint: smoke test FAILED", $shortMsg
    } catch {
        Add-Content -Path $logPath -Value "$timestamp NOTE: BurntToast notification could not be shown ($($_.Exception.Message))"
    }
} else {
    Add-Content -Path $logPath -Value "$timestamp TRIGGERED_BY=$triggeredBy PASSED"
}
