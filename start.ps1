# Fit Health 1-Click Launch Script for PowerShell
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "               FIT HEALTH - FULL STACK MOBILE APPLICATION" -ForegroundColor Cyan
Write-Host "       The Ultimate Gym Fitness Companion for the Health Conscious" -ForegroundColor White
Write-Host "                     (BCA Final Project Submission)" -ForegroundColor Yellow
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/2] Starting Node.js Backend Server on http://localhost:5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm.cmd run start"

Start-Sleep -Seconds 3

Write-Host "[2/2] Starting React Mobile Client on http://localhost:3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm.cmd run dev"

Write-Host ""
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "Services are running!" -ForegroundColor Green
Write-Host "Unified Link (Frontend + Backend): http://localhost:5000/" -ForegroundColor Cyan
Write-Host "Dev Frontend (Hot-Reload):          http://localhost:3000/" -ForegroundColor White
Write-Host "Backend API:                        http://localhost:5000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Yellow
Write-Host "  Email:    alex@fithealth.io" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host "=========================================================================" -ForegroundColor Green
