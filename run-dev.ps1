$ErrorActionPreference = 'Stop'

# Stop any stale Omnichannel process to avoid file-lock build errors.
Get-Process Omnichannel -ErrorAction SilentlyContinue | Stop-Process -Force

Set-Location $PSScriptRoot
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OMNICHANNEL - Backend Dev Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[RUN] Starting on http://localhost:5285" -ForegroundColor Yellow
Write-Host "      (Assumes frontend is already built in wwwroot)" -ForegroundColor Gray
Write-Host ""
dotnet run --launch-profile http
