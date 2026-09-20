SOLAR ROLES OUTREACH — V2 — 18 SEPTEMBER 2026
====================================================

This folder is standalone. It contains ONLY the 32 unsent recipients from old messages #14-45.

Schedule (Europe/Paris):
- First email: 15:30:00
- Last email: 16:29:56
- 32 emails total
- 116 seconds between sends

IMPORTANT — use this folder instead of the old campaign folder.
The old folder can be deleted.

HOW TO RUN
----------
1. Extract this folder somewhere permanent, for example:
   C:\Users\basse\SolarRoles\solarroles-workforce-outreach-2026-09-18-V2

2. Open PowerShell in THIS V2 folder.

3. Optional but recommended preview:
   .\register.ps1 -PreviewOnly

4. Register the real campaign:
   .\register.ps1

   On the first run, Windows will ask for the IONOS mailbox password for pr@solarroles.com.
   It is saved locally as smtp-credential.xml encrypted with Windows DPAPI.

WHAT REGISTER.PS1 DOES
----------------------
- Removes any old V1 Windows scheduled tasks numbered 14-45 so they cannot send duplicates.
- Checks every personalized resource URL before registering V2.
- Creates 32 new tasks named SolarRoles-Outreach-20260918-V2-01 through V2-32.
- Skips any scheduled time that has already passed.

PERSONALIZATION
---------------
Every email has an explicit individual resource URL. The renderer refuses to send if a V2 message falls back to the generic /workforce-resources hub.

Useful files:
- campaign.json                 32 recipients + schedule + personalized resource choices
- resource-map.csv              quick audit of recipient -> resource -> URL
- preview-all.ps1               renders all 32 full emails without sending
- validate-resource-urls.ps1    checks unique URLs
- unregister-v2.ps1             cancels all V2 scheduled tasks
- error-log.jsonl               send errors, if any

STOPPING THE CAMPAIGN
---------------------
Run:
   .\unregister-v2.ps1

Do not delete this V2 folder while scheduled tasks are still pending, because each task launches files from this folder.
