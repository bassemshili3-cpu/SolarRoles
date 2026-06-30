# find-duplicate-jobfilters.ps1
# Cherche tous les fichiers nommes JobFilters (toutes extensions), et tous
# les endroits qui definissent RadioOption ou CheckOption, pour detecter
# un doublon ou un mauvais chemin d'import.
#
# Lance depuis la racine : .\find-duplicate-jobfilters.ps1

$rootPath = "C:\Users\basse\oh-my-job10"
$excludeDirs = @("node_modules", ".next", ".git", "dist", "build")

Write-Host "=== Fichiers nommes JobFilters (toutes extensions) ===" -ForegroundColor Cyan
Get-ChildItem -Path $rootPath -Recurse -File -Filter "JobFilters.*" |
    Where-Object {
        $path = $_.FullName
        $exclude = $false
        foreach ($dir in $excludeDirs) {
            if ($path -match [regex]::Escape("\$dir\")) { $exclude = $true }
        }
        -not $exclude
    } |
    ForEach-Object { Write-Host $_.FullName -ForegroundColor White }

Write-Host ""
Write-Host "=== Fichiers definissant RadioOption (function ou const) ===" -ForegroundColor Cyan
Get-ChildItem -Path $rootPath -Recurse -Include "*.tsx","*.ts","*.jsx","*.js" -File |
    Where-Object {
        $path = $_.FullName
        $exclude = $false
        foreach ($dir in $excludeDirs) {
            if ($path -match [regex]::Escape("\$dir\")) { $exclude = $true }
        }
        -not $exclude
    } |
    ForEach-Object {
        try {
            $content = Get-Content -LiteralPath $_.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            if ($content -match "function RadioOption|const RadioOption") {
                Write-Host $_.FullName -ForegroundColor White
            }
        } catch {}
    }

Write-Host ""
Write-Host "=== Tous les imports de JobFilters dans le projet ===" -ForegroundColor Cyan
Get-ChildItem -Path $rootPath -Recurse -Include "*.tsx","*.ts","*.jsx","*.js" -File |
    Where-Object {
        $path = $_.FullName
        $exclude = $false
        foreach ($dir in $excludeDirs) {
            if ($path -match [regex]::Escape("\$dir\")) { $exclude = $true }
        }
        -not $exclude
    } |
    ForEach-Object {
        try {
            $content = Get-Content -LiteralPath $_.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            $lines = $content -split "`r?`n"
            $lineNum = 0
            foreach ($line in $lines) {
                $lineNum++
                if ($line -match "import.*JobFilters") {
                    Write-Host ($_.FullName + " (ligne " + $lineNum + ") : " + $line.Trim()) -ForegroundColor White
                }
            }
        } catch {}
    }