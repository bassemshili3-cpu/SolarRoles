$CampaignDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$CampaignPath = Join-Path $CampaignDir "campaign.json"
$Renderer = Join-Path $CampaignDir "send-scheduled-email.mjs"
$campaign = Get-Content -LiteralPath $CampaignPath -Raw -Encoding UTF8 | ConvertFrom-Json

foreach ($m in $campaign.messages) {
    $json = & node $Renderer --campaign $CampaignPath --index $m.index
    if ($LASTEXITCODE -ne 0) { throw "Renderer failed at index $($m.index)" }
    $p = $json | ConvertFrom-Json
    Write-Host "============================================================"
    Write-Host ("V2 #{0:D2} (old #{1}) | {2} | {3}" -f ($m.index + 1), $m.originalHumanNumber, $m.scheduledAt, $m.organization)
    Write-Host ("TO: " + $p.to)
    Write-Host ("SUBJECT: " + $p.subject)
    Write-Host ("RESOURCE: " + $p.resourceLabel)
    Write-Host ("URL: " + $p.resourceUrl)
    Write-Host ""
    Write-Host $p.body
    Write-Host ""
}
