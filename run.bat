@echo off
title Fit Health - Ultimate Gym Fitness Companion
echo =========================================================================
echo               FIT HEALTH - FULL STACK MOBILE APPLICATION
echo       The Ultimate Gym Fitness Companion for the Health Conscious
echo                     (BCA Final Project Submission)
echo =========================================================================
echo.

echo [1/2] Launching Backend Server on port 5000...
start "Fit Health - Backend API (Port 5000)" cmd /k "cd backend && npm.cmd run start"

timeout /t 3 /nobreak >nul

echo [2/2] Launching Frontend Mobile App on port 3000...
start "Fit Health - Mobile Client (Port 3000)" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo =========================================================================
echo Fit Health Unified Full Stack Application Running!
echo   * Unified Link (Frontend + Backend): http://localhost:5000/
echo   * Dev Frontend (Hot-Reload):          http://localhost:3000/
echo   * Health API Endpoint:               http://localhost:5000/api/health
echo.
echo Demo Credentials:
echo   Email:    alex@fithealth.io
echo   Password: password123
echo =========================================================================
echo.
pause
