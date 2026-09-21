param(
  [string]$OutFile = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Campaign = Get-Content (Join-Path $Root "campaign.json") -Raw -Encoding UTF8 | ConvertFrom-Json

$Lines = New-Object System.Collections.Generic.List[string]
$Lines.Add("CAMPAIGN: $($Campaign.campaign)")
$Lines.Add("MESSAGES: $($Campaign.messageCount)")
$Lines.Add("WINDOW: $($Campaign.firstSend) -> $($Campaign.lastSend)")
$Lines.Add("=" * 88)

foreach ($m in $Campaign.messages) {
  $Lines.Add("")
  $Lines.Add(("# {0:D2} | {1}" -f [int]$m.id, $m.sendAt))
  $Lines.Add("TO: $($m.to)")
  $Lines.Add("ORG: $($m.organization)")
  $Lines.Add("RESOURCE: $($m.resourceName)")
  $Lines.Add("URL: $($m.resourceUrl)")
  $Lines.Add("SUBJECT: $($m.subject)")
  $Lines.Add("-" * 88)
  $Lines.Add($m.body)
  $Lines.Add("")
  $Lines.Add($Campaign.footer)
  $Lines.Add("=" * 88)
}

$Text = $Lines -join [Environment]::NewLine
$Text

if ($OutFile) {
  $Target = if ([IO.Path]::IsPathRooted($OutFile)) { $OutFile } else { Join-Path $Root $OutFile }
  $Text | Set-Content -Path $Target -Encoding UTF8
  Write-Host ""
  Write-Host "Preview written to: $Target" -ForegroundColor Green
}
