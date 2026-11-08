@echo off
chcp 65001 > nul
title بناء ملفات ويندوز (.exe) - Top Security
color 0a

echo ========================================================
echo        بناء ملفات ويندوز Top Security (.exe)
echo ========================================================
echo.
if not exist node_modules (
    echo [تنبيه] جاري تثبيت الحزم والمكتبات...
    call npm install --legacy-peer-deps
)

echo 1. جاري فحص الكود وبناء ملفات الواجهة (Vite Build)...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo [خطأ] فشل بناء ملفات المشروع. يرجى مراجعة رسائل الخطأ أعلاه.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2. جاري حزم التطبيق لبرنامج تثبيت ونسخة محمولة عبر Electron Builder...
call npx electron-builder --win --x64 --publish never

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  [✓] تم بناء الملفات بنجاح في مجلد: dist-electron
    echo  1. ملف التثبيت: TopSecurity-Setup.exe
    echo  2. النسخة المحمولة: TopSecurity-Portable.exe
    echo ========================================================
    if exist dist-electron explorer dist-electron
) else (
    echo [خطأ] حدث خطأ أثناء تحزيم ملفات .exe
)

pause
