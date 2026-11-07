@echo off
chcp 65001 > nul
title بناء ملف التثبيت لويندوز (.exe) - نظام التاجر
color 0a

echo ========================================================
echo        بناء ملف التثبيت لويندوز Tajir-Setup.exe
echo ========================================================
echo.
echo 1. جاري بناء ملفات الواجهة (Vite Build)...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo [خطأ] فشل بناء ملفات المشروع.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2. جاري حزم التطبيق بصيغة .exe لويندوز عبر Electron Builder...
call npx electron-builder --win --x64

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  [✓] تم بناء ملف التثبيت بنجاح في مجلد: dist-electron
    echo  ستجد ملف: Tajir-Setup.exe جاهز للتثبيت على أي جهاز ويندوز!
    echo ========================================================
    explorer dist-electron
) else (
    echo [خطأ] حدث خطأ أثناء تحزيم ملف .exe
)

pause
