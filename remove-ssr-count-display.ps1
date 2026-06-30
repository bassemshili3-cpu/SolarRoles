# remove-ssr-count-display.ps1
# Retire le bloc d'affichage SSR du count (devenu redondant avec le count dynamique
# affiché desormais par JobList/InfiniteJobList lui-meme).
# Lance depuis la racine : .\remove-ssr-count-display.ps1

$rootPath = "C:\Users\basse\oh-my-job10\app"
$files = Get-ChildItem -Path $rootPath -Filter "page.tsx" -Recurse

$totalFixed = 0
$skipped = @()
$errors = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8

    # Ne traiter que les fichiers qui ont le bloc count SSR a retirer
    if ($content -notmatch "\{count > 0 &&") {
        continue
    }

    # Pattern : {count > 0 && (
    #             <p ...>
    #               <span ...>{count.toLocaleString()}</span> positions available
    #             </p>
    #           )}
    # Tres souple sur l'indentation et les attributs de classe
    $p1 = "(?s)[ \t]*\{(?:typeof count === 'number' && )?count > 0 && \([\s\S]*?\{count\.toLocaleString\(\)\}[\s\S]*?\)\}\r?\n"

    if ($content -match $p1) {
        $content = [regex]::Replace($content, $p1, "")
        try {
            [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
            Write-Host "OK : $($file.FullName)" -ForegroundColor Green
            $totalFixed++
        } catch {
            $errors += $file.FullName
            Write-Host "ERREUR : $($file.FullName)" -ForegroundColor Red
        }
    } else {
        $skipped += $file.FullName
        Write-Host "IGNORE (pattern non trouve malgre presence de 'count > 0') : $($file.FullName)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Modifies : $totalFixed" -ForegroundColor Cyan

if ($skipped.Count -gt 0) {
    Write-Host ""
    Write-Host "Ignores ($($skipped.Count)) :" -ForegroundColor Yellow
    $skipped | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Erreurs ($($errors.Count)) :" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}