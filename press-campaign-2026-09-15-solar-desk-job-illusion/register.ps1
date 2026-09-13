$ErrorActionPreference = 'Stop'
$destination = 'C:\Users\basse\AppData\Local\SolarRoles\PressCampaigns\2026-09-15-solar-desk-job-illusion'
$campaign = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'campaign.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($campaign.messages.Count -ne 31) { throw 'Expected 31 messages' }
if ((Get-Date).ToUniversalTime() -ge [DateTimeOffset]::Parse($campaign.messages[0].scheduledAt).UtcDateTime) { throw 'First scheduled time has passed' }
if (Test-Path -LiteralPath $destination) { throw 'Campaign destination already exists; inspect before overwriting' }

New-Item -ItemType Directory -Path $destination | Out-Null
foreach ($file in @('campaign.json', 'review.md', 'send-scheduled-email.mjs', 'launch.ps1')) {
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination (Join-Path $destination $file)
}

$principal = New-ScheduledTaskPrincipal -UserId 'basse' -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -WakeToRun -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 3) -MultipleInstances IgnoreNew
$results = @()
foreach ($message in $campaign.messages) {
  $taskName = 'SolarRoles Desk Report 20260915-16 {0:D2}' -f ($message.index + 1)
  $instant = [DateTimeOffset]::Parse($message.scheduledAt)
  $window = $campaign.windows | Where-Object { $message.scheduledAt.StartsWith($_.date) } | Select-Object -First 1
  if ($null -eq $window) { throw ('Missing window for ' + $taskName) }
  $trigger = New-ScheduledTaskTrigger -Once -At $instant.LocalDateTime
  $trigger.StartBoundary = $message.scheduledAt
  $trigger.EndBoundary = $window.end
  $arguments = '-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + (Join-Path $destination 'launch.ps1') + '" -Index ' + $message.index
  $action = New-ScheduledTaskAction -Execute 'C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe' -Argument $arguments -WorkingDirectory $destination
  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description ('Authorized Solar Roles press email to ' + $message.to) | Out-Null
  $registered = Get-ScheduledTask -TaskName $taskName
  $info = Get-ScheduledTaskInfo -TaskName $taskName
  if ($registered.Triggers.StartBoundary -ne $message.scheduledAt) { throw ('Trigger mismatch: ' + $taskName) }
  $results += [pscustomobject]@{
    TaskName = $taskName
    To = $message.to
    ScheduledAt = $registered.Triggers.StartBoundary
    State = [string]$registered.State
    NextRunTime = $info.NextRunTime.ToString('o')
  }
}

$results | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $destination 'registered-tasks.json') -Encoding UTF8
$results | ConvertTo-Json
