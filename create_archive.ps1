$ProgressPreference = 'SilentlyContinue'
if (Test-Path '_staging') { Remove-Item -Recurse -Force '_staging' }
New-Item -ItemType Directory -Path '_staging' | Out-Null
robocopy backend _staging\backend /E /XD node_modules logs /XF *.log | Out-Null
robocopy frontend _staging\frontend /E /XD node_modules .vite /XF *.log | Out-Null
robocopy deployment _staging\deployment /E | Out-Null
robocopy api _staging\api /E | Out-Null
robocopy android-companion _staging\android-companion /E /XD .gradle build .idea /XF *.log | Out-Null
robocopy ios-companion _staging\ios-companion /E /XD .build DerivedData /XF *.log | Out-Null
robocopy . _staging .gitignore .vercelignore firestore.rules *.json *.md *.js /XF *.zip | Out-Null
Compress-Archive -Path _staging\* -DestinationPath 'FitHealth_Final_Project_Updated.zip' -Force
Remove-Item -Recurse -Force '_staging'
Get-Item 'FitHealth_Final_Project_Updated.zip' | Select-Object Name, Length, LastWriteTime
