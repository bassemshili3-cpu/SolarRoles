# replace-merged-search.ps1
# Lance depuis la racine du projet : .\replace-merged-search.ps1

$rootPath = "C:\Users\basse\oh-my-job10\app"
$files = Get-ChildItem -Path $rootPath -Filter "page.tsx" -Recurse

$S = [System.Text.RegularExpressions.RegexOptions]::Singleline
$M = [System.Text.RegularExpressions.RegexOptions]::Multiline
$I = [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
$SM = $S -bor $M

$totalFixed = 0
$skipped    = @()
$errors     = @()

foreach ($file in $files) {
    # Lecture sans -Raw (compatible PS2/PS3)
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)

    # 1. Ignorer les fichiers sans appel job search
    if ($content -notmatch "getMergedJobCount|searchMergedJobs|getCachedJobCount|searchJobs|buildJobWhere") {
        Write-Host "IGNORE (pas de job search) : $($file.FullName)" -ForegroundColor DarkGray
        continue
    }

    # 2. Extraire le mot-cle par defaut
    $kwMatch = [regex]::Match($content, "(?:getSingleValue[^|]+\|\|\s*'([^']+)'|(?:params\.what|what)\s*\|\|\s*'([^']+)')")
    if (-not $kwMatch.Success) {
        $skipped += $file.FullName + " (mot-cle introuvable)"
        Write-Host "IGNORE (mot-cle) : $($file.FullName)" -ForegroundColor Yellow
        continue
    }
    $kw = if ($kwMatch.Groups[1].Value) { $kwMatch.Groups[1].Value } else { $kwMatch.Groups[2].Value }

    # 3. Supprimer imports adzuna
    $content = [regex]::Replace($content,
        "import\s*\{[^}]*(?:searchJobs|getCachedJobCount|AdzunaSearchResult)[^}]*\}\s*from\s*'[^']+'\r?\n?", "")

    # 4. Supprimer import normalizeAdzuna
    $content = [regex]::Replace($content,
        "import\s*\{[^}]*normalizeAdzuna[^}]*\}\s*from\s*'[^']+'\r?\n?", "")

    # 5. Supprimer imports prisma / buildJobWhere injectes par erreur
    $content = [regex]::Replace($content,
        "import\s*\{[^}]*(?:prisma|buildJobWhere)[^}]*\}\s*from\s*'[^']+'\r?\n?", "")

    # 6. Remplacer/ajouter import getMergedJobCount + searchMergedJobs
    $newImport = "import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'"
    $existingImportMatch = [regex]::Match($content, "import\s*\{[^}]*(?:getMergedJobCount|searchMergedJobs)[^}]*\}\s*from\s*'[^']+'")
    if ($existingImportMatch.Success) {
        $content = [regex]::Replace($content, "import\s*\{[^}]*(?:getMergedJobCount|searchMergedJobs)[^}]*\}\s*from\s*'[^']+'", $newImport)
    } else {
        $allImports = [regex]::Matches($content, "import[^\n]+\n")
        if ($allImports.Count -gt 0) {
            $last = $allImports[$allImports.Count - 1]
            $insertPos = $last.Index + $last.Length
            $content = $content.Substring(0, $insertPos) + $newImport + "`n" + $content.Substring($insertPos)
        }
    }

    # 7. Supprimer variables intermediaires (what/where/salaryMin/salaryMinStr)
    $content = [regex]::Replace($content,
        "(?m)^[ \t]*const (?:what|where|salaryMin|salaryMinStr)\s*=\s*[^\r\n]+\r?\n", "")

    # 8. Supprimer bloc salaryMinNum
    $content = [regex]::Replace($content,
        "(?s)\r?\n[ \t]*//[^\r\n]*\r?\n[ \t]*let salaryMinNum[^}]+\}\r?\n", "`n")

    # 9. Remplacer le bloc Promise.all avec RegexOptions::Singleline explicite
    $newBlock = "  const [{ count }, initialData] = await Promise.all([`n    getMergedJobCount({ what: params.what || '$kw', where: params.where || '' }),`n    searchMergedJobs({ what: params.what || '$kw', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),`n  ])"

    # Pattern A : mauvaise migration precedente — prisma.job.count + buildJobWhere
    $pA = "const \[\{\s*count\s*\},\s*initialData\]\s*=\s*await\s+Promise\.all\(\[\s*prisma\.job\.count\(\{.*?\}\),\s*searchMergedJobs\(\{.*?\}\),?\s*\]\)"

    # Pattern B : ancienne API Adzuna — getCachedJobCount + searchJobs
    $pB = "const \[\{\s*count\s*\},\s*initialData\]\s*=\s*await\s+Promise\.all\(\[.*?getCachedJobCount\(.*?\),.*?searchJobs\(\{.*?\}\).*?\]\)"

    # Pattern C : getMergedJobCount args positionnels + searchMergedJobs
    $pC = "const \[\{\s*count\s*\},\s*initialData\]\s*=\s*await\s+Promise\.all\(\[\s*getMergedJobCount\([^,\]]+,[^,\]]+(?:,[^,\]]+)?\),\s*searchMergedJobs\(\{.*?\}\),?\s*\]\)"

    # Pattern D : getMergedJobCount objet nomme + searchMergedJobs
    $pD = "const \[\{\s*count\s*\},\s*initialData\]\s*=\s*await\s+Promise\.all\(\[\s*getMergedJobCount\(\{.*?\}\),\s*searchMergedJobs\(\{.*?\}\),?\s*\]\)"

    $matched = $false
    foreach ($pat in @($pA, $pB, $pC, $pD)) {
        $m = [regex]::Match($content, $pat, $S)
        if ($m.Success) {
            $content = [regex]::Replace($content, $pat, $newBlock, $S)
            $matched = $true
            break
        }
    }

    if (-not $matched) {
        $skipped += $file.FullName + " (Promise.all non trouve)"
        Write-Host "IGNORE (Promise.all) : $($file.FullName)" -ForegroundColor Yellow
        continue
    }

    # 10. Corriger references JSX aux variables supprimees
    $content = $content -replace '\bwhat=\{what\}',               "what={params.what || '$kw'}"
    $content = $content -replace '\bwhere=\{where\}',             "where={params.where || ''}"
    $content = $content -replace '\bsalary_min=\{salaryMinStr\}', 'salary_min={params.salary_min}'
    $content = $content -replace '\bdefaultWhat=\{what\}',        "defaultWhat={params.what || '$kw'}"

    # 11. Sauvegarder
    try {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "OK [$kw] : $($file.FullName)" -ForegroundColor Green
        $totalFixed++
    } catch {
        $errors += $file.FullName
        Write-Host "ERREUR ecriture : $($file.FullName)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Modifies : $totalFixed fichier(s)" -ForegroundColor Cyan

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