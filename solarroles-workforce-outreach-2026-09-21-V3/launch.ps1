param(
  [Parameter(Mandatory = $true)]
  [int]$MessageIndex
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$CredentialPath = Join-Path $Root "smtp-credential.xml"
$SenderScript = Join-Path $Root "send-scheduled-email.mjs"

if (-not (Test-Path $CredentialPath)) {
  throw "Missing smtp-credential.xml. Run .\register.ps1 first."
}

$Node = Get-Command node -ErrorAction Stop
$Cred = Import-Clixml -Path $CredentialPath

$Bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Cred.Password)
try {
  $PlainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($Bstr)
  $env:SOLARROLES_SMTP_USER = $Cred.UserName
  $env:SOLARROLES_SMTP_PASS = $PlainPassword

  & $Node.Source $SenderScript --index $MessageIndex
  if ($LASTEXITCODE -ne 0) {
    throw "send-scheduled-email.mjs exited with code $LASTEXITCODE"
  }
}
finally {
  if ($Bstr -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($Bstr)
  }
  Remove-Item Env:SOLARROLES_SMTP_USER -ErrorAction SilentlyContinue
  Remove-Item Env:SOLARROLES_SMTP_PASS -ErrorAction SilentlyContinue
  $PlainPassword = $null
}
