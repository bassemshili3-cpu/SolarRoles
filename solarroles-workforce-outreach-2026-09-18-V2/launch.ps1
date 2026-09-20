param(
    [Parameter(Mandatory=$true)]
    [int]$Index
)

$ErrorActionPreference = "Stop"
$CampaignDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$CampaignPath = Join-Path $CampaignDir "campaign.json"
$Renderer = Join-Path $CampaignDir "send-scheduled-email.mjs"
$CredentialPath = Join-Path $CampaignDir "smtp-credential.xml"
$ErrorLog = Join-Path $CampaignDir "error-log.jsonl"

function Write-ErrorLog([string]$Stage, [string]$Message) {
    $entry = [ordered]@{
        ts = (Get-Date).ToString("o")
        index = $Index
        stage = $Stage
        message = $Message
    } | ConvertTo-Json -Compress
    Add-Content -LiteralPath $ErrorLog -Value $entry -Encoding UTF8
}

try {
    if (-not (Test-Path $CredentialPath)) {
        throw "Missing smtp-credential.xml. Run .\\register.ps1 first."
    }

    $payloadJson = & node $Renderer --campaign $CampaignPath --index $Index
    if ($LASTEXITCODE -ne 0) { throw "Renderer exited with code $LASTEXITCODE" }
    $payload = $payloadJson | ConvertFrom-Json

    $campaign = Get-Content -LiteralPath $CampaignPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $cred = Import-Clixml -LiteralPath $CredentialPath
    $plainPassword = $cred.GetNetworkCredential().Password

    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

    $mail = New-Object System.Net.Mail.MailMessage
    $mail.From = New-Object System.Net.Mail.MailAddress("pr@solarroles.com", "Solar Roles")
    [void]$mail.To.Add([string]$payload.to)
    $mail.Subject = [string]$payload.subject
    $mail.Body = [string]$payload.body
    $mail.IsBodyHtml = $false
    $mail.SubjectEncoding = [System.Text.Encoding]::UTF8
    $mail.BodyEncoding = [System.Text.Encoding]::UTF8

    $smtp = New-Object System.Net.Mail.SmtpClient([string]$campaign.smtpHost, [int]$campaign.smtpPort)
    $smtp.EnableSsl = $true
    $smtp.UseDefaultCredentials = $false
    $smtp.Credentials = New-Object System.Net.NetworkCredential($cred.UserName, $plainPassword)
    $smtp.Timeout = 60000

    $smtp.Send($mail)
    Write-Host ("SENT V2 [{0:D2}/32 | old #{1}] {2} -> {3}" -f ($Index + 1), $payload.originalHumanNumber, $payload.organization, $payload.to)

    $mail.Dispose()
    $smtp.Dispose()
}
catch {
    Write-ErrorLog -Stage "send" -Message $_.Exception.Message
    Write-Error $_
    exit 1
}
