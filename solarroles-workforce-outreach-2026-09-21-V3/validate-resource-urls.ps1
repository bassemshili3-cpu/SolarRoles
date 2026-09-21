param(
  [int]$TimeoutSec = 20
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Campaign = Get-Content (Join-Path $Root "campaign.json") -Raw -Encoding UTF8 | ConvertFrom-Json

$Urls = @($Campaign.messages | ForEach-Object { $_.resourceUrl } | Sort-Object -Unique)
$Failed = @()

Write-Host "Validating $($Urls.Count) unique campaign URLs..." -ForegroundColor Cyan

foreach ($Url in $Urls) {
  $Ok = $false
  $Code = $null
  try {
    $r = Invoke-WebRequest -Uri $Url -Method Head -MaximumRedirection 8 -TimeoutSec $TimeoutSec -UserAgent "SolarRoles-Outreach-Validator/1.0" -UseBasicParsing -ErrorAction Stop
    $Code = [int]$r.StatusCode
    $Ok = ($Code -ge 200 -and $Code -lt 400)
  }
  catch {
    $resp = $_.Exception.Response
    if ($resp -and $resp.StatusCode) {
      try { $Code = [int]$resp.StatusCode } catch {}
    }

    # Some hosts reject HEAD; retry with GET.
    if ($Code -in 405, 403 -or -not $Code) {
      try {
        $r = Invoke-WebRequest -Uri $Url -Method Get -MaximumRedirection 8 -TimeoutSec $TimeoutSec -UserAgent "SolarRoles-Outreach-Validator/1.0" -UseBasicParsing -ErrorAction Stop
        $Code = [int]$r.StatusCode
        $Ok = ($Code -ge 200 -and $Code -lt 400)
      }
      catch {
        $resp = $_.Exception.Response
        if ($resp -and $resp.StatusCode) {
          try { $Code = [int]$resp.StatusCode } catch {}
        }
      }
    }

    # 429 still means the route exists; do not fail campaign registration on rate limiting.
    if ($Code -eq 429) { $Ok = $true }
  }

  if ($Ok) {
    $DisplayCode = if ($null -eq $Code) { "?" } else { $Code }
    Write-Host ("[OK] {0} {1}" -f $DisplayCode, $Url) -ForegroundColor Green
  } else {
    $DisplayCode = if ($null -eq $Code) { "?" } else { $Code }
    Write-Host ("[FAIL] {0} {1}" -f $DisplayCode, $Url) -ForegroundColor Red
    $Failed += $Url
  }
}

if ($Failed.Count -gt 0) {
  throw "$($Failed.Count) URL(s) failed validation. Fix them before registering tasks."
}

Write-Host "All campaign resource URLs are reachable." -ForegroundColor Green
