# find-toLocaleString.ps1
# Cherche tous les .toLocaleString() sans argument de locale dans le projet.
# Ces appels sont une source classique d'erreurs d'hydratation Next.js
# (Server: "1175" vs Client: "1,175") car le formatage depend de la locale
# de l'environnement d'execution, qui differe entre le serveur et le navigateur.
#
# Lance depuis la racine : .\find-toLocaleString.ps1

$rootPath = "C:\Users\basse\oh-my-job10"

$includeExtensions = @("*.tsx", "*.ts", "*.jsx", "*.js")
$excludeDirs = @("node_modules", ".next", ".git", "dist", "build")

# -LiteralPath via Get-ChildItem -Recurse standard ; le filtre d'exclusion se fait sur le chemin texte
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

# $matches est une variable automatique reservee par PowerShell (utilisee par -match) :
# on utilise un nom different pour eviter le conflit.
$foundLines = New-Object System.Collections.Generic.List[PSCustomObject]

foreach ($file in $files) {
    # -LiteralPath gere correctement les fichiers avec [ ] dans le nom (ex: [id], [state])
    # que Get-Content interprete sinon comme des wildcards.
    try {
        $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
    } catch {
        Write-Host "IGNORE (lecture impossible) : $($file.FullName)" -ForegroundColor DarkGray
        continue
    }

    if ([string]::IsNullOrEmpty($content)) { continue }

    $lineNumber = 0
    $lines = $content -split "`r?`n"
    foreach ($line in $lines) {
        $lineNumber++
        if ($line -match $pattern) {
            $foundLines.Add([PSCustomObject]@{
                File = $file.FullName
                Line = $lineNumber
                Code = $line.Trim()
            })
        }
    }
}

if ($foundLines.Count -eq 0) {
    Write-Host "Aucun .toLocaleString() sans locale trouve. Tout est propre !" -ForegroundColor Green
} else {
    Write-Host "Trouve $($foundLines.Count) occurrence(s) de .toLocaleString() sans locale explicite :" -ForegroundColor Yellow
    Write-Host ""

    $grouped = $foundLines | Group-Object File

    foreach ($group in $grouped) {
        Write-Host $group.Name -ForegroundColor Cyan
        foreach ($m in $group.Group) {
            Write-Host "  Ligne $($m.Line) : $($m.Code)" -ForegroundColor White
        }
        Write-Host ""
    }

    Write-Host "──────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "$($foundLines.Count) occurrence(s) dans $($grouped.Count) fichier(s)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour corriger automatiquement, lance : .\fix-toLocaleString.ps1" -ForegroundColor Yellow
}