param(
  [switch]$PreviewOnly,
  [switch]$SkipUrlValidation,
  [switch]$Force
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$CampaignPath = Join-Path $Root "campaign.json"
$CredentialPath = Join-Path $Root "smtp-credential.xml"
$LaunchPath = Join-Path $Root "launch.ps1"
$ValidatePath = Join-Path $Root "validate-resource-urls.ps1"

$Campaign = Get-Content $CampaignPath -Raw -Encoding UTF8 | ConvertFrom-Json
$Messages = @($Campaign.messages)

if ($Messages.Count -ne [int]$Campaign.messageCount) {
  throw "campaign.json says messageCount=$($Campaign.messageCount), but contains $($Messages.Count) messages."
}

$DupEmails = $Messages | Group-Object { $_.to.ToLowerInvariant() } | Where-Object Count -gt 1
if ($DupEmails) { throw "Duplicate recipient email(s) found in campaign.json." }

$DupOrgs = $Messages | Group-Object organization | Where-Object Count -gt 1
if ($DupOrgs) { throw "Duplicate organization(s) found in campaign.json." }

$BadSelection = $Messages | Where-Object { $_.priority -ne "A" -or $_.previouslyContacted -ne $false }
if ($BadSelection) { throw "Campaign contains a recipient that is not Priority A + never contacted." }

Write-Host ""
Write-Host $Campaign.campaign -ForegroundColor Cyan
Write-Host ("{0} messages | {1} sec spacing" -f $Messages.Count, $Campaign.spacingSeconds)
Write-Host ("Window: {0} -> {1}" -f $Campaign.firstSend, $Campaign.lastSend)
Write-Host ""

foreach ($m in $Messages) {
  Write-Host ("#{0:D2}  {1}  {2}  [{3}]" -f [int]$m.id, $m.sendAt, $m.to, $m.resourceName)
}

if ($PreviewOnly) {
  Write-Host ""
  Write-Host "Preview only: no credentials requested and no Scheduled Tasks created." -ForegroundColor Yellow
  exit 0
}

if (-not $SkipUrlValidation) {
  & $ValidatePath
}

Get-Command node -ErrorAction Stop | Out-Null

if (-not (Test-Path $CredentialPath)) {
  Write-Host ""
  Write-Host "IONOS SMTP credential is not stored yet." -ForegroundColor Yellow
  Write-Host "Enter the password for pr@solarroles.com. Windows will encrypt it for this user/machine with DPAPI."
  $Cred = Get-Credential -UserName "pr@solarroles.com" -Message "Solar Roles IONOS SMTP credential"
  $Cred | Export-Clixml -Path $CredentialPath
  Write-Host "Created smtp-credential.xml (DPAPI-encrypted for this Windows account)." -ForegroundColor Green
}

# Verify the credential file can be read before registering tasks.
try {
  $null = Import-Clixml -Path $CredentialPath
}
catch {
  throw "smtp-credential.xml cannot be decrypted/read on this Windows account. Delete it and rerun register.ps1."
}

$Prefix = [string]$Campaign.taskPrefix
$Existing = @(Get-ScheduledTask -ErrorAction SilentlyContinue | Where-Object { $_.TaskName -like "$Prefix-*" })
if ($Existing.Count -gt 0) {
  if (-not $Force) {
    throw "$($Existing.Count) existing task(s) with prefix '$Prefix' found. Run .\unregister-v3.ps1 first, or rerun with -Force."
  }
  $Existing | Unregister-ScheduledTask -Confirm:$false
}

$PowerShell = (Get-Command powershell.exe -ErrorAction Stop).Source
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew

foreach ($m in $Messages) {
  $SendAt = [DateTimeOffset]::Parse([string]$m.sendAt)
  $LocalAt = $SendAt.LocalDateTime
  if ($LocalAt -le (Get-Date)) {
    throw "Message #$($m.id) is scheduled in the past ($LocalAt local time). Edit campaign.json before registering."
  }

  $TaskName = ("{0}-{1:D2}" -f $Prefix, [int]$m.id)
  $Args = "-NoProfile -ExecutionPolicy Bypass -File `"$LaunchPath`" -MessageIndex $($m.id)"
  $Action = New-ScheduledTaskAction -Execute $PowerShell -Argument $Args -WorkingDirectory $Root
  $Trigger = New-ScheduledTaskTrigger -Once -At $LocalAt
  Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Solar Roles outreach #$($m.id) to $($m.to)" -Force | Out-Null
  Write-Host ("[REGISTERED] {0} -> {1}" -f $TaskName, $LocalAt) -ForegroundColor Green
}

Write-Host ""
Write-Host "Registered $($Messages.Count) Windows Scheduled Tasks." -ForegroundColor Green
Write-Host "Keep this folder in place until the campaign has finished." -ForegroundColor Yellow
