@echo off
chcp 65001 >nul
echo ========================================
echo    SALARY REPORT GENERATOR
echo ========================================
echo.
echo Démarrage de l'application...
echo.
echo L'application sera accessible à:
echo http://127.0.0.1:5000
echo.
echo Appuyez sur Ctrl+C pour arrêter le serveur
echo.
timeout /t 3 /nobreak >nul

REM Lance l'application depuis le dossier dist
"%~dp0dist\app.exe"

pause
