#!/bin/bash

echo ""
echo " ========================================="
echo "  FitTracker — Iniciando..."
echo " ========================================="
echo ""

cd "$(dirname "$0")"

if ! command -v node &>/dev/null; then
    echo " ERROR: Node.js no está instalado."
    echo " Descárgalo en: https://nodejs.org"
    exit 1
fi

if [ ! -d "server/node_modules" ]; then
    echo " Instalando dependencias por primera vez..."
    echo " (esto solo ocurre una vez, puede tardar 1-2 minutos)"
    echo ""
    npm run install:all
    echo ""
fi

echo " Abriendo http://localhost:5173 en el navegador..."
echo " Para cerrar la app pulsa Ctrl+C aquí."
echo ""

(sleep 3 && open "http://localhost:5173" 2>/dev/null || xdg-open "http://localhost:5173" 2>/dev/null) &

npm run dev
