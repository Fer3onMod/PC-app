import React, { useState } from 'react';
import {
  Monitor,
  Download,
  Github,
  Terminal,
  FileCode,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Layers,
  Copy,
  Check,
  Package
} from 'lucide-react';

export const WindowsBuildCenter: React.FC = () => {
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const handleDownloadBatch = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runBatContent = `@echo off
chcp 65001 > nul
title تشغيل نظام التاجر - برنامج المحاسبة
echo جاري تشغيل برنامج نظام التاجر...
start http://localhost:3000
npm run dev
pause`;

  const buildExeBatContent = `@echo off
chcp 65001 > nul
title بناء ملف التثبيت لويندوز (.exe) - نظام التاجر
echo 1. جاري بناء ملفات المشروع...
call npm run build
echo 2. جاري حزم التطبيق بصيغة .exe لويندوز...
call npx electron-builder --win --x64
echo [✓] تم بناء Tajir-Setup.exe بنجاح في مجلد: dist-electron
explorer dist-electron
pause`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Monitor className="w-3.5 h-3.5" />
              <span>جاهز للويندوز 10 و 11 (Windows Desktop Ready)</span>
            </div>
            <h2 className="text-xl font-black tracking-tight">
              مركز بناء حزم الويندوز وملفات جيت هوب (GitHub Actions)
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              تم إعداد وتضمين ملفات البناء التلقائي عبر **GitHub Actions** و **Electron Builder** ليتم
              توليد ملف تثبيت الويندوز المستقل (`Tajir-Setup.exe`) تلقائياً بمجرد رفع الكود على جيت هوب!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
              <Github className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Steps Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="font-bold text-slate-900 text-sm">ارفع الكود على مستودع جيت هوب</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            أنشئ مستودعاً جديداً (New Repository) على حسابك في GitHub وارفع ملفات المشروع عليه باستخدام Git.
          </p>
          <div className="bg-slate-900 text-slate-300 p-2.5 rounded-lg text-[11px] font-mono select-all">
            git push origin main
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="font-bold text-slate-900 text-sm">جيت هوب يبني ملف .exe تلقائياً</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            ملف <code className="text-blue-700 font-mono">.github/workflows/build-windows.yml</code> سيعمل فورياً
            داخل خوادم ويندوز السحابية الخاصة بجيت هوب ويقوم بحزم البرنامج.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>ملف الـ Workflow مضاف ومضبوط بالكامل</span>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="font-bold text-slate-900 text-sm">تنزيل Tajir-Setup.exe</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            ستجد ملف التثبيت جاهزاً للتنزيل من تبويب **Actions / Releases** في صفحة المشروع على جيت هوب وتثبيته على حاسوب المحل مباشرة!
          </p>
          <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
            Tajir-Setup-1.0.0.exe
          </div>
        </div>
      </div>

      {/* GitHub Workflow File Inspection */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              ملف البناء التلقائي المدمج (.github/workflows/build-windows.yml)
            </h3>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
            جاهز ومضمن في المشروع ✓
          </span>
        </div>

        <div className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800" dir="ltr">
          <pre>{`name: Build Windows Application (.exe)
on:
  push:
    branches: [ main, master ]

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npx electron-builder --win --x64
      - uses: actions/upload-artifact@v4
        with:
          name: Windows-App-Exe
          path: dist-electron/*.exe`}</pre>
        </div>
      </div>

      {/* Direct Windows Batch Scripts for Instant Local Use */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Terminal className="w-5 h-5 text-slate-700" />
            <span>ملفات التشغيل السريع المباشر على ويندوز (بدون انتظار جيت هوب)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            تم إنشاء ملفات الدفعة (Batch Files) التالية داخل مجلد المشروع للتشغيل أو البناء المحلي بنقرة واحدة:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File 1: run-windows.bat */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold font-mono text-xs text-slate-900">run-windows.bat</span>
              <button
                onClick={() => handleDownloadBatch('run-windows.bat', runBatContent)}
                className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل الملف</span>
              </button>
            </div>
            <p className="text-xs text-slate-600">
              ملف لتشغيل البرنامج على جهاز المحل فوراً بنقرة زر بدون أي أوامر.
            </p>
          </div>

          {/* File 2: build-windows-exe.bat */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold font-mono text-xs text-slate-900">build-windows-exe.bat</span>
              <button
                onClick={() => handleDownloadBatch('build-windows-exe.bat', buildExeBatContent)}
                className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل الملف</span>
              </button>
            </div>
            <p className="text-xs text-slate-600">
              يقوم بتوليد ملف التثبيت <code className="font-mono text-blue-800">Tajir-Setup.exe</code> محلياً على جهازك.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
