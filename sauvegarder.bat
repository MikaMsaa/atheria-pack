@echo off
rem Sauvegarde du projet Atheria :
rem  1) fichiers legers vers GitHub, branche "sauvegarde" (JAMAIS main)
rem  2) fichiers lourds (mondes, instances, serveurs) copies sur la cle USB
rem     (dossier Atheria-Sauvegarde a la racine de la cle ; ignore si cle absente)
cd /d "%~dp0"
set JOURNAL=%~dp0logs\sauvegarde.log
if not exist "%~dp0logs" mkdir "%~dp0logs"
echo ==== %date% %time% ==== >> "%JOURNAL%"
git remote get-url origin >nul 2>&1 || git remote add origin https://github.com/MikaMsaa/atheria-pack.git
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set BR=%%b
if /i not "%BR%"=="sauvegarde" (
  echo ERREUR : branche actuelle "%BR%", attendu "sauvegarde". Rien envoye. >> "%JOURNAL%"
  echo ERREUR : branche actuelle "%BR%", attendu "sauvegarde". Rien envoye.
  exit /b 1
)
git add -A
git commit -m "Sauvegarde %date% %time%" >nul 2>&1
git push -u origin sauvegarde
if errorlevel 1 (echo GitHub : ECHEC de l'envoi. >> "%JOURNAL%") else (echo GitHub : OK >> "%JOURNAL%")

rem --- Cle USB : premier lecteur amovible trouve ---
set CLE=
for /f "skip=1 tokens=1" %%d in ('wmic logicaldisk where "drivetype=2" get deviceid 2^>nul') do if not defined CLE if exist "%%d\" set CLE=%%d
if not defined CLE (
  echo USB : cle absente, copie des fichiers lourds sautee. >> "%JOURNAL%"
  echo Cle USB absente : copie lourde sautee.
  exit /b 0
)
set DEST=%CLE%\Atheria-Sauvegarde
rem Copie miroir de ce que la cle peut contenir (64 Go) : mondes, instances, serveurs.
for %%s in ("outils\mondes-cloud" "instances" "serveur" "outils\serveur-ile-test" "outils\serveur-pilote-essai" "outils\serveur-lieux-essai" "outils\serveur-beta-test" "outils\minestrator") do (
  robocopy "%%~s" "%DEST%\%%~s" /MIR /R:1 /W:2 /NP /NFL /NDL /XF *.lock >> "%JOURNAL%"
)
echo USB : copie terminee sur %DEST% >> "%JOURNAL%"
echo Sauvegarde terminee (GitHub + cle USB %CLE%).
