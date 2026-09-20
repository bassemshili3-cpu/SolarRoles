param(
    [switch]$PreviewOnly,
    [switch]$ResetCredential,
    [switch]$SkipUrlCheck
)

$ErrorActionPreference = "Stop"
$CampaignDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$CampaignPath = Join-Path $CampaignDir "campaign.json"
$LaunchPath = Join-Path $CampaignDir "launch.ps1"
$CredentialPath = Join-Path $CampaignDir "smtp-credential.xml"
$campaign = Get-Content -LiteralPath $CampaignPath -Raw -Encoding UTF8 | ConvertFrom-Json

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is required. Install Node.js, then rerun this script."
}

# Prevent duplicate sends from the first campaign. Those old tasks correspond to messages 14-45.
if (-not $PreviewOnly) {
    Write-Host "Removing any remaining V1 tasks 14-45 to prevent duplicate sends..."
    14..45 | ForEach-Object {
        $oldTaskName = "SolarRoles-Outreach-20260918-{0:D2}" -f $_
        if (Get-ScheduledTask -TaskName $oldTaskName -ErrorAction SilentlyContinue) {
            Unregister-ScheduledTask -TaskName $oldTaskName -Confirm:$false
            Write-Host "  removed $oldTaskName"
        }
    }
}

# Preflight direct resource URLs before any V2 task is registered.
if (-not $PreviewOnly -and -not $SkipUrlCheck) {
    Write-Host "Checking personalized resource URLs..."
    $urls = $campaign.messages | Select-Object -ExpandProperty resourceUrl -Unique
    foreach ($url in $urls) {
        try {
            $response = Invoke-WebRequest -Uri $url -Method Head -MaximumRedirection 5 -TimeoutSec 20 -UseBasicParsing -ErrorAction Stop
            $status = [int]$response.StatusCode
            if ($status -ge 400 -and $status -ne 429) { throw "HTTP $status" }
            Write-Host "  OK $status  $url"
        }
        catch {
            $statusCode = $null
            if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
                try { $statusCode = [int]$_.Exception.Response.StatusCode } catch {}
            }
            if ($statusCode -eq 429) {
                Write-Host "  OK 429  $url (rate-limited but route exists)"
            } elseif ($statusCode -eq 405) {
                # Some routes reject HEAD. Retry GET without downloading a file.
                try {
                    $response = Invoke-WebRequest -Uri $url -Method Get -MaximumRedirection 5 -TimeoutSec 20 -UseBasicParsing -ErrorAction Stop
                    Write-Host "  OK $([int]$response.StatusCode)  $url"
                } catch {
                    throw "Resource preflight failed for $url : $($_.Exception.Message)"
                }
            } else {
                throw "Resource preflight failed for $url : $($_.Exception.Message). Fix the URL or rerun with -SkipUrlCheck only if you have manually verified it."
            }
        }
    }
}

if ($ResetCredential -and (Test-Path $CredentialPath)) {
    Remove-Item -LiteralPath $CredentialPath -Force
}

if (-not $PreviewOnly -and -not (Test-Path $CredentialPath)) {
    Write-Host "SMTP credential setup for Solar Roles / IONOS"
    Write-Host "Use the pr@solarroles.com mailbox login and its IONOS mailbox password."
    $cred = Get-Credential -UserName "pr@solarroles.com" -Message "IONOS SMTP credential for Solar Roles V2"
    $cred | Export-Clixml -LiteralPath $CredentialPath
    Write-Host "Credential encrypted with Windows DPAPI and saved locally as smtp-credential.xml."
}

$now = Get-Date
$created = 0
foreach ($m in $campaign.messages) {
    $when = [DateTimeOffset]::Parse([string]$m.scheduledAt).LocalDateTime
    $human = [int]$m.index + 1
    $taskName = "SolarRoles-Outreach-20260918-V2-{0:D2}" -f $human
    $args = "-NoProfile -ExecutionPolicy Bypass -File `"$LaunchPath`" -Index $($m.index)"

    if ($PreviewOnly) {
        Write-Host ("{0}  V2-{1:D2}  old#{2}  {3}  [{4}]  {5}" -f $when.ToString("yyyy-MM-dd HH:mm:ss"), $human, $m.originalHumanNumber, $m.to, $m.resourceLabel, $m.resourceUrl)
        continue
    }

    if ($when -le $now) {
        Write-Warning "Skipping $taskName because scheduled time $when has already passed."
        continue
    }

    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $args -WorkingDirectory $CampaignDir
    $trigger = New-ScheduledTaskTrigger -Once -At $when
    $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 5)
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description ("Solar Roles V2 workforce outreach: " + $m.organization) -Force | Out-Null
    $created++
}

if ($PreviewOnly) {
    Write-Host "`nPreview complete. No Windows tasks were created or removed."
} else {
    Write-Host "`nRegistered $created V2 scheduled email tasks."
    Write-Host "Window: 15:30:00 to 16:29:56 Europe/Paris."
    Write-Host "Keep the PC awake and connected to the internet until 16:30."
}
