import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Monitor, Wifi, Clock, HelpCircle } from 'lucide-react';

interface WindowsTitleBarProps {
  storeName: string;
  onOpenHelp?: () => void;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({ storeName, onOpenHelp }) => {
  const [timeStr, setTimeStr] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
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
      // Browser full screen fallback
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
      if (window.confirm('هل تريد إغلاق تطبيق Top Security؟')) {
        window.close();
      }
    }
  };

  return (
    <div className="no-print bg-slate-950 text-slate-300 border-b border-slate-800/80 px-3 py-1 flex items-center justify-between text-xs select-none h-9 shrink-0">
      {/* Right side (RTL): App brand & store title */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white font-black text-[10px] shadow-xs tracking-tighter">
          TS
        </div>
        <span className="font-extrabold text-white tracking-tight font-sans">Top Security</span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-400 truncate max-w-[220px] font-medium">{storeName}</span>
      </div>

      {/* Center: System Status and Clock */}
      <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-sans text-[11px]">قاعدة البيانات المحلية: متصل</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Left side (RTL): Window Controls (Minimize, Maximize, Close) */}
      <div className="flex items-center gap-1">
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
