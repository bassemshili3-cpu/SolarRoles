$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Campaign = Get-Content (Join-Path $Root "campaign.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$Prefix = [string]$Campaign.taskPrefix

$Tasks = @(Get-ScheduledTask -ErrorAction SilentlyContinue | Where-Object { $_.TaskName -like "$Prefix-*" })
if ($Tasks.Count -eq 0) {
  Write-Host "No tasks found for prefix $Prefix" -ForegroundColor Yellow
  exit 0
}

$Tasks | Unregister-ScheduledTask -Confirm:$false
Write-Host "Removed $($Tasks.Count) task(s) for $Prefix." -ForegroundColor Green
