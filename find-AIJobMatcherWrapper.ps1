# find-AIJobMatcherWrapper.ps1
# Cherche toutes les utilisations de <AIJobMatcherWrapper /> dans le projet,
# pour verifier lesquelles retirer des landing pages SEO
# (a garder uniquement sur la page jobs principale).
#
# Lance depuis la racine : .\find-AIJobMatcherWrapper.ps1

$rootPath = "C:\Users\basse\oh-my-job10"

# Chemin de la page jobs principale a EXCLURE de la suppression
# (le composant doit y rester). ADAPTE cette valeur si besoin.
$mainJobsPagePattern = "app\jobs\page.tsx"

$includeExtensions = @("*.tsx", "*.jsx")
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

$pattern = '<AIJobMatcherWrapper\b'

$foundLines = New-Object System.Collections.Generic.List[PSCustomObject]

foreach ($file in $files) {
    try {
        $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
    } catch {
        Write-Host "IGNORE (lecture impossible) : $($file.FullName)" -ForegroundColor DarkGray
        continue
    }

    if ([string]::IsNullOrEmpty($content)) { continue }
    if ($content -notmatch $pattern) { continue }

    $isMainPage = $file.FullName -match [regex]::Escape($mainJobsPagePattern)

    $lineNumber = 0
    $lines = $content -split "`r?`n"
    foreach ($line in $lines) {
        $lineNumber++
        if ($line -match $pattern) {
            $foundLines.Add([PSCustomObject]@{
                File       = $file.FullName
                Line       = $lineNumber
                Code       = $line.Trim()
                IsMainPage = $isMainPage
            })
        }
    }
}

if ($foundLines.Count -eq 0) {
    Write-Host "Aucune utilisation de <AIJobMatcherWrapper /> trouvee." -ForegroundColor Green
} else {
    Write-Host "Trouve $($foundLines.Count) occurrence(s) de <AIJobMatcherWrapper /> :" -ForegroundColor Yellow
    Write-Host ""

    $grouped = $foundLines | Group-Object File

    foreach ($group in $grouped) {
        $color = if ($group.Group[0].IsMainPage) { "Green" } else { "Cyan" }
        $tag = if ($group.Group[0].IsMainPage) { " [PAGE PRINCIPALE - a garder]" } else { " [landing page - a retirer]" }
        Write-Host "$($group.Name)$tag" -ForegroundColor $color
        foreach ($m in $group.Group) {
            Write-Host "  Ligne $($m.Line) : $($m.Code)" -ForegroundColor White
        }
        Write-Host ""
    }

    $toRemove = ($foundLines | Where-Object { -not $_.IsMainPage } | Group-Object File).Count
    Write-Host "──────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "$toRemove fichier(s) landing page a nettoyer, page(s) principale(s) preservee(s)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verifie attentivement la liste ci-dessus (surtout le format exact du tag)," -ForegroundColor Yellow
    Write-Host "puis lance : .\fix-remove-AIJobMatcherWrapper.ps1" -ForegroundColor Yellow
}