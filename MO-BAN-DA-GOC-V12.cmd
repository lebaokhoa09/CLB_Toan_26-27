@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Máy cần cài Node.js để mở bản cục bộ.
 pause
 exit /b 1
)
if not exist "dist\assets\voyage-v12\manifest.json" (
 echo Bản đa góc đủ 10 chặng chưa xuất xong. Chờ hoàn tất render và đóng gói rồi mở lại.
 pause
 exit /b 1
)
set "VOYAGE_MEDIA_ROOT="
echo Giữ cửa sổ này trong khi trình chiếu. Bấm Ctrl+C để đóng máy chủ.
node serve.mjs 54836 --open --film=v12
pause
