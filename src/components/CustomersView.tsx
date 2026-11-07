import React, { useState } from 'react';
import { Customer, Invoice, StoreSettings } from '../types';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  DollarSign,
  FileText,
  CreditCard,
  Edit2,
  Trash2,
  CheckCircle2
} from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  invoices: Invoice[];
  settings: StoreSettings;
  onUpdateCustomer: (customer: Customer) => void;
  onAddCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onReceivePayment: (customerId: string, amount: number, notes: string) => void;
  onViewInvoice: (invoice: Invoice) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  invoices,
  settings,
  onUpdateCustomer,
  onAddCustomer,
  onDeleteCustomer,
  onReceivePayment,
  onViewInvoice,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);
  const [paymentModalCustomer, setPaymentModalCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState<string>('سداد نقدي من الحساب الآجل');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({
    code: `01/3/${Math.floor(800 + Math.random() * 199)}`,
    name: '',
    phone1: '',
    phone2: '',
    city: 'المنصورة',
    address: '',
    category: 'عملاء',
    previousBalance: 0,
    currentBalance: 0,
  });

  const totalReceivables = customers.reduce((sum, c) => sum + Math.max(0, c.currentBalance), 0);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.phone1.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase());

    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setFormData({
      code: `01/3/${Math.floor(820 + customers.length + 1)}`,
      name: '',
      phone1: '',
      phone2: '',
      city: 'المنصورة',
      address: '',
      category: 'عملاء',
      previousBalance: 0,
      currentBalance: 0,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData(c);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingCustomer) {
      onUpdateCustomer({
        ...editingCustomer,
        ...formData,
      } as Customer);
      setEditingCustomer(null);
    } else {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        code: formData.code || `01/3/${Math.floor(800 + Math.random() * 199)}`,
        name: formData.name,
        phone1: formData.phone1 || '',
        phone2: formData.phone2 || '',
        city: formData.city || 'المنصورة',
        address: formData.address || '',
        category: (formData.category as any) || 'عملاء',
        previousBalance: Number(formData.previousBalance) || 0,
        currentBalance: Number(formData.previousBalance) || 0,
      };
      onAddCustomer(newCust);
      setShowAddModal(false);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalCustomer || paymentAmount <= 0) return;

    onReceivePayment(paymentModalCustomer.id, paymentAmount, paymentNotes);
    setPaymentModalCustomer(null);
    setPaymentAmount(0);
  };

  return (
    <div className="space-y-4">
      {/* Top Receivables Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>إجمالي العملاء المسجلين</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {customers.length} <span className="text-xs font-sans text-slate-500 font-normal">عميل وشركة</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>إجمالي المديونيات المستحقة للمحل</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold font-mono text-amber-700 mt-1">
            {totalReceivables.toLocaleString()} <span className="text-xs font-sans text-slate-500 font-normal">{settings.currency}</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>العملاء ذوو الحسابات الآجلة</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {customers.filter((c) => c.currentBalance > 0).length}{' '}
            <span className="text-xs font-sans text-slate-500 font-normal">عميل عليهم رصيد</span>
          </p>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم، كود العميل، رقم الهاتف، أو المدينة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pr-9 pl-3 py-2 text-slate-900"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700"
            >
              <option value="all">جميع الفئات</option>
              <option value="عملاء">عملاء</option>
              <option value="جملة">جملة</option>
              <option value="شركات">شركات ومقاولات</option>
              <option value="نقدي">نقدي صالة</option>
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل عميل جديد</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-20">كود العميل</th>
                <th className="py-2.5 px-3">اسم العميل / الشركة</th>
                <th className="py-2.5 px-3">الفئة</th>
                <th className="py-2.5 px-3">الهاتف</th>
                <th className="py-2.5 px-3">المدينة والعنوان</th>
                <th className="py-2.5 px-3 text-center">الرصيد السابق</th>
                <th className="py-2.5 px-3 text-center font-bold">الرصيد الحالي (المستحق)</th>
                <th className="py-2.5 px-3 text-center w-40">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                    {cust.code}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {cust.name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                      {cust.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {cust.phone1 || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {cust.city} {cust.address ? `- ${cust.address}` : ''}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                    {cust.previousBalance.toLocaleString()} {settings.currency}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-sm">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        cust.currentBalance > 0
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {cust.currentBalance.toLocaleString()} {settings.currency}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Receive Payment Voucher */}
                      <button
                        onClick={() => {
                          setPaymentModalCustomer(cust);
                          setPaymentAmount(cust.currentBalance > 0 ? cust.currentBalance : 0);
                        }}
                        className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded transition-colors"
                        title="سند قبض / تحصيل نقدي"
                      >
                        سند قبض
                      </button>

                      {/* Account Statement */}
                      <button
                        onClick={() => setSelectedCustomerForHistory(cust)}
                        className="p-1 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                        title="كشف حساب العميل"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEdit(cust)}
                        className="p-1 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف العميل (${cust.name})؟`)) {
                            onDeleteCustomer(cust.id);
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CUSTOMER ACCOUNT STATEMENT */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  كشف حساب العميل: {selectedCustomerForHistory.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  كود: {selectedCustomerForHistory.code} | هاتف: {selectedCustomerForHistory.phone1}
                </p>
              </div>
              <div className="text-left font-mono">
                <span className="text-xs text-slate-500 block">الرصيد الحالي المستحق:</span>
                <span className="text-base font-bold text-amber-700">
                  {selectedCustomerForHistory.currentBalance.toLocaleString()} {settings.currency}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800">سجل الفواتير الصادرة للعميل:</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 font-bold border-b text-slate-700">
                    <tr>
                      <th className="py-2 px-3">رقم الفاتورة</th>
                      <th className="py-2 px-3">التاريخ</th>
                      <th className="py-2 px-3">النوع</th>
                      <th className="py-2 px-3 text-center">المبلغ</th>
                      <th className="py-2 px-3 text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices
                      .filter((inv) => inv.customer.id === selectedCustomerForHistory.id || inv.customer.name === selectedCustomerForHistory.name)
                      .map((inv) => (
                        <tr key={inv.id}>
                          <td className="py-2 px-3 font-mono font-bold text-blue-700">
                            #{inv.invoiceNumber}
                          </td>
                          <td className="py-2 px-3 font-mono">{inv.date}</td>
                          <td className="py-2 px-3">
                            {inv.type === 'quotation' ? 'بيان أسعار' : 'فاتورة مبيعات'}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold">
                            {inv.netAmount.toLocaleString()} {settings.currency}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => {
                                onViewInvoice(inv);
                                setSelectedCustomerForHistory(null);
                              }}
                              className="text-xs text-blue-600 hover:underline font-semibold"
                            >
                              عرض وطباعة
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedCustomerForHistory(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECEIVE PAYMENT VOUCHER (سند قبض) */}
      {paymentModalCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>إصدار سند قبض نقدي (تحصيل من عميل)</span>
            </h3>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">اسم العميل:</span>
                  <span className="font-bold text-slate-900">{paymentModalCustomer.name}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-600">الرصيد المدين الحالي:</span>
                  <span className="font-bold text-amber-700 text-sm">
                    {paymentModalCustomer.currentBalance.toLocaleString()} {settings.currency}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">المبلغ المحصل نقداً:</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-lg text-center text-emerald-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">البيان / ملاحظات السند:</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setPaymentModalCustomer(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  تأكيد التحصيل وإيداع بالخزينة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CUSTOMER */}
      {(showAddModal || editingCustomer) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">
              {editingCustomer ? 'تعديل بيانات العميل' : 'تسجيل عميل جديد'}
            </h3>
            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم العميل:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: كريم هشام"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">كود العميل:</label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الهاتف 1:</label>
                  <input
                    type="text"
                    required
                    placeholder="01026642088"
                    value={formData.phone1 || ''}
                    onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم الهاتف 2 (اختياري):</label>
                  <input
                    type="text"
                    value={formData.phone2 || ''}
                    onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المدينة:</label>
                  <input
                    type="text"
                    value={formData.city || 'المنصورة'}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الفئة:</label>
                  <select
                    value={formData.category || 'عملاء'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="عملاء">عملاء</option>
                    <option value="جملة">جملة</option>
                    <option value="شركات">شركات ومقاولات</option>
                    <option value="نقدي">نقدي صالة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">العنوان بالتفصيل:</label>
                <input
                  type="text"
                  placeholder="مجمع المحاكم - شارع البحر"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الرصيد السابق (المديونية):</label>
                <input
                  type="number"
                  value={formData.currentBalance || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentBalance: Number(e.target.value) || 0,
                      previousBalance: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCustomer(null);
                  }}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  حفظ بيانات العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
