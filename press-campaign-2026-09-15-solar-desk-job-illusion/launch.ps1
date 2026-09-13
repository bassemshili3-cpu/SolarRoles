param([Parameter(Mandatory=$true)][int]$Index)
$ErrorActionPreference = 'Stop'
$runner = Join-Path $PSScriptRoot 'send-scheduled-email.mjs'
$nodeProcess = Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' -ArgumentList @(('"' + $runner + '"'), '--index', $Index) -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -Wait -PassThru
exit $nodeProcess.ExitCode
