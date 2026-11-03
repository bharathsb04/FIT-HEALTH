@echo off
title Fit Health - Windows Desktop Application
echo =========================================================================
echo                FIT HEALTH - WINDOWS DESKTOP RUNNER
echo       The Ultimate Gym Fitness Companion for the Health Conscious
echo =========================================================================
echo.

echo [1/3] Checking Backend API Server on port 5000...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting Backend Service...
    start /b "Fit Health Backend" cmd /c "cd backend && npm.cmd start"
    timeout /t 2 /nobreak >nul
) else (
    echo Backend Service is already active!
)

echo [2/3] Checking Frontend Service on port 3000...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3000/' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting Frontend Service...
    start /b "Fit Health Frontend" cmd /c "cd frontend && npm.cmd run dev"
    timeout /t 3 /nobreak >nul
) else (
    echo Frontend Service is already active!
)

echo [3/3] Launching Fit Health in Microsoft Edge...
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000/ --window-size=440,920 --user-data-dir="%TEMP%\FitHealthDesktop"
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000/ --window-size=440,920 --user-data-dir="%TEMP%\FitHealthDesktop"
) else (
    start msedge http://localhost:3000/
)

echo.
echo =========================================================================
echo Fit Health Windows Application is now running!
echo Demo Login: alex@fithealth.io / password123
echo =========================================================================
