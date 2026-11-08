import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Clock, HelpCircle, Plus } from 'lucide-react';
import { Logo } from './Logo';

interface WindowsTitleBarProps {
  storeName: string;
  onOpenHelp?: () => void;
  onNewInvoice?: () => void;
  hasUpdate?: boolean;
  onOpenUpdateModal?: () => void;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  storeName,
  onOpenHelp,
  onNewInvoice,
  hasUpdate,
  onOpenUpdateModal,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMinimize = () => {
    if ((window as any).electronAPI?.minimize) {
      (window as any).electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    if ((window as any).electronAPI?.maximize) {
      (window as any).electronAPI.maximize();
      setIsMaximized(!isMaximized);
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsMaximized(true);
      } else {
        document.exitFullscreen().catch(() => {});
        setIsMaximized(false);
      }
    }
  };

  const handleClose = () => {
    if ((window as any).electronAPI?.close) {
      (window as any).electronAPI.close();
    } else {
      window.close();
    }
  };

  return (
    <div className="no-print bg-slate-950 text-slate-200 border-b border-slate-800 px-3 py-1 flex items-center justify-between text-xs select-none h-10 shrink-0">
      {/* Right side (RTL): Professional Brand Logo & Store Details */}
      <div className="flex items-center gap-3">
        <Logo size="sm" showSubtitle={false} />
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span className="text-slate-400 truncate max-w-[240px] font-medium hidden md:inline">
          {storeName} · أنظمة المراقبة والمبيعات
        </span>
      </div>

      {/* Center: Clean Clock (English / LTR) */}
      <div className="hidden sm:flex items-center gap-1.5 text-slate-300 font-mono text-[11px] bg-slate-900/90 px-2.5 py-0.5 rounded border border-slate-800" dir="ltr">
        <Clock className="w-3.5 h-3.5 text-sky-400" />
        <span className="tracking-wide font-medium">{timeStr}</span>
      </div>

      {/* Left side (RTL): Window Controls (Help, Minimize, Maximize, Close) */}
      <div className="flex items-center gap-1.5">
        {hasUpdate && onOpenUpdateModal && (
          <button
            onClick={onOpenUpdateModal}
            className="flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded text-[11px] font-bold shadow-xs animate-pulse cursor-pointer transition-all"
            title="يتوفر تحديث جديد للبرنامج متوفر للتحميل الآن"
          >
            <span>🚀 تحديث جديد</span>
          </button>
        )}

        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="w-7 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="دليل الاختصارات (F1)"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={handleMinimize}
          className="w-8 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="تصغير النافذة"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleMaximize}
          className="w-8 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title={isMaximized ? 'استعادة الحجم' : 'تكبير ملء الشاشة'}
        >
          <Square className="w-3 h-3" />
        </button>

        <button
          onClick={handleClose}
          className="w-8 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 rounded transition-colors"
          title="إغلاق البرنامج"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
