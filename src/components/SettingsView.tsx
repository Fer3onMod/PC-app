import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { storage } from '../utils/storage';
import {
  Settings,
  Save,
  Download,
  Upload,
  RotateCcw,
  Building,
  Printer,
  ShieldCheck,
  Check,
  Rocket,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  checkForGitHubUpdate,
  openDownloadUrl,
  APP_CURRENT_VERSION,
  GITHUB_REPO,
  ReleaseInfo
} from '../utils/updater';

interface SettingsViewProps {
  settings: StoreSettings;
  onUpdateSettings: (settings: StoreSettings) => void;
  onDataReload: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onDataReload,
}) => {
  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{
    checked: boolean;
    hasUpdate: boolean;
    release?: ReleaseInfo;
    message?: string;
  }>({ checked: false, hasUpdate: false });

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateInfo({ checked: false, hasUpdate: false });
    const res = await checkForGitHubUpdate(APP_CURRENT_VERSION);
    setCheckingUpdate(false);
    if (res.hasUpdate && res.latestRelease) {
      setUpdateInfo({
        checked: true,
        hasUpdate: true,
        release: res.latestRelease,
        message: `يتوفر تحديث جديد: ${res.latestRelease.tagName || res.latestRelease.version}`,
      });
    } else if (res.error) {
      setUpdateInfo({
        checked: true,
        hasUpdate: false,
        message: res.error,
      });
    } else {
      setUpdateInfo({
        checked: true,
        hasUpdate: false,
        message: `أنت تستخدم أحدث إصدار من البرنامج بالفعل (v${APP_CURRENT_VERSION})!`,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = storage.exportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_store_pos_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ text: 'تم تنزيل النسخة الاحتياطية بنجاح!', success: true });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = storage.importDatabase(content);
        if (success) {
          setStatusMessage({ text: 'تم استرجاع النسخة الاحتياطية وتحديث بيانات النظام بنجاح!', success: true });
          onDataReload();
        } else {
          setStatusMessage({ text: 'فشل استرجاع الملف، تأكد من صحة ملف النسخة الاحتياطية.', success: false });
        }
        setTimeout(() => setStatusMessage(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmPurge = () => {
    storage.purgeAllMockData();
    onDataReload();
    setShowPurgeModal(false);
    setStatusMessage({ text: 'تم تنظيف وتصفير كافة البيانات الوهمية بنجاح!', success: true });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>إعدادات المحل التجاري وترويسة الفواتير والطباعة</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تخصيص بيانات المتجر التي تظهر على الفواتير المطبوعة وخيارات النسخ الاحتياطي
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Store Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>بيانات المحل أو المؤسسة</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">اسم المحل / المؤسسة:</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">النشاط التجاري:</label>
              <input
                type="text"
                value={formData.commercialActivity}
                onChange={(e) => setFormData({ ...formData, commercialActivity: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">الهاتف الرئيسي (ت 1):</label>
              <input
                type="text"
                value={formData.phone1}
                onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">هاتف المبيعات / الطوارئ (ت 2):</label>
              <input
                type="text"
                value={formData.phone2}
                onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">المدينة:</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">العنوان بالتفصيل:</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">رقم السجل التجاري (س.ت):</label>
              <input
                type="text"
                value={formData.commercialReg}
                onChange={(e) => setFormData({ ...formData, commercialReg: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">رقم البطاقة الضريبية (ب.ض):</label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">اسم المستودع الافتراضي:</label>
              <input
                type="text"
                value={formData.defaultWarehouse}
                onChange={(e) => setFormData({ ...formData, defaultWarehouse: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5"
              />
            </div>
          </div>
        </div>

        {/* Invoicing and Printing Settings Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Printer className="w-4 h-4 text-blue-600" />
            <span>خيارات الفواتير والطباعة</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">رمز / اسم العملة المستخدمة:</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5"
                placeholder="جنيه، ريال، درهم..."
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">نوع المستند الافتراضي في نقطة البيع:</label>
              <select
                value={formData.defaultInvoiceType}
                onChange={(e) => setFormData({ ...formData, defaultInvoiceType: e.target.value as any })}
                className="w-full border border-slate-300 rounded-lg p-2.5"
              >
                <option value="quotation">بيان أسعار (عرض أسعار)</option>
                <option value="sales">فاتورة مبيعات</option>
                <option value="tax_invoice">فاتورة ضريبية</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              ملاحظات وتذييل الفاتورة وشروط الضمان المطبوعة أسفل الفاتورة:
            </label>
            <textarea
              rows={3}
              value={formData.invoiceNotes}
              onChange={(e) => setFormData({ ...formData, invoiceNotes: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {saveSuccess && (
              <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                <Check className="w-4 h-4" />
                تم حفظ الإعدادات بنجاح
              </span>
            )}
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </div>
      </form>

      {/* Backup and Restore & Reset Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>النسخ الاحتياطي وأمان البيانات</span>
        </h3>

        <p className="text-slate-600">
          يتم حفظ جميع الفواتير والمخزون وحسابات العملاء تلقائياً على جهاز الكمبيوتر. يمكنك أخذ نسخة
          احتياطية كاملة وتنزيلها كملف في أي وقت، أو استرجاعها على أي جهاز آخر.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل نسخة احتياطية من كافة الحسابات (JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>استرجاع نسخة احتياطية من ملف</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setShowPurgeModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-amber-700 hover:text-red-700 bg-amber-50 hover:bg-red-50 border border-amber-200 hover:border-red-200 rounded-lg transition-colors mr-auto font-bold cursor-pointer"
            title="تصفير وتنظيف شامل للبيانات الوهمية"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>تنظيف وتصفير البيانات الوهمية والتجريبية</span>
          </button>
        </div>

        {/* تحديثات النظام - مظهر بسيط ونظيف مع تحميل مباشر داخل التطبيق */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
                <Rocket className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">تحديثات النظام</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                    الإصدار المثبت: v{APP_CURRENT_VERSION}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  فحص الإصدارات الجديدة وتحميلها مباشرة بنقرة واحدة داخل البرنامج.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckUpdate}
              disabled={checkingUpdate}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
              <span>{checkingUpdate ? 'جاري التحقق من التحديثات...' : 'التحقق من التحديثات'}</span>
            </button>
          </div>

          {updateInfo.checked && (
            <div
              className={`mt-2.5 p-3.5 rounded-xl text-xs font-bold border transition-all ${
                updateInfo.hasUpdate
                  ? 'bg-blue-50 text-blue-900 border-blue-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {updateInfo.hasUpdate ? (
                    <Rocket className="w-4 h-4 text-blue-600 animate-bounce shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span>{updateInfo.message}</span>
                </div>

                {updateInfo.hasUpdate && updateInfo.release && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() =>
                        openDownloadUrl(
                          updateInfo.release!.setupUrl || updateInfo.release!.htmlUrl,
                          `TopSecurity-Setup-${updateInfo.release!.version}.exe`
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل النسخة الرسمية (Setup.exe)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openDownloadUrl(
                          updateInfo.release!.portableUrl || updateInfo.release!.htmlUrl,
                          `TopSecurity-Portable-${updateInfo.release!.version}.exe`
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل النسخة المحمولة (Portable.exe)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-lg text-xs font-bold border flex items-center gap-2 ${
              statusMessage.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-red-50 text-red-800 border-red-300'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Purge */}
      {showPurgeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 border border-amber-200 text-right">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">
              تأكيد تنظيف وتصفير البيانات الوهمية
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              سيتم حذف جميع الفواتير والمصروفات والأصناف التجريبية والديون الوهمية، والإبقاء على حساب
              نقدي صالة فقط حتى تبدأ بإدخال بيانات حقيقية لمتجرك.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowPurgeModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmPurge}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs cursor-pointer"
              >
                تأكيد التنظيف والتصفير
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
