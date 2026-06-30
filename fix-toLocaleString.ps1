# fix-toLocaleString.ps1
# Remplace tous les .toLocaleString() sans argument par .toLocaleString('en-US')
# dans tout le projet, pour eviter les erreurs d'hydratation Next.js.
#
# IMPORTANT : lance d'abord .\find-toLocaleString.ps1 pour verifier la liste
# avant de lancer ce script, qui modifie les fichiers directement.
#
# Lance depuis la racine : .\fix-toLocaleString.ps1

$rootPath = "C:\Users\basse\oh-my-job10"

$includeExtensions = @("*.tsx", "*.ts", "*.jsx", "*.js")
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

$pattern = '\.toLocaleString\(\s*\)'
$replacement = ".toLocaleString('en-US')"

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

    if ($content -match $pattern) {
        $occurrences = ([regex]::Matches($content, $pattern)).Count
        $newContent = [regex]::Replace($content, $pattern, $replacement)

        try {
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
    Write-Host "Rien a corriger." -ForegroundColor Green
} else {
    Write-Host $totalFixed "occurrence(s) corrigee(s) dans" $filesFixed.Count "fichier(s)" -ForegroundColor Cyan
}

if ($readErrors.Count -gt 0) {
    Write-Host ""
    Write-Host "Fichiers non lisibles (" $readErrors.Count ") - verifier manuellement :" -ForegroundColor Yellow
    foreach ($e in $readErrors) {
        Write-Host "  -" $e -ForegroundColor Yellow
    }
}