import React, { useState } from 'react';
import { Invoice, StoreSettings } from '../types';
import { Printer, ArrowRight, Download, FileText, CheckCircle2, Copy } from 'lucide-react';
import { Logo } from './Logo';

interface PrintableInvoiceProps {
  invoice: Invoice;
  settings: StoreSettings;
  onBack?: () => void;
  onEdit?: (invoice: Invoice) => void;
  onUpdateType?: (type: Invoice['type']) => void;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({
  invoice,
  settings,
  onBack,
  onEdit,
  onUpdateType,
}) => {
  const [printFormat, setPrintFormat] = useState<'exact' | 'branded' | 'thermal'>('exact');
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const invoiceTypeTitle = {
    quotation: 'بيان أسعار',
    sales: 'فاتورة مبيعات',
    tax_invoice: 'فاتورة مبيعات ضريبية',
    return: 'مرتجع مبيعات',
  }[invoice.type] || 'بيان أسعار';

  return (
    <div className="space-y-6">
      {/* Action Header - Hidden when printing */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                رجوع
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>معاينة وطباعة الفاتورة</span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono">
                  #{invoice.invoiceNumber}
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                جاهزة للطباعة على طابعات الورق العادي A4 وطابعات الإيصالات الحرارية
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Format Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setPrintFormat('exact')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  printFormat === 'exact'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="مطابقة لشكل الورقة المرفوعة تماماً"
              >
                مطابقة للأصل (الورقة)
              </button>
              <button
                onClick={() => setPrintFormat('branded')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  printFormat === 'branded'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                رسمية مع ترويسة المتجر
              </button>
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  printFormat === 'thermal'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                بون كاشير حراري 80mm
              </button>
            </div>

            {/* Quick Type Switch */}
            {onUpdateType && (
              <select
                value={invoice.type}
                onChange={(e) => onUpdateType(e.target.value as Invoice['type'])}
                className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700"
              >
                <option value="quotation">بيان أسعار</option>
                <option value="sales">فاتورة مبيعات</option>
                <option value="tax_invoice">فاتورة ضريبية</option>
                <option value="return">مرتجع مبيعات</option>
              </select>
            )}

            {onEdit && (
              <button
                onClick={() => onEdit(invoice)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                تعديل البيانات
              </button>
            )}

            {/* Primary Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة (الطابعة)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic @page media rule matching current format */}
      {printFormat === 'thermal' ? (
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: 80mm auto !important;
              margin: 0 !important;
            }
          }
        `}} />
      ) : (
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4 portrait !important;
              margin: 6mm 8mm !important;
            }
          }
        `}} />
      )}

      {/* Invoice Document Wrapper */}
      <div className="flex justify-center p-2 sm:p-4">
        {/* ============================================================== */}
        {/* FORMAT 1: EXACT REPLICA OF THE ATTACHED IMAGE (بيان أسعار / مبيعات) */}
        {/* ============================================================== */}
        {printFormat === 'exact' && (
          <div
            id="printable-invoice"
            className="invoice-a4-exact w-full max-w-[840px] bg-white border border-slate-400 p-6 sm:p-8 text-black text-xs leading-relaxed shadow-sm font-sans"
            style={{ minHeight: '1050px', boxSizing: 'border-box' }}
          >
            {/* Top Bar: Page & Title & Warehouse */}
            <div className="flex items-center justify-between border-b-2 border-slate-700 pb-2 mb-3">
              <div className="text-[11px] text-slate-600 font-mono">
                Page 1 of 1
              </div>
              <div className="text-xl font-bold tracking-wide text-slate-900 border-b border-transparent px-6 py-0.5">
                {invoiceTypeTitle}
              </div>
              <div className="border border-slate-500 px-3 py-1 text-xs font-medium bg-slate-50">
                <span>المستودع</span> : <span className="font-bold">{invoice.warehouse || 'المخزن الرئيسي'}</span>
              </div>
            </div>

            {/* Information Grid Table - Exactly structured as the uploaded image */}
            <div className="border border-slate-400 mb-3 overflow-hidden">
              <table className="w-full border-collapse text-right text-xs">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="w-20 bg-slate-100 p-1.5 font-bold border-l border-slate-300">
                      الرقم
                    </td>
                    <td className="p-1.5 font-bold text-base font-mono-numbers text-slate-900 border-l border-slate-300">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="w-20 bg-slate-100 p-1.5 font-bold border-l border-slate-300">
                      التاريخ
                    </td>
                    <td className="p-1.5 font-mono-numbers">
                      {invoice.date}
                    </td>
                  </tr>

                  <tr className="border-b border-slate-300">
                    <td className="bg-slate-100 p-1.5 font-bold border-l border-slate-300">
                      رقم الموظف
                    </td>
                    <td className="p-1.5 font-mono-numbers border-l border-slate-300">
                      {invoice.employeeNumber}
                    </td>
                    <td colSpan={2} className="p-1.5 font-medium">
                      {invoice.employeeName}
                    </td>
                  </tr>

                  <tr className="border-b border-slate-300">
                    <td className="bg-slate-100 p-1.5 font-bold border-l border-slate-300">
                      اسم العميل
                    </td>
                    <td className="p-1.5 font-mono-numbers border-l border-slate-300">
                      {invoice.customer.code}
                    </td>
                    <td colSpan={2} className="p-1.5 font-bold text-slate-900">
                      {invoice.customer.name}
                    </td>
                  </tr>

                  <tr className="border-b border-slate-300">
                    <td className="bg-slate-100 p-1.5 font-bold border-l border-slate-300">
                      الفئة
                    </td>
                    <td className="p-1.5 border-l border-slate-300">
                      {invoice.customer.category || 'عملاء'}
                    </td>
                    <td className="w-20 bg-slate-100 p-1.5 font-bold border-l border-slate-300">
                      المدينة
                    </td>
                    <td className="p-1.5">
                      {invoice.customer.city || 'المنصورة'}
                    </td>
                  </tr>

                  <tr>
                    <td className="bg-slate-100 p-1.5 font-bold border-l border-slate-300">
                      ت 1
                    </td>
                    <td className="p-1.5 font-mono-numbers border-l border-slate-300">
                      {invoice.customer.phone1 || '-'}
                    </td>
                    <td className="w-20 bg-slate-100 p-1.5 font-bold border-l border-slate-300">
                      العنوان
                    </td>
                    <td className="p-1.5">
                      {invoice.customer.address || '-'}
                      {invoice.customer.phone2 && (
                        <span className="mr-3 font-mono text-[11px] text-slate-600">
                          (ت 2: {invoice.customer.phone2})
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-400 mb-3 overflow-hidden">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 text-slate-900 font-bold">
                    <th className="py-2 px-1 text-center border-l border-slate-300 w-8">م</th>
                    <th className="py-2 px-2 text-right border-l border-slate-300">اسم الصنف</th>
                    <th className="py-2 px-1 text-center border-l border-slate-300 w-16">S.N</th>
                    <th className="py-2 px-1 text-center border-l border-slate-300 w-12">كمية</th>
                    <th className="py-2 px-1 text-center border-l border-slate-300 w-20">السعر</th>
                    <th className="py-2 px-1 text-center border-l border-slate-300 w-14">نسبة الخصم</th>
                    <th className="py-2 px-1 text-center border-l border-slate-300 w-20">السعر بعد</th>
                    <th className="py-2 px-2 text-center w-24">القيمة</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="border-b border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-2 px-1 text-center border-l border-slate-300 font-mono-numbers">
                        {index + 1}
                      </td>
                      <td className="py-2 px-2 text-right border-l border-slate-300 font-medium text-slate-900">
                        {item.name}
                      </td>
                      <td className="py-2 px-1 text-center border-l border-slate-300 font-mono text-[11px] text-slate-600">
                        {item.serialNumber || '-'}
                      </td>
                      <td className="py-2 px-1 text-center border-l border-slate-300 font-mono-numbers font-bold">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-1 text-center border-l border-slate-300 font-mono-numbers">
                        {formatNumber(item.price)}
                      </td>
                      <td className="py-2 px-1 text-center border-l border-slate-300 font-mono-numbers">
                        {item.discountPercent ? `${item.discountPercent}%` : '-'}
                      </td>
                      <td className="py-2 px-1 text-center border-l border-slate-300 font-mono-numbers">
                        {formatNumber(item.priceAfterDiscount || item.price)}
                      </td>
                      <td className="py-2 px-2 text-center font-mono-numbers font-bold text-slate-900">
                        {formatNumber(item.total)}
                      </td>
                    </tr>
                  ))}

                  {/* Empty rows filler if invoice has few items to preserve paper layout */}
                  {invoice.items.length < 5 &&
                    Array.from({ length: 5 - invoice.items.length }).map((_, i) => (
                      <tr key={`filler-${i}`} className="border-b border-slate-200 h-7 text-slate-300">
                        <td className="border-l border-slate-200 text-center font-mono text-[10px]">{invoice.items.length + i + 1}</td>
                        <td className="border-l border-slate-200"></td>
                        <td className="border-l border-slate-200"></td>
                        <td className="border-l border-slate-200"></td>
                        <td className="border-l border-slate-200"></td>
                        <td className="border-l border-slate-200"></td>
                        <td className="border-l border-slate-200"></td>
                        <td></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary Section - Structured exactly like uploaded image */}
            <div className="grid grid-cols-12 gap-3 mb-4">
              {/* Left Side: Invoice Total & Quantity */}
              <div className="col-span-6 flex flex-col justify-start">
                <div className="border border-slate-400 p-2 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">إجمالي الفاتورة:</span>
                    <span className="font-mono-numbers font-bold text-base text-slate-900">
                      {formatNumber(invoice.totalAmount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 border-r border-slate-300 pr-3">
                    <span className="font-medium text-slate-600">الكمية:</span>
                    <span className="font-mono-numbers font-bold">
                      {formatNumber(invoice.totalQuantity, 2)}
                    </span>
                  </div>
                </div>

                {/* Tafqeet (Written Amount in Words) */}
                <div className="mt-3 p-2 bg-slate-50 border border-slate-300 rounded text-xs">
                  <span className="font-bold text-slate-700 ml-1">فقط:</span>
                  <span className="font-semibold text-slate-900">{invoice.amountInWords}</span>
                </div>

                {/* Notes */}
                {invoice.notes && (
                  <div className="mt-2 text-[11px] text-slate-600 border border-slate-200 p-2 rounded">
                    <span className="font-bold text-slate-800">ملاحظات:</span> {invoice.notes}
                  </div>
                )}
              </div>

              {/* Right Side: Balances Table */}
              <div className="col-span-6 border border-slate-400 overflow-hidden">
                <table className="w-full border-collapse text-xs">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="w-32 bg-slate-100 p-1.5 font-bold border-l border-slate-300">
                        الرصيد السابق
                      </td>
                      <td className="p-1.5 font-mono-numbers text-center">
                        {formatNumber(invoice.previousBalance, 2)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-slate-300">
                        الصافي
                      </td>
                      <td className="p-1.5 font-mono-numbers font-bold text-center text-sm">
                        {formatNumber(invoice.netAmount, 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-100 p-1.5 font-bold border-l border-slate-300">
                        الرصيد الحالي
                      </td>
                      <td className="p-1.5 font-mono-numbers font-bold text-center text-base text-slate-900">
                        {formatNumber(invoice.currentBalance, 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signatures & Footer */}
            <div className="pt-6 border-t border-slate-300 grid grid-cols-3 text-center text-xs text-slate-700 mt-8">
              <div>
                <p className="font-bold mb-8">توقيع المستلم</p>
                <div className="border-b border-dotted border-slate-400 w-32 mx-auto"></div>
              </div>
              <div>
                <p className="font-bold mb-8">ختم المحل / المؤسسة</p>
                <div className="w-20 h-20 border border-dashed border-slate-400 rounded-full mx-auto flex items-center justify-center text-[10px] text-slate-400">
                  ختم معتمد
                </div>
              </div>
              <div>
                <p className="font-bold mb-8">توقيع البائع / المحاسب</p>
                <div className="border-b border-dotted border-slate-400 w-32 mx-auto"></div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* FORMAT 2: BRANDED WITH STORE HEADER & TAX/CR REGISTRATION */}
        {/* ============================================================== */}
        {printFormat === 'branded' && (
          <div
            id="printable-invoice"
            className="invoice-a4-branded w-full max-w-[840px] bg-white border border-slate-300 p-8 text-black text-xs shadow-sm font-sans"
            style={{ minHeight: '1050px', boxSizing: 'border-box' }}
          >
            {/* Store Full Header with Professional Logo */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-4">
              <div>
                <Logo size="lg" monochrome={true} showSubtitle={true} className="mb-2" />
                <p className="text-xs text-slate-700 mt-1 font-medium">{settings.commercialActivity}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-600 mt-2 font-mono">
                  <span>س.ت: {settings.commercialReg}</span>
                  <span>·</span>
                  <span>ب.ض: {settings.taxNumber}</span>
                </div>
              </div>
              <div className="text-left text-xs text-slate-700 leading-snug">
                <p className="font-bold text-slate-900 text-sm">{settings.city} - {settings.address}</p>
                <p className="font-mono mt-1 text-slate-800">هاتف: {settings.phone1}</p>
                {settings.phone2 && <p className="font-mono text-slate-800">مبيعات: {settings.phone2}</p>}
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="bg-slate-100 border border-slate-300 py-2 px-4 rounded-md mb-4 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">{invoiceTypeTitle}</span>
              <div className="flex items-center gap-4 text-xs">
                <span>رقم الفاتورة: <strong className="font-mono text-sm">{invoice.invoiceNumber}</strong></span>
                <span>التاريخ: <strong className="font-mono">{invoice.date}</strong></span>
                <span>المستودع: <strong>{invoice.warehouse}</strong></span>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-lg p-3 bg-slate-50/50 mb-4 text-xs">
              <div>
                <p className="text-slate-500 text-[11px]">بيانات العميل</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{invoice.customer.name}</p>
                <p className="text-slate-600 mt-1">العنوان: {invoice.customer.address} - {invoice.customer.city}</p>
              </div>
              <div className="text-left font-mono">
                <p className="text-slate-500 text-[11px]">معلومات الاتصال والحساب</p>
                <p className="font-bold text-slate-900 mt-0.5">كود: {invoice.customer.code}</p>
                <p className="text-slate-600 mt-1">هاتف: {invoice.customer.phone1}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse text-xs mb-4">
              <thead>
                <tr className="bg-blue-900 text-white font-bold text-center">
                  <th className="py-2 px-2 w-8">#</th>
                  <th className="py-2 px-3 text-right">بيان الصنف والمواصفات</th>
                  <th className="py-2 px-2 w-20">السريال S.N</th>
                  <th className="py-2 px-2 w-14">الكمية</th>
                  <th className="py-2 px-2 w-20">السعر</th>
                  <th className="py-2 px-2 w-16">الخصم %</th>
                  <th className="py-2 px-2 w-24">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx} className="border-b border-slate-200 text-center">
                    <td className="py-2 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 text-right font-medium text-slate-900">{item.name}</td>
                    <td className="py-2 font-mono text-[11px] text-slate-500">{item.serialNumber || '-'}</td>
                    <td className="py-2 font-mono font-bold">{item.quantity}</td>
                    <td className="py-2 font-mono">{formatNumber(item.price)}</td>
                    <td className="py-2 font-mono">{item.discountPercent ? `${item.discountPercent}%` : '-'}</td>
                    <td className="py-2 font-mono font-bold text-slate-900">{formatNumber(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Branded Totals Summary */}
            <div className="grid grid-cols-12 gap-4 border-t-2 border-slate-300 pt-4 mb-6">
              <div className="col-span-7 space-y-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                  <span className="font-bold text-blue-950">المبلغ كتابةً: </span>
                  <span className="font-semibold text-blue-900">{invoice.amountInWords}</span>
                </div>
                <div className="text-[11px] text-slate-500 leading-normal p-2">
                  <p className="font-bold text-slate-700">شروط وضمان الفاتورة:</p>
                  <p>{settings.invoiceNotes}</p>
                </div>
              </div>
              <div className="col-span-5 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>إجمالي الأصناف:</span>
                  <span>{formatNumber(invoice.totalAmount)} {settings.currency}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>إجمالي القطع:</span>
                  <span>{invoice.totalQuantity} قطعة</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>الرصيد السابق للعميل:</span>
                  <span>{formatNumber(invoice.previousBalance)} {settings.currency}</span>
                </div>
                <div className="border-t border-slate-300 pt-1.5 flex justify-between text-sm font-bold text-slate-900">
                  <span>الصافي المطلوب:</span>
                  <span className="text-blue-700">{formatNumber(invoice.netAmount)} {settings.currency}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>الرصيد الحالي:</span>
                  <span>{formatNumber(invoice.currentBalance)} {settings.currency}</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 text-center text-xs text-slate-600 pt-6 border-t border-slate-200">
              <div>
                <p className="font-semibold">توقيع المستلم</p>
                <div className="mt-8 border-b border-slate-300 w-28 mx-auto"></div>
              </div>
              <div>
                <p className="font-semibold">ختم المتجر</p>
                <div className="mt-4 w-16 h-16 border border-slate-300 rounded-full mx-auto flex items-center justify-center text-[10px] text-slate-400">
                  ختم معتمد
                </div>
              </div>
              <div>
                <p className="font-semibold">المحاسب المسؤول</p>
                <div className="mt-8 border-b border-slate-300 w-28 mx-auto"></div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* FORMAT 3: THERMAL RECEIPT 80MM (طابعات البون والإيصالات الحرارية) */}
        {/* ============================================================== */}
        {printFormat === 'thermal' && (
          <div
            id="printable-invoice"
            className="thermal-receipt-print w-[80mm] max-w-[80mm] bg-white border border-slate-300 p-3 text-black text-[11px] leading-tight font-mono mx-auto shadow-sm"
          >
            <div className="text-center border-b border-dashed border-black pb-2 mb-2">
              <h3 className="font-bold text-sm font-sans">{settings.storeName}</h3>
              <p className="text-[10px]">{settings.commercialActivity}</p>
              <p className="text-[10px] mt-1">{settings.address} - {settings.city}</p>
              <p className="text-[10px]">هاتف: {settings.phone1}</p>
              <div className="font-bold text-xs mt-1.5 border border-black py-0.5">
                {invoiceTypeTitle}
              </div>
            </div>

            <div className="text-[10px] space-y-0.5 border-b border-dashed border-black pb-2 mb-2">
              <div className="flex justify-between">
                <span>رقم الفاتورة:</span>
                <span className="font-bold">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>التاريخ:</span>
                <span>{invoice.date} {invoice.time}</span>
              </div>
              <div className="flex justify-between">
                <span>الكاشير:</span>
                <span>{invoice.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span>العميل:</span>
                <span className="font-bold truncate max-w-[140px]">{invoice.customer.name}</span>
              </div>
            </div>

            {/* Thermal Items List */}
            <div className="border-b border-dashed border-black pb-2 mb-2">
              <div className="flex justify-between font-bold border-b border-black pb-1 mb-1 text-[10px]">
                <span className="w-1/2">الصنف</span>
                <span className="w-1/6 text-center">كمية</span>
                <span className="w-1/3 text-left">الإجمالي</span>
              </div>
              {invoice.items.map((item, idx) => (
                <div key={idx} className="py-1 text-[10px]">
                  <div className="font-medium">{item.name}</div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-[9px]">@{item.price}</span>
                    <span>x {item.quantity}</span>
                    <span className="font-bold text-left">{formatNumber(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Thermal Summary */}
            <div className="space-y-1 text-[10px] border-b border-dashed border-black pb-2 mb-2">
              <div className="flex justify-between font-bold text-xs">
                <span>الإجمالي:</span>
                <span>{formatNumber(invoice.totalAmount)} {settings.currency}</span>
              </div>
              <div className="flex justify-between">
                <span>إجمالي القطع:</span>
                <span>{invoice.totalQuantity}</span>
              </div>
              {invoice.previousBalance > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>الرصيد السابق:</span>
                  <span>{formatNumber(invoice.previousBalance)} {settings.currency}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs border-t border-black pt-1">
                <span>الصافي:</span>
                <span>{formatNumber(invoice.netAmount)} {settings.currency}</span>
              </div>
            </div>

            <div className="text-center text-[9px] pt-1 space-y-1">
              <p className="font-semibold">{invoice.amountInWords}</p>
              <p className="text-slate-600">شكراً لزيارتكم ونتمنى لكم يوماً سعيداً</p>
              <p className="font-mono text-[8px] text-slate-400">نظام Top Security لإدارة المحلات والمبيعات</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
