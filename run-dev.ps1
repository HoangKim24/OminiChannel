$ErrorActionPreference = 'Stop'

# Stop any stale Omnichannel process to avoid file-lock build errors.
Get-Process Omnichannel -ErrorAction SilentlyContinue | Stop-Process -Force

Set-Location $PSScriptRoot
Write-Host 'Starting Omnichannel on launch profile http...'
dotnet run --launch-profile http
