@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "VOYAGE_MEDIA_ROOT=%~dp0..\blender\ship-voyage-v9\previs-media"
node serve.mjs 54834 --open --film=v9
pause
