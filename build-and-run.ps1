$ErrorActionPreference = 'Stop'

# Stop any stale Omnichannel process
Get-Process Omnichannel -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OMNICHANNEL - Full Stack Build & Run" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Build Frontend
Write-Host "[BUILD] Building Frontend..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot/frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "   Installing dependencies..." -ForegroundColor Gray
    npm install
}

Write-Host "   Building and syncing to wwwroot..." -ForegroundColor Gray
npm run build:sync

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Frontend built successfully!" -ForegroundColor Green
Write-Host ""

# Run Backend
Write-Host "[RUN] Starting Backend on http://localhost:5285..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
dotnet run --launch-profile http

Write-Host ""
Write-Host "[OK] Omnichannel is ready at http://localhost:5285" -ForegroundColor Green
