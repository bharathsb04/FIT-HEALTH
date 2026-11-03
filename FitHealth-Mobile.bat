@echo off
title Fit Health - Mobile Device Connection
echo =========================================================================
echo               FIT HEALTH - MOBILE PLATFORM ACCESS
echo       Run Fit Health on your Android or iPhone Device
echo =========================================================================
echo.

echo Detecting your Local Wi-Fi IP Address...
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0 ^| findstr /v "0.0.0.0.*0.0.0.0"') do (
    set LOCAL_IP=%%a
    goto :ip_found
)
:ip_found

echo.
echo =========================================================================
echo               MOBILE ACCESS INSTRUCTIONS:
echo =========================================================================
echo 1. Connect your Mobile Phone (Android or iPhone) to the SAME Wi-Fi network.
echo.
echo 2. Open Chrome (Android) or Safari (iOS) on your phone and go to:
echo.
echo      http://192.168.31.69:3000/
echo.
echo 3. TO INSTALL AS A NATIVE MOBILE APP ON YOUR PHONE:
echo    - On Android (Chrome): Tap the three dots (menu) -^> "Install app" or "Add to Home screen"
echo    - On iOS (Safari): Tap the Share button [^] -^> "Add to Home Screen"
echo.
echo 4. Fit Health will now appear on your phone's home screen with its own
echo    app icon and will launch full-screen without any browser address bar!
echo.
echo Demo Login Credentials:
echo    Email:    alex@fithealth.io
echo    Password: password123
echo =========================================================================
echo.
pause
