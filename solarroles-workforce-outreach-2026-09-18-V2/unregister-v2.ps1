$ErrorActionPreference = "Continue"
$removed = 0
1..32 | ForEach-Object {
    $taskName = "SolarRoles-Outreach-20260918-V2-{0:D2}" -f $_
    if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        Write-Host "Removed $taskName"
        $removed++
    }
}
Write-Host "Removed $removed V2 task(s)."
