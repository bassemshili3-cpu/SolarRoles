$ErrorActionPreference = "Continue"
$CampaignDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$campaign = Get-Content -LiteralPath (Join-Path $CampaignDir "campaign.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$urls = $campaign.messages | Select-Object -ExpandProperty resourceUrl -Unique
foreach ($url in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $url -Method Head -MaximumRedirection 5 -TimeoutSec 20 -UseBasicParsing -ErrorAction Stop
        Write-Host ("{0}  {1}" -f [int]$r.StatusCode, $url)
    } catch {
        $code = $null
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            try { $code = [int]$_.Exception.Response.StatusCode } catch {}
        }
        if ($code -eq 429) { Write-Host "429  $url  (reachable/rate-limited)" }
        else { Write-Warning "$url -> $($_.Exception.Message)" }
    }
}
