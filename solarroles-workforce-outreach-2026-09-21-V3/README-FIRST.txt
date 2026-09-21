SOLAR ROLES — WORKFORCE RESOURCE OUTREACH — 2026-09-21 V3
================================================================

Campaign
--------
55 recipients.
ALL are Priority A, "Not contacted", Contacted? = No.
No journalists.
No old "Solar Apprenticeship Hours Checker"-only targets.
One organization/establishment per message.
Each recipient gets exactly ONE of the 8 current Workforce Resources pages.

Default schedule
----------------
Timezone: Europe/Paris
First send: 2026-09-21 16:10:00 +02:00
Last send:  2026-09-21 17:09:24 +02:00
Spacing: 66 seconds
Tasks: SolarRoles-Outreach-20260921-V3-01 ... -55

The ordering is intentionally roughly East -> Central -> Mountain -> national -> Pacific,
so the window lands closer to normal U.S. morning business hours across time zones.

IMPORTANT — credentials
-----------------------
smtp-credential.xml is NOT shipped in this ZIP because it contains a Windows-DPAPI
encrypted SMTP credential tied to your own Windows account/machine.

The first REAL run of register.ps1 asks for the IONOS password for pr@solarroles.com
and creates smtp-credential.xml locally.

Recommended workflow
--------------------
1) Extract the ZIP.
2) Open PowerShell in this folder.
3) If Windows blocks downloaded scripts:

   Get-ChildItem *.ps1 | Unblock-File

   If execution policy still blocks them for the current window only:

   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

4) Review the schedule only (creates NOTHING):

   .\register.ps1 -PreviewOnly

5) Review every full personalized email:

   .\preview-all.ps1

   Or also save the preview to a text file:

   .\preview-all.ps1 -OutFile preview.txt

6) Validate all unique resource URLs:

   .\validate-resource-urls.ps1

7) Register the 55 scheduled sends:

   .\register.ps1

   On first real registration you will be prompted for the IONOS SMTP password.

8) To cancel this campaign before it runs:

   .\unregister-v3.ps1

Files
-----
campaign.json                Campaign config + 55 personalized messages
resource-map.csv             Human-readable recipient/resource/schedule map
preview-all.ps1              Prints every final email including footer
validate-resource-urls.ps1   Checks all unique campaign resource URLs
register.ps1                 Validates + stores SMTP credential + creates Windows tasks
launch.ps1                   Internal launcher used by each Scheduled Task
send-scheduled-email.mjs     Direct SMTP sender (Node built-ins only; no npm dependency)
unregister-v3.ps1            Removes this campaign's tasks
error-log.jsonl              Send/error log (initially empty)

Footer used on every message
----------------------------
Best,
Bassem
Founder, Solar Roles
539 W. Commerce St
Dallas, TX 75208

Solar Roles promotional outreach — free educator resources.
If you prefer not to receive educator-resource notes from us, reply "remove".

Widget rule
-----------
For widget-target recipients, the email link is preloaded by state using:
  /workforce-resources/jobs-widget?state=XX&limit=6

The widget's own "Browse more solar jobs" link should remain:
  https://www.solarroles.com/jobs
with anchor text:
  Browse more solar jobs

Do not change that fallback/link to a state-filtered /jobs?where=... URL.

Security note
-------------
Do not commit smtp-credential.xml to Git. It is intentionally created locally only.
