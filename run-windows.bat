@echo off
chcp 65001 > nul
title تشغيل Top Security - برنامج إدارة حسابات ومبيعات المحلات
color 0b

echo ========================================================
echo         تشغيل برنامج Top Security للمحلات التجارية
echo ========================================================
echo.
echo جاري فحص الحزم والتشغيل...
echo.

if not exist node_modules (
    echo [تنبيه] جاري تثبيت الحزم لأول مرة، يرجى الانتظار دقيقة...
    call npm install --legacy-peer-deps
)

echo [✓] جاري فتح البرنامج على المتصفح وسطح المكتب...
start http://localhost:3000
npm run dev

pause
