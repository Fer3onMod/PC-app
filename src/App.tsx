import React, { useState, useEffect } from 'react';
import {
  Product,
  Customer,
  Invoice,
  Expense,
  CashShift,
  StoreSettings
} from './types';
import { storage } from './utils/storage';
import { WindowsTitleBar } from './components/WindowsTitleBar';
import { Logo } from './components/Logo';
import { POSView } from './components/POSView';
import { PrintableInvoice } from './components/PrintableInvoice';
import { InvoicesListView } from './components/InvoicesListView';
import { InventoryView } from './components/InventoryView';
import { CustomersView } from './components/CustomersView';
import { CashierExpensesView } from './components/CashierExpensesView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

import {
  ShoppingCart,
  Printer,
  FileText,
  Package,
  Users,
  Wallet,
  FileBarChart,
  Settings,
  Plus,
  HelpCircle,
  X,
  Keyboard,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

type ActiveTab =
  | 'pos'
  | 'print_invoice'
  | 'invoices_list'
  | 'inventory'
  | 'customers'
  | 'cashier_expenses'
  | 'reports'
  | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);

  // Application Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [shift, setShift] = useState<CashShift>(storage.getShift());
  const [settings, setSettings] = useState<StoreSettings>(storage.getSettings());
  const [activeInvoice, setActiveInvoice] = useState<Invoice>(storage.getActiveInvoice());

  const reloadData = () => {
    setProducts(storage.getProducts());
    setCustomers(storage.getCustomers());
    setInvoices(storage.getInvoices());
    setExpenses(storage.getExpenses());
    setShift(storage.getShift());
    setSettings(storage.getSettings());
    setActiveInvoice(storage.getActiveInvoice());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Trigger brand new invoice flow
  const handleStartNewInvoice = () => {
    setInvoiceToEdit(null);
    setResetTrigger((prev) => prev + 1);
    setActiveTab('pos');
  };

  // Global Keyboard Shortcuts for Windows desktop feel
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setShowShortcutsModal(true);
      } else if (e.key === 'F2') {
        e.preventDefault();
        handleStartNewInvoice();
      } else if (e.key === 'F10') {
        e.preventDefault();
        setActiveTab('cashier_expenses');
      } else if (e.key === 'Escape') {
        setShowShortcutsModal(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleUpdateProducts = (updatedProds: Product[]) => {
    setProducts(updatedProds);
    storage.saveProducts(updatedProds);
  };

  const handleUpdateCustomers = (updatedCusts: Customer[]) => {
    setCustomers(updatedCusts);
    storage.saveCustomers(updatedCusts);
  };

  const handleUpdateInvoices = (updatedInvs: Invoice[]) => {
    setInvoices(updatedInvs);
    storage.saveInvoices(updatedInvs);
  };

  const handleUpdateExpenses = (updatedExps: Expense[]) => {
    setExpenses(updatedExps);
    storage.saveExpenses(updatedExps);
  };

  const handleUpdateShift = (updatedShift: CashShift) => {
    setShift(updatedShift);
    storage.saveShift(updatedShift);
  };

  const handleUpdateSettings = (updatedSettings: StoreSettings) => {
    setSettings(updatedSettings);
    storage.saveSettings(updatedSettings);
  };

  const getNextInvoiceNumber = (): string => {
    if (invoices.length === 0) return '26700';
    const nums = invoices
      .map((inv) => parseInt(inv.invoiceNumber, 10))
      .filter((n) => !isNaN(n));
    if (nums.length === 0) return '26700';
    return String(Math.max(...nums) + 1);
  };

  const handleSaveInvoice = (invoice: Invoice, shouldPrint: boolean) => {
    const newInvoices = [invoice, ...invoices];
    handleUpdateInvoices(newInvoices);

    const updatedProducts = products.map((prod) => {
      const matchItem = invoice.items.find((item) => item.productId === prod.id);
      if (matchItem) {
        return {
          ...prod,
          currentStock: Math.max(0, prod.currentStock - matchItem.quantity),
        };
      }
      return prod;
    });
    handleUpdateProducts(updatedProducts);

    if (invoice.paymentMethod === 'credit' || invoice.paymentMethod === 'partial') {
      const remainingDebt = invoice.netAmount - (invoice.paidAmount || 0);
      const updatedCustomers = customers.map((c) => {
        if (c.id === invoice.customer.id) {
          return {
            ...c,
            previousBalance: c.currentBalance,
            currentBalance: c.currentBalance + remainingDebt,
          };
        }
        return c;
      });
      handleUpdateCustomers(updatedCustomers);
    }

    if (invoice.paidAmount > 0 || invoice.paymentMethod === 'cash') {
      const cashReceived =
        invoice.paymentMethod === 'cash' ? invoice.netAmount : invoice.paidAmount;
      handleUpdateShift({
        ...shift,
        totalCashSales: shift.totalCashSales + cashReceived,
        expectedCash: shift.expectedCash + cashReceived,
      });
    }

    setActiveInvoice(invoice);
    storage.saveActiveInvoice(invoice);

    if (shouldPrint) {
      setActiveTab('print_invoice');
      setTimeout(() => {
        window.print();
      }, 400);
    }
  };

  const handleReceivePayment = (customerId: string, amount: number, notes: string) => {
    const updatedCustomers = customers.map((c) => {
      if (c.id === customerId) {
        return {
          ...c,
          previousBalance: c.currentBalance,
          currentBalance: Math.max(0, c.currentBalance - amount),
        };
      }
      return c;
    });
    handleUpdateCustomers(updatedCustomers);

    handleUpdateShift({
      ...shift,
      totalCustomerCollections: shift.totalCustomerCollections + amount,
      expectedCash: shift.expectedCash + amount,
    });
  };

  const handleReturnInvoice = (originalInvoice: Invoice) => {

    const returnInvoice: Invoice = {
      ...originalInvoice,
      id: `return-${Date.now()}`,
      invoiceNumber: `RET-${originalInvoice.invoiceNumber}`,
      type: 'return',
      date: new Date().toLocaleDateString('ar-EG'),
      notes: `مرتجع للفاتورة الأصلية رقم #${originalInvoice.invoiceNumber}`,
    };

    const updatedProducts = products.map((prod) => {
      const match = originalInvoice.items.find((item) => item.productId === prod.id);
      if (match) {
        return { ...prod, currentStock: prod.currentStock + match.quantity };
      }
      return prod;
    });
    handleUpdateProducts(updatedProducts);

    if (originalInvoice.paymentMethod === 'credit') {
      const updatedCustomers = customers.map((c) => {
        if (c.id === originalInvoice.customer.id) {
          return {
            ...c,
            currentBalance: Math.max(0, c.currentBalance - originalInvoice.netAmount),
          };
        }
        return c;
      });
      handleUpdateCustomers(updatedCustomers);
    }

    handleUpdateInvoices([returnInvoice, ...invoices]);
    setActiveInvoice(returnInvoice);
    setActiveTab('print_invoice');
  };

  const lowStockCount = products.filter(
    (p) => p.currentStock <= p.minStock && p.currentStock > 0
  ).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none" dir="rtl">
      {/* 1. Windows 11 Desktop Title Bar with Top Security Logo */}
      <WindowsTitleBar
        storeName={settings.storeName}
        onOpenHelp={() => setShowShortcutsModal(true)}
        onNewInvoice={handleStartNewInvoice}
      />

      {/* 2. Main Desktop Workstation Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Modern Windows Navigation Dock Sidebar */}
        <aside className="no-print w-64 bg-slate-950/95 border-l border-slate-800 flex flex-col justify-between shrink-0 p-3">
          <div className="space-y-3.5">
            {/* Top Brand Showcase in Sidebar */}
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
              <Logo size="sm" showSubtitle={true} />
            </div>

            {/* Prominent Action: New Invoice F2 */}
            <button
              onClick={handleStartNewInvoice}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>فاتورة جديدة فارغة [F2]</span>
            </button>

            {/* Navigation Groups */}
            <nav className="space-y-1 text-xs">
              <div className="text-[10px] font-bold text-slate-500 px-2 pt-1 pb-1">
                المبيعات والكاشير
              </div>
              {[
                { id: 'pos', label: 'كاشير ومبيعات (F2)', icon: ShoppingCart },
                { id: 'print_invoice', label: 'معاينة وطباعة الفاتورة', icon: Printer },
                { id: 'invoices_list', label: 'سجل الفواتير والمبيعات', icon: FileText, badge: invoices.length },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'pos') {
                        setInvoiceToEdit(null);
                      }
                      setActiveTab(item.id as ActiveTab);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="text-[10px] font-bold text-slate-500 px-2 pt-2.5 pb-1">
                المخازن والمستودعات
              </div>
              {[
                { id: 'inventory', label: 'المخزون والأصناف', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} نواقص` : undefined, badgeColor: 'bg-amber-500/20 text-amber-400' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as ActiveTab)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${item.badgeColor || ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="text-[10px] font-bold text-slate-500 px-2 pt-2.5 pb-1">
                المالية والتقارير
              </div>
              {[
                { id: 'customers', label: 'العملاء والديون', icon: Users },
                { id: 'cashier_expenses', label: 'الخزينة والمصروفات (F10)', icon: Wallet },
                { id: 'reports', label: 'التقارير اليومية والأرباح', icon: FileBarChart },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as ActiveTab)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}

              <div className="text-[10px] font-bold text-slate-500 px-2 pt-2.5 pb-1">
                النظام
              </div>
              {[
                { id: 'settings', label: 'إعدادات المتجر والفاتورة', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as ActiveTab)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Cash Drawer Widget at bottom of sidebar */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>درج الخزينة اليومي</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="font-mono font-bold text-sm text-emerald-400">
              {(shift.openingCash + shift.totalCashSales + shift.totalCustomerCollections - shift.totalExpenses).toLocaleString()} {settings.currency}
            </div>
            <p className="text-[10px] text-slate-500">حالة الدرج: مفتوح</p>
          </div>
        </aside>

        {/* Workspace Canvas (Light / High Contrast Content Surface) */}
        <div className="flex-1 bg-slate-100 text-slate-900 flex flex-col overflow-y-auto">
          <div className="flex-1 p-3 sm:p-5">
            {activeTab === 'pos' && (
              <POSView
                products={products}
                customers={customers}
                settings={settings}
                nextInvoiceNumber={getNextInvoiceNumber()}
                onSaveInvoice={handleSaveInvoice}
                onAddCustomer={(newCust) => handleUpdateCustomers([newCust, ...customers])}
                invoiceToEdit={invoiceToEdit}
                resetTrigger={resetTrigger}
              />
            )}

            {activeTab === 'print_invoice' && (
              <PrintableInvoice
                invoice={activeInvoice}
                settings={settings}
                onBack={() => setActiveTab('invoices_list')}
                onEdit={(inv) => {
                  setInvoiceToEdit(inv);
                  setActiveTab('pos');
                }}
                onUpdateType={(newType) => {
                  const updated = { ...activeInvoice, type: newType };
                  setActiveInvoice(updated);
                  handleUpdateInvoices(
                    invoices.map((i) => (i.id === updated.id ? updated : i))
                  );
                }}
              />
            )}

            {activeTab === 'invoices_list' && (
              <InvoicesListView
                invoices={invoices}
                settings={settings}
                onViewInvoice={(inv) => {
                  setActiveInvoice(inv);
                  setActiveTab('print_invoice');
                }}
                onDeleteInvoice={(id) => {
                  handleUpdateInvoices(invoices.filter((i) => i.id !== id));
                }}
                onReturnInvoice={handleReturnInvoice}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                products={products}
                settings={settings}
                onAddProduct={(prod) => handleUpdateProducts([prod, ...products])}
                onUpdateProduct={(prod) =>
                  handleUpdateProducts(products.map((p) => (p.id === prod.id ? prod : p)))
                }
                onDeleteProduct={(id) =>
                  handleUpdateProducts(products.filter((p) => p.id !== id))
                }
                onDeleteMultipleProducts={(ids) =>
                  handleUpdateProducts(products.filter((p) => !ids.includes(p.id)))
                }
                onDeleteAllProducts={() => handleUpdateProducts([])}
                onPurgeMockData={() => {
                  storage.purgeAllMockData();
                  reloadData();
                }}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersView
                customers={customers}
                invoices={invoices}
                settings={settings}
                onAddCustomer={(cust) => handleUpdateCustomers([cust, ...customers])}
                onUpdateCustomer={(cust) =>
                  handleUpdateCustomers(customers.map((c) => (c.id === cust.id ? cust : c)))
                }
                onDeleteCustomer={(id) =>
                  handleUpdateCustomers(customers.filter((c) => c.id !== id))
                }
                onReceivePayment={handleReceivePayment}
                onViewInvoice={(inv) => {
                  setActiveInvoice(inv);
                  setActiveTab('print_invoice');
                }}
              />
            )}

            {activeTab === 'cashier_expenses' && (
              <CashierExpensesView
                expenses={expenses}
                shift={shift}
                settings={settings}
                onAddExpense={(exp) => {
                  handleUpdateExpenses([exp, ...expenses]);
                  handleUpdateShift({
                    ...shift,
                    totalExpenses: shift.totalExpenses + exp.amount,
                    expectedCash: shift.expectedCash - exp.amount,
                  });
                }}
                onDeleteExpense={(id) => {
                  handleUpdateExpenses(expenses.filter((e) => e.id !== id));
                }}
                onUpdateShift={handleUpdateShift}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                invoices={invoices}
                expenses={expenses}
                products={products}
                shift={shift}
                settings={settings}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onDataReload={reloadData}
              />
            )}
          </div>

          {/* 3. Windows Desktop Status & Shortcut Bar */}
          <div className="no-print bg-slate-950 text-slate-400 border-t border-slate-800 px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono shrink-0 select-none">
            <div className="flex items-center gap-4">
              <button
                onClick={handleStartNewInvoice}
                className="flex items-center gap-1 text-slate-300 font-sans hover:text-white cursor-pointer"
              >
                <span className="font-bold text-sky-400">[F2]</span> فاتورة جديدة
              </button>
              <span className="flex items-center gap-1 text-slate-300 font-sans">
                <span className="font-bold text-sky-400">[F3]</span> بحث وسكانر
              </span>
              <span className="flex items-center gap-1 text-slate-300 font-sans">
                <span className="font-bold text-emerald-400">[F9]</span> حفظ وطباعة
              </span>
              <button
                onClick={() => setActiveTab('cashier_expenses')}
                className="flex items-center gap-1 text-slate-300 font-sans hover:text-white cursor-pointer"
              >
                <span className="font-bold text-amber-400">[F10]</span> الخزينة
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span>المستودع: {settings.defaultWarehouse}</span>
              <span>·</span>
              <span>العملة: {settings.currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: KEYBOARD SHORTCUTS HELP */}
      {showShortcutsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base">دليل اختصارات لوحة المفاتيح - Top Security</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: 'F1', label: 'فتح نافذة الاختصارات والمساعدة' },
                { key: 'F2', label: 'بدء فاتورة مبيعات جديدة ومسح السلة' },
                { key: 'F3', label: 'الانتقال المباشر لحقل البحث / قارئ الباركود' },
                { key: 'F8', label: 'حفظ الفاتورة فقط بدون طباعة' },
                { key: 'F9', label: 'حفظ الفاتورة والطباعة الفورية على الطابعة' },
                { key: 'F10', label: 'فتح حركة الخزينة والوردية اليومية' },
                { key: 'Ctrl + P', label: 'طباعة المستند الحالي في أي وقت' },
                { key: 'Escape', label: 'إغلاق النوافذ المنبثقة' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50"
                >
                  <span className="font-mono font-bold text-sky-300 bg-slate-950 px-2 py-1 rounded border border-slate-700">
                    {item.key}
                  </span>
                  <span className="text-slate-200">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-800">
              اضغط <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-white">Esc</kbd> للخروج
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
