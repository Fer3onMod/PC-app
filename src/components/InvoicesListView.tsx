import React, { useState } from 'react';
import { Invoice, StoreSettings } from '../types';
import {
  FileText,
  Search,
  Printer,
  Calendar,
  RotateCcw,
  Trash2,
  Eye,
  CheckCircle,
  Clock
} from 'lucide-react';

interface InvoicesListViewProps {
  invoices: Invoice[];
  settings: StoreSettings;
  onViewInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onReturnInvoice: (invoice: Invoice) => void;
}

export const InvoicesListView: React.FC<InvoicesListViewProps> = ({
  invoices,
  settings,
  onViewInvoice,
  onDeleteInvoice,
  onReturnInvoice,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | Invoice['type']>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.phone1.includes(search) ||
      inv.date.includes(search);

    const matchesType = typeFilter === 'all' || inv.type === typeFilter;
    const matchesPayment = paymentFilter === 'all' || inv.paymentMethod === paymentFilter;

    return matchesSearch && matchesType && matchesPayment;
  });

  const totalSalesAmount = invoices
    .filter((inv) => inv.type === 'sales' || inv.type === 'tax_invoice')
    .reduce((sum, inv) => sum + inv.netAmount, 0);

  const totalQuotationsAmount = invoices
    .filter((inv) => inv.type === 'quotation')
    .reduce((sum, inv) => sum + inv.netAmount, 0);

  const getTypeLabel = (type: Invoice['type']) => {
    switch (type) {
      case 'quotation':
        return { label: 'بيان أسعار', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'sales':
        return { label: 'فاتورة مبيعات', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'tax_invoice':
        return { label: 'فاتورة ضريبية', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'return':
        return { label: 'مرتجع مبيعات', color: 'bg-red-50 text-red-700 border-red-200' };
      default:
        return { label: 'فاتورة', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getPaymentLabel = (method: Invoice['paymentMethod']) => {
    switch (method) {
      case 'cash':
        return 'نقدي';
      case 'credit':
        return 'آجل (ذمم)';
      case 'partial':
        return 'سداد جزئي';
      case 'transfer':
        return 'تحويل';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>إجمالي الفواتير المسجلة</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {invoices.length} <span className="text-xs font-sans text-slate-500 font-normal">فاتورة وعرض سعر</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>إجمالي قيمة المبيعات</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {totalSalesAmount.toLocaleString()} <span className="text-xs font-sans text-slate-500 font-normal">{settings.currency}</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>إجمالي عروض الأسعار الصادرة</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold font-mono text-purple-700 mt-1">
            {totalQuotationsAmount.toLocaleString()} <span className="text-xs font-sans text-slate-500 font-normal">{settings.currency}</span>
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث برقم الفاتورة، اسم العميل، الهاتف، أو التاريخ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pr-9 pl-3 py-2 text-slate-900"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700"
            >
              <option value="all">جميع أنواع المستندات</option>
              <option value="quotation">بيان أسعار</option>
              <option value="sales">فواتير المبيعات</option>
              <option value="tax_invoice">فواتير ضريبية</option>
              <option value="return">مرتجع مبيعات</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700"
            >
              <option value="all">كل طرق الدفع</option>
              <option value="cash">نقدي (كاش)</option>
              <option value="credit">آجل (ذمم)</option>
              <option value="partial">سداد جزئي</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-20">رقم الفاتورة</th>
                <th className="py-2.5 px-3">التاريخ والوقت</th>
                <th className="py-2.5 px-3">نوع المستند</th>
                <th className="py-2.5 px-3">العميل</th>
                <th className="py-2.5 px-2 text-center">عدد الأصناف</th>
                <th className="py-2.5 px-2 text-center">إجمالي الكمية</th>
                <th className="py-2.5 px-3 text-center">طريقة السداد</th>
                <th className="py-2.5 px-3 text-center font-bold">صافي الفاتورة</th>
                <th className="py-2.5 px-3 text-center w-36">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    لا توجد فواتير مطابقة لبحثك
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const typeInfo = getTypeLabel(inv.type);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">
                        #{inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-800">{inv.date}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{inv.time}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${typeInfo.color}`}
                        >
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{inv.customer.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {inv.customer.phone1 || inv.customer.city}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-slate-600">
                        {inv.items.length}
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-semibold">
                        {inv.totalQuantity}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {getPaymentLabel(inv.paymentMethod)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-sm text-slate-900">
                        {inv.netAmount.toLocaleString()} {settings.currency}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print and view button */}
                          <button
                            onClick={() => onViewInvoice(inv)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                            title="معاينة وطباعة الفاتورة"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>طباعة</span>
                          </button>

                          {/* Sales Return */}
                          {inv.type !== 'return' && (
                            <button
                              onClick={() => onReturnInvoice(inv)}
                              className="p-1 hover:bg-amber-50 text-slate-500 hover:text-amber-700 rounded transition-colors"
                              title="إصدار مرتجع للفاتورة"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف الفاتورة رقم #${inv.invoiceNumber}؟`)) {
                                onDeleteInvoice(inv.id);
                              }
                            }}
                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
