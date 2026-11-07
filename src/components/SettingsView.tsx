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
  Check
} from 'lucide-react';

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
          alert('تم استرجاع النسخة الاحتياطية وتحديث بيانات النظام بنجاح!');
          onDataReload();
        } else {
          alert('فشل استرجاع الملف، تأكد من صحة ملف النسخة الاحتياطية.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (
      window.confirm(
        'هل تريد بالتأكيد إعادة ضبط النظام على البيانات الافتراضية التجريبية (بما فيها فاتورة رقم 26700)؟'
      )
    ) {
      storage.resetToDemo();
      onDataReload();
      alert('تمت إعادة ضبط البيانات بنجاح!');
    }
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
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mr-auto"
            title="إعادة ضبط البيانات التجريبية"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة تعيين البيانات الافتراضية للبرنامج</span>
          </button>
        </div>
      </div>
    </div>
  );
};
