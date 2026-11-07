@echo off
rem Atheria Zombie Edition - mise a jour du pack avant chaque lancement (Modrinth App)
rem Commande de pre-lancement : voir docs\mises-a-jour-auto.md (elle recupere ce fichier sur GitHub)
rem Le journal de la derniere mise a jour est ecrit dans atheria-maj.log (dossier de l'instance).
setlocal EnableExtensions
set "DEPART=%CD%"
cd /d "%~dp0"

set "PACK_URL=https://raw.githubusercontent.com/MikaMsaa/atheria-pack/main/pack.toml"
set "JAR_URL=https://raw.githubusercontent.com/MikaMsaa/atheria-pack/main/packwiz-installer-bootstrap.jar"
set "LOG=%~dp0atheria-maj.log"
set "JAVA="

echo [%DATE% %TIME%] Mise a jour Atheria > "%LOG%"
echo Dossier de depart : %DEPART% >> "%LOG%"

rem 1) Java 21 fourni par le Modrinth App (ex. zulu21.44.17-ca-jre21.0.8-win_x64\bin\java.exe)
set "MR_JAVA=%APPDATA%\ModrinthApp\meta\java_versions"
if exist "%MR_JAVA%\" (
    for /d %%D in ("%MR_JAVA%\*jre21*" "%MR_JAVA%\*jdk21*" "%MR_JAVA%\*21*") do (
        if not defined JAVA if exist "%%~D\bin\java.exe" set "JAVA=%%~D\bin\java.exe"
    )
)

rem 2) JAVA_HOME
if not defined JAVA if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" set "JAVA=%JAVA_HOME%\bin\java.exe"

rem 3) java dans le PATH
if not defined JAVA for /f "delims=" %%J in ('where java 2^>nul') do if not defined JAVA set "JAVA=%%J"

if not defined JAVA (
    echo Java introuvable : mise a jour ignoree, le jeu demarre avec les fichiers actuels. >> "%LOG%"
    exit /b 0
)
echo Java : %JAVA% >> "%LOG%"

if not exist "packwiz-installer-bootstrap.jar" (
    curl -fsSL -o "packwiz-installer-bootstrap.jar.tmp" "%JAR_URL%" >> "%LOG%" 2>&1 && move /y "packwiz-installer-bootstrap.jar.tmp" "packwiz-installer-bootstrap.jar" >nul
)
if not exist "packwiz-installer-bootstrap.jar" (
    echo packwiz-installer-bootstrap.jar introuvable et non telechargeable : mise a jour ignoree. >> "%LOG%"
    exit /b 0
)

"%JAVA%" -jar packwiz-installer-bootstrap.jar -g -s client "%PACK_URL%" >> "%LOG%" 2>&1
if errorlevel 1 (
    rem Pas d'internet ou GitHub injoignable : on joue quand meme avec les fichiers deja installes
    echo Echec de la mise a jour ^(code %ERRORLEVEL%^) : le jeu demarre avec les fichiers actuels. >> "%LOG%"
    exit /b 0
)
echo Mise a jour terminee. >> "%LOG%"
exit /b 0
