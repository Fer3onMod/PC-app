import React from 'react';
import { ReleaseInfo, openDownloadUrl, APP_CURRENT_VERSION } from '../utils/updater';
import {
  Rocket,
  Download,
  X,
  Sparkles,
  Calendar,
  Layers,
  ShieldCheck
} from 'lucide-react';

interface UpdateNotificationModalProps {
  release: ReleaseInfo;
  onClose: () => void;
}

export const UpdateNotificationModal: React.FC<UpdateNotificationModalProps> = ({
  release,
  onClose,
}) => {
  const handleDownloadSetup = () => {
    openDownloadUrl(
      release.setupUrl || release.htmlUrl,
      `TopSecurity-Setup-${release.version}.exe`
    );
  };

  const handleDownloadPortable = () => {
    openDownloadUrl(
      release.portableUrl || release.htmlUrl,
      `TopSecurity-Portable-${release.version}.exe`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95" dir="rtl">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Rocket className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">يتوفر تحديث جديد للبرنامج!</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                  {release.tagName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                إصدار جديد جاهز للتنزيل والتثبيت المباشر داخل التطبيق
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Version Comparison Box */}
        <div className="grid grid-cols-2 gap-3 my-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div>
            <span className="text-[11px] text-slate-500 font-bold block">الإصدار الحالي مثبت:</span>
            <span className="text-sm font-mono font-bold text-slate-300">v{APP_CURRENT_VERSION}</span>
          </div>
          <div className="border-r border-slate-800 pr-3">
            <span className="text-[11px] text-blue-400 font-bold block flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>الإصدار الجديد المتاح:</span>
            </span>
            <span className="text-sm font-mono font-black text-emerald-400">
              {release.tagName}
            </span>
          </div>
        </div>

        {/* Release Notes */}
        <div className="space-y-1.5 my-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>ملاحظات ومميزات التحديث:</span>
            </span>
            {release.publishedAt && (
              <span className="text-[10px] flex items-center gap-1 text-slate-500 font-mono">
                <Calendar className="w-3 h-3" />
                <span>{release.publishedAt}</span>
              </span>
            )}
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 max-h-44 overflow-y-auto text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap select-text">
            {release.notes}
          </div>
        </div>

        {/* Direct In-App Download Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleDownloadSetup}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>تحميل برنامج التثبيت الرسمي (Setup.exe)</span>
          </button>

          <button
            onClick={handleDownloadPortable}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>تحميل النسخة المحمولة المباشرة بدون تثبيت (Portable.exe)</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>تنزيل آمن ومباشر بنقرة واحدة</span>
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 font-bold transition-colors cursor-pointer"
          >
            تذكيري لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
};
