import React, { useState } from 'react';
import { Expense, CashShift, StoreSettings } from '../types';
import {
  Wallet,
  Plus,
  ArrowDownRight,
  ArrowUpLeft,
  Calendar,
  Lock,
  Unlock,
  Receipt,
  Trash2,
  DollarSign
} from 'lucide-react';

interface CashierExpensesViewProps {
  expenses: Expense[];
  shift: CashShift;
  settings: StoreSettings;
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateShift: (shift: CashShift) => void;
}

export const CashierExpensesView: React.FC<CashierExpensesViewProps> = ({
  expenses,
  shift,
  settings,
  onAddExpense,
  onDeleteExpense,
  onUpdateShift,
}) => {
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [actualCashCount, setActualCashCount] = useState<number>(0);

  const [expenseForm, setExpenseForm] = useState<Partial<Expense>>({
    title: '',
    category: 'نثريات وضيافة',
    amount: 0,
    paidBy: 'كاشير المحل',
    notes: '',
  });

  const totalExpensesToday = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Cash in drawer formula
  const currentCashInDrawer =
    shift.openingCash +
    shift.totalCashSales +
    shift.totalCustomerCollections -
    totalExpensesToday;

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.title?.trim() || !expenseForm.amount) return;

    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      date: formattedDate,
      title: expenseForm.title,
      category: (expenseForm.category as any) || 'نثريات وضيافة',
      amount: Number(expenseForm.amount),
      paidBy: expenseForm.paidBy || 'كاشير المحل',
      notes: expenseForm.notes,
    };

    onAddExpense(newExp);
    setShowAddExpenseModal(false);
    setExpenseForm({
      title: '',
      category: 'نثريات وضيافة',
      amount: 0,
      paidBy: 'كاشير المحل',
      notes: '',
    });
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    const diff = actualCashCount - currentCashInDrawer;
    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    onUpdateShift({
      ...shift,
      status: 'closed',
      closedAt: nowTime,
      totalExpenses: totalExpensesToday,
      expectedCash: currentCashInDrawer,
      actualCash: actualCashCount,
      difference: diff,
    });
    setShowShiftModal(false);
  };

  const handleOpenNewShift = () => {
    const opening = Number(prompt('أدخل الرصيد الافتتاحي لبدء الوردية الجديدة (جنيه):', '1500')) || 0;
    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    const nowTime = today.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    onUpdateShift({
      id: `shift-${Date.now()}`,
      date: formattedDate,
      openedAt: nowTime,
      openingCash: opening,
      totalCashSales: 0,
      totalCreditSales: 0,
      totalCustomerCollections: 0,
      totalExpenses: 0,
      expectedCash: opening,
      status: 'open',
      cashierName: 'مبيعات 1',
    });
  };

  return (
    <div className="space-y-4">
      {/* Cash Drawer Shift Status Card */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">صندوق الكاشير والخزينة اليومية</h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    shift.status === 'open'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {shift.status === 'open' ? 'الوردية مفتوحة حالياً' : 'الوردية مغلقة'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تاريخ الوردية: {shift.date} · بدأت: {shift.openedAt} · الكاشير: {shift.cashierName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {shift.status === 'open' ? (
              <button
                onClick={() => {
                  setActualCashCount(currentCashInDrawer);
                  setShowShiftModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>إغلاق الوردية وجرد الدرج</span>
              </button>
            ) : (
              <button
                onClick={handleOpenNewShift}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>افتتاح وردية جديدة</span>
              </button>
            )}
          </div>
        </div>

        {/* Cash Calculations Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-center">
          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
            <span className="text-[11px] font-sans text-slate-400 block mb-1">الرصيد الافتتاحي</span>
            <span className="text-base font-bold text-slate-200">
              {shift.openingCash.toLocaleString()} {settings.currency}
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
            <span className="text-[11px] font-sans text-emerald-400 block mb-1">+ مبيعات الكاش</span>
            <span className="text-base font-bold text-emerald-400">
              {shift.totalCashSales.toLocaleString()} {settings.currency}
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
            <span className="text-[11px] font-sans text-blue-400 block mb-1">+ تحصيلات العملاء</span>
            <span className="text-base font-bold text-blue-400">
              {shift.totalCustomerCollections.toLocaleString()} {settings.currency}
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
            <span className="text-[11px] font-sans text-red-400 block mb-1">- المصروفات النقدية</span>
            <span className="text-base font-bold text-red-400">
              {totalExpensesToday.toLocaleString()} {settings.currency}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-blue-950/70 p-3 rounded-lg border border-blue-500/40">
            <span className="text-[11px] font-sans text-blue-300 font-bold block mb-1">= النقد الفعلي بالدرج</span>
            <span className="text-lg font-bold text-white">
              {currentCashInDrawer.toLocaleString()} {settings.currency}
            </span>
          </div>
        </div>

        {shift.status === 'closed' && shift.difference !== undefined && (
          <div className="mt-3 p-2.5 bg-slate-800 rounded-lg text-xs flex items-center justify-between font-mono">
            <span>الرصيد الفعلي المعدود عند الإغلاق: {shift.actualCash?.toLocaleString()} {settings.currency}</span>
            <span
              className={`font-bold ${
                shift.difference === 0
                  ? 'text-emerald-400'
                  : shift.difference > 0
                  ? 'text-blue-400'
                  : 'text-red-400'
              }`}
            >
              الفارق:{' '}
              {shift.difference === 0
                ? 'متطابق بالكامل (0)'
                : shift.difference > 0
                ? `+${shift.difference} زيادة بالخزينة`
                : `${shift.difference} عجز بالخزينة`}
            </span>
          </div>
        )}
      </div>

      {/* Daily Expenses Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-red-600" />
              <span>المصروفات والنثريات اليومية</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تسجيل كافة المصروفات التشغيلية للمحل وخصمها تلقائياً من درج النقدية
            </p>
          </div>

          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مصروف جديد</span>
          </button>
        </div>

        {/* Expenses Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">التاريخ</th>
                <th className="py-2.5 px-3">بيان المصروف</th>
                <th className="py-2.5 px-3">التصنيف</th>
                <th className="py-2.5 px-3">صُرف بواسطة</th>
                <th className="py-2.5 px-3 text-center font-bold">المبلغ</th>
                <th className="py-2.5 px-3">ملاحظات</th>
                <th className="py-2.5 px-3 text-center w-16">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    لم يتم تسجيل أي مصروفات لهذا اليوم
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-600">{exp.date}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{exp.title}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{exp.paidBy}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-red-600 text-sm">
                      {exp.amount.toLocaleString()} {settings.currency}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{exp.notes || '-'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف المصروف (${exp.title})؟`)) {
                            onDeleteExpense(exp.id);
                          }
                        }}
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="حذف المصروف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
              <tr>
                <td colSpan={4} className="py-2.5 px-3 text-slate-900">
                  إجمالي المصروفات:
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-red-600 text-base">
                  {totalExpensesToday.toLocaleString()} {settings.currency}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* MODAL: ADD EXPENSE */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-red-600" />
              <span>تسجيل مصروف يومي جديد</span>
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">بيان المصروف:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فاتورة كهرباء، ضيافة، أدوات نظافة"
                  value={expenseForm.title || ''}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المبلغ المصروف:</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={expenseForm.amount || ''}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-red-600 text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تصنيف المصروف:</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="نثريات وضيافة">نثريات وضيافة</option>
                    <option value="كهرباء ومياه">كهرباء ومياه</option>
                    <option value="إيجار">إيجار</option>
                    <option value="مرتبات">سلفة / مرتبات</option>
                    <option value="صيانة">صيانة</option>
                    <option value="نقل وبضائع">نقل ومشال بضائع</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">صُرف بواسطة:</label>
                <input
                  type="text"
                  value={expenseForm.paidBy || 'كاشير المحل'}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ملاحظات إضافية:</label>
                <input
                  type="text"
                  placeholder="رقم الإيصال أو تفاصيل أخرى..."
                  value={expenseForm.notes || ''}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                >
                  تسجيل المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLOSE SHIFT */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              <span>إغلاق الوردية وجرد النقدية بالدرج</span>
            </h3>

            <form onSubmit={handleCloseShift} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">الرصيد الدفتري المتوقع بالدرج:</span>
                  <span className="font-mono font-bold text-blue-700">
                    {currentCashInDrawer.toLocaleString()} {settings.currency}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  المبلغ الفعلي المعدود في الدرج الآن:
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={actualCashCount || ''}
                  onChange={(e) => setActualCashCount(Number(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-lg text-center"
                />
              </div>

              {/* Difference preview */}
              <div className="p-2.5 rounded-lg border text-center font-mono text-xs">
                {actualCashCount - currentCashInDrawer === 0 ? (
                  <span className="text-emerald-700 font-bold">
                    ✓ الدرج متطابق تماماً بدون زيادة أو عجز
                  </span>
                ) : actualCashCount - currentCashInDrawer > 0 ? (
                  <span className="text-blue-700 font-bold">
                    + زيادة في الدرج بمقدار{' '}
                    {(actualCashCount - currentCashInDrawer).toLocaleString()} {settings.currency}
                  </span>
                ) : (
                  <span className="text-red-700 font-bold">
                    - عجز في الدرج بمقدار{' '}
                    {Math.abs(actualCashCount - currentCashInDrawer).toLocaleString()} {settings.currency}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                >
                  تأكيد إغلاق الوردية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
