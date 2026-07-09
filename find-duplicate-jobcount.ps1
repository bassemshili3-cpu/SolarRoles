# find-duplicate-jobcount.ps1
# Cherche le pattern :
#   const [{ count }, initialData] = await Promise.all([
#     getMergedJobCount({...}),
#     searchMergedJobs({...}),
#   ])
# searchMergedJobs retourne deja { results, count } donc getMergedJobCount
# est redondant QUAND les deux appels utilisent les memes arguments.
# Ce script separe les fichiers "surs" (args identiques -> auto-fixables)
# des fichiers "a verifier" (args differents -> filtres additionnels
# possibles dans getMergedJobCount que searchMergedJobs ne supporte pas).
#
# Lance depuis la racine : .\find-duplicate-jobcount.ps1

$rootPath = "C:\Users\basse\oh-my-job10"

$includeExtensions = @("*.tsx", "*.ts")
$excludeDirs = @("node_modules", ".next", ".git", "dist", "build")

$files = Get-ChildItem -Path $rootPath -Recurse -Include $includeExtensions -File |
    Where-Object {
        $path = $_.FullName
        $exclude = $false
        foreach ($dir in $excludeDirs) {
            if ($path -match [regex]::Escape("\$dir\")) { $exclude = $true }
        }
        -not $exclude
    }

$blockPattern = New-Object System.Text.RegularExpressions.Regex(
    'const\s*\[\{\s*count\s*\},\s*initialData\]\s*=\s*await\s*Promise\.all\(\[\s*getMergedJobCount\(\{(?<countArgs>.*?)\}\),\s*searchMergedJobs\(\{(?<searchArgs>.*?)\}\),?\s*\]\)',
    [System.Text.RegularExpressions.RegexOptions]::Singleline
)

$safeFiles = New-Object System.Collections.Generic.List[string]
$reviewFiles = New-Object System.Collections.Generic.List[PSCustomObject]

foreach ($file in $files) {
    try {
        $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
    } catch {
        Write-Host "IGNORE (lecture impossible) : $($file.FullName)" -ForegroundColor DarkGray
        continue
    }

    if ([string]::IsNullOrEmpty($content)) { continue }

    $match = $blockPattern.Match($content)
    if (-not $match.Success) { continue }

    $countArgsNorm  = ($match.Groups['countArgs'].Value  -replace '\s+', '')
    $searchArgsNorm = ($match.Groups['searchArgs'].Value -replace '\s+', '')

    if ($countArgsNorm -eq $searchArgsNorm) {
        $safeFiles.Add($file.FullName)
    } else {
        $reviewFiles.Add([PSCustomObject]@{
            File       = $file.FullName
            CountArgs  = $match.Groups['countArgs'].Value.Trim()
            SearchArgs = $match.Groups['searchArgs'].Value.Trim()
        })
    }
}

Write-Host "=== FICHIERS AUTO-FIXABLES (arguments identiques) : $($safeFiles.Count) ===" -ForegroundColor Green
foreach ($f in $safeFiles) { Write-Host "  $f" -ForegroundColor White }

Write-Host ""
Write-Host "=== FICHIERS A VERIFIER MANUELLEMENT (arguments differents) : $($reviewFiles.Count) ===" -ForegroundColor Yellow
foreach ($r in $reviewFiles) {
    Write-Host "  $($r.File)" -ForegroundColor Cyan
    Write-Host "    getMergedJobCount({ $($r.CountArgs) })" -ForegroundColor DarkGray
    Write-Host "    searchMergedJobs({ $($r.SearchArgs) })" -ForegroundColor DarkGray
    Write-Host ""
}

Write-Host "──────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "$($safeFiles.Count) fichier(s) seront corriges automatiquement par fix-duplicate-jobcount.ps1" -ForegroundColor Yellow
Write-Host "$($reviewFiles.Count) fichier(s) ont des filtres differents entre count et search -> a corriger a la main" -ForegroundColor Yellow
Write-Host "(ces filtres supplementaires ne sont probablement pas pris en compte par searchMergedJobs :" -ForegroundColor DarkGray
Write-Host " jobTypes, arrangements, experience, education, companySizes, benefits, easyApply, visaSponsorship, postedWithin)" -ForegroundColor DarkGray