# fix-remove-AIJobMatcherWrapper.ps1
# Retire <AIJobMatcherWrapper ... /> (et son import si devenu inutile)
# de toutes les landing pages SEO, SAUF la page jobs principale.
#
# IMPORTANT :
#   1. Lance d'abord .\find-AIJobMatcherWrapper.ps1 et verifie la liste.
#   2. Commite ton travail en cours (git add -A ; git commit -m "before cleanup")
#      avant de lancer ce script : une suppression JSX par regex sur ~95 fichiers
#      merite un filet de securite, en plus des .bak crees automatiquement ci-dessous.
#
# Lance depuis la racine : .\fix-remove-AIJobMatcherWrapper.ps1

$rootPath = "C:\Users\basse\oh-my-job10"

# Chemin de la page jobs principale a EXCLURE (le composant y reste). ADAPTE si besoin.
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
        if ($path -match [regex]::Escape($mainJobsPagePattern)) { $exclude = $true }
        -not $exclude
    }

# Tag auto-fermant : <AIJobMatcherWrapper .../> (props eventuelles sur plusieurs lignes)
$selfClosingPattern = New-Object System.Text.RegularExpressions.Regex(
    '<AIJobMatcherWrapper\b(?:[^>]*?)/>',
    [System.Text.RegularExpressions.RegexOptions]::Singleline
)

# Tag avec enfants : <AIJobMatcherWrapper ...>...</AIJobMatcherWrapper>
$pairedPattern = New-Object System.Text.RegularExpressions.Regex(
    '<AIJobMatcherWrapper\b(?:[^>]*?)>.*?</AIJobMatcherWrapper>',
    [System.Text.RegularExpressions.RegexOptions]::Singleline
)

# Ligne d'import a retirer si le composant n'est plus utilise ensuite dans le fichier
$importPattern = New-Object System.Text.RegularExpressions.Regex(
    '^.*import\s+.*AIJobMatcherWrapper.*\r?\n',
    [System.Text.RegularExpressions.RegexOptions]::Multiline
)

$totalFixed = 0
$filesFixed = New-Object System.Collections.Generic.List[string]
$readErrors = New-Object System.Collections.Generic.List[string]

foreach ($file in $files) {
    try {
        $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
    } catch {
        $readErrors.Add($file.FullName)
        Write-Host "IGNORE (lecture impossible) :" $file.FullName -ForegroundColor DarkGray
        continue
    }

    if ([string]::IsNullOrEmpty($content)) { continue }
    if ($content -notmatch '<AIJobMatcherWrapper\b') { continue }

    $occurrences = 0
    $newContent = $content

    $occurrences += $pairedPattern.Matches($newContent).Count
    $newContent = $pairedPattern.Replace($newContent, '')

    $occurrences += $selfClosingPattern.Matches($newContent).Count
    $newContent = $selfClosingPattern.Replace($newContent, '')

    # Si le composant n'apparait plus du tout dans le fichier, retire aussi l'import
    if ($newContent -notmatch 'AIJobMatcherWrapper') {
        $newContent = $importPattern.Replace($newContent, '')
    }

    if ($occurrences -gt 0) {
        try {
            # Backup avant ecriture
            Copy-Item -LiteralPath $file.FullName -Destination "$($file.FullName).bak" -Force

            [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
            Write-Host "OK (" $occurrences ") :" $file.FullName -ForegroundColor Green
            $totalFixed += $occurrences
            $filesFixed.Add($file.FullName)
        } catch {
            Write-Host "ERREUR ECRITURE :" $file.FullName -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Cyan
if ($totalFixed -eq 0) {
    Write-Host "Rien a retirer (ou tout deja fait)." -ForegroundColor Green
} else {
    Write-Host $totalFixed "occurrence(s) retiree(s) dans" $filesFixed.Count "fichier(s)" -ForegroundColor Cyan
    Write-Host "Des fichiers .bak ont ete crees a cote de chaque fichier modifie." -ForegroundColor DarkGray
    Write-Host "Verifie le rendu (npm run dev / npm run build), puis supprime les .bak :" -ForegroundColor Yellow
    Write-Host "  Get-ChildItem -Path '$rootPath' -Recurse -Filter *.bak | Remove-Item" -ForegroundColor Yellow
}

if ($readErrors.Count -gt 0) {
    Write-Host ""
    Write-Host "Fichiers non lisibles (" $readErrors.Count ") - verifier manuellement :" -ForegroundColor Yellow
    foreach ($e in $readErrors) {
        Write-Host "  -" $e -ForegroundColor Yellow
    }
}