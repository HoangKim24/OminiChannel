$ErrorActionPreference = 'Stop'

# Stop any stale Omnichannel process
Get-Process Omnichannel -ErrorAction SilentlyContinue | Stop-Process -Force

Set-Location $PSScriptRoot
Write-Host ""
Write-Host "[RUN] Starting Omnichannel on http://localhost:5285..." -ForegroundColor Cyan
Write-Host "      (Frontend is served from backend's wwwroot)" -ForegroundColor Gray
Write-Host ""

dotnet run --launch-profile http

Write-Host ""
Write-Host "[OK] Omnichannel is running at http://localhost:5285" -ForegroundColor Green
