@echo off
rem Sauvegarde du projet Atheria vers GitHub, branche "sauvegarde" (JAMAIS main).
cd /d "%~dp0"
git remote get-url origin >nul 2>&1 || git remote add origin https://github.com/MikaMsaa/atheria-pack.git
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set BR=%%b
if /i not "%BR%"=="sauvegarde" (
  echo ERREUR : branche actuelle "%BR%", attendu "sauvegarde". Rien envoye.
  pause & exit /b 1
)
git add -A
git commit -m "Sauvegarde %date% %time%" >nul 2>&1
git push -u origin sauvegarde
if errorlevel 1 (echo ECHEC de l'envoi. & pause & exit /b 1)
echo Sauvegarde envoyee sur GitHub (branche sauvegarde).
timeout /t 5 >nul
