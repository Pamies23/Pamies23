@echo off
title FitTracker
echo.
echo  =========================================
echo   FitTracker — Iniciando...
echo  =========================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Node.js no esta instalado.
    echo  Descargalo en: https://nodejs.org
    echo.
    pause
    exit /b 1
)

if not exist "server\node_modules" (
    echo  Instalando dependencias por primera vez...
    echo  (esto solo ocurre una vez, puede tardar 1-2 minutos)
    echo.
    call npm run install:all
    echo.
)

echo  Abriendo http://localhost:5173 en el navegador...
echo  Para cerrar la app pulsa Ctrl+C aqui.
echo.

start "" "http://localhost:5173"
timeout /t 2 /nobreak >nul
npm run dev
