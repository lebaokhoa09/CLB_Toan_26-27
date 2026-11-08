@echo off
setlocal
cd /d "%~dp0"
title Ky Thu Dai Hai - Offline
if not exist "dist\index.html" (
 echo Khong tim thay du an. Hay giai nen TOAN BO file ZIP, roi chay lai OPEN.cmd.
 pause
 exit /b 1
)
set "PROJECT_NODE=%~dp0runtime\win-x64\node.exe"
if exist "%PROJECT_NODE%" goto run
where node >nul 2>nul
if errorlevel 1 (
 echo Khong tim thay bo chay Node.js.
 echo Hay tai lai ban day du co thu muc runtime, hoac cai Node.js tu https://nodejs.org/
 pause
 exit /b 1
)
set "PROJECT_NODE=node"
:run
echo Dang mo Ky Thu Dai Hai tren may nay...
echo Giu cua so nay trong khi trinh chieu. Dong cua so hoac bam Ctrl+C de dung.
echo Khong can Internet khi da tai va giai nen day du.
"%PROJECT_NODE%" "%~dp0serve.mjs" 54824 --open %*
if errorlevel 1 pause
endlocal
