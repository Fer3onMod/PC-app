import React, { useState, useEffect, useRef } from 'react';
import { Product, Customer, Invoice, InvoiceItem, InvoiceType, StoreSettings } from '../types';
import { tafqeet } from '../utils/tafqeet';
import {
  Search,
  Plus,
  Trash2,
  Printer,
  Save,
  UserPlus,
  RotateCcw,
  Tag,
  DollarSign,
  Package,
  Layers,
  Percent,
  CheckCircle,
  AlertCircle,
  Barcode,
  CreditCard,
  Wallet,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface POSViewProps {
  products: Product[];
  customers: Customer[];
  settings: StoreSettings;
  onSaveInvoice: (invoice: Invoice, shouldPrint: boolean) => void;
  onAddCustomer: (customer: Customer) => void;
  nextInvoiceNumber: string;
}

export const POSView: React.FC<POSViewProps> = ({
  products,
  customers,
  settings,
  onSaveInvoice,
  onAddCustomer,
  nextInvoiceNumber,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(
    customers[0] || {
      id: 'cust-walk-in',
      code: '01/3/001',
      name: 'عميل نقدي صالة',
      phone1: '',
      phone2: '',
      city: 'المنصورة',
      address: 'المحل',
      category: 'نقدي',
      previousBalance: 0,
      currentBalance: 0,
    }
  );

  const [invoiceType, setInvoiceType] = useState<InvoiceType>(
    settings.defaultInvoiceType || 'quotation'
  );
  const [warehouse, setWarehouse] = useState<string>(
    settings.defaultWarehouse || 'المخزن الرئيسي'
  );
  const [employeeNumber, setEmployeeNumber] = useState<string>('2');
  const [employeeName, setEmployeeName] = useState<string>('مبيعات 1');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'partial' | 'transfer'>('credit');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('الضمان سنة ضد عيوب الصناعة - الأسعار تشمل التوصيل');

  const [cartItems, setCartItems] = useState<InvoiceItem[]>([
    {
      id: 'cart-1',
      productId: 'prod-1',
      name: 'XVR5116HS-I3 بورت 16 / 5 ميجا',
      serialNumber: '',
      quantity: 1,
      price: 6100,
      discountPercent: 0,
      priceAfterDiscount: 6100,
      total: 6100,
      costPrice: 5200,
    },
    {
      id: 'cart-2',
      productId: 'prod-2',
      name: 'DH-HAC-HFW1500RLP-IL-T أوت الوان',
      serialNumber: '',
      quantity: 4,
      price: 1250,
      discountPercent: 0,
      priceAfterDiscount: 1250,
      total: 5000,
      costPrice: 980,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [customItemModal, setCustomItemModal] = useState(false);
  const [customItemForm, setCustomItemForm] = useState({
    name: '',
    serialNumber: '',
    price: 0,
    quantity: 1,
  });

  const [newCustForm, setNewCustForm] = useState({
    name: '',
    code: `01/3/${Math.floor(800 + Math.random() * 199)}`,
    phone1: '',
    phone2: '',
    city: 'المنصورة',
    address: '',
    category: 'عملاء' as Customer['category'],
    previousBalance: 0,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on F3 or mount
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.serialNumber && prod.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || prod.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate totals
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cartItems.reduce((acc, item) => acc + item.total, 0);
  const previousBalance = selectedCustomer?.currentBalance || 0;
  const netAmount = totalAmount;

  const currentBalance =
    paymentMethod === 'cash'
      ? previousBalance
      : paymentMethod === 'partial'
      ? previousBalance + (netAmount - paidAmount)
      : previousBalance + netAmount;

  const amountInWords = tafqeet(netAmount, settings.currency);

  const handleAddToCart = (product: Product) => {
    const existingIndex = cartItems.findIndex((item) => item.productId === product.id);
    if (existingIndex > -1) {
      const updated = [...cartItems];
      const current = updated[existingIndex];
      const newQty = current.quantity + 1;
      const total = newQty * current.priceAfterDiscount;
      updated[existingIndex] = {
        ...current,
        quantity: newQty,
        total,
      };
      setCartItems(updated);
    } else {
      const newItem: InvoiceItem = {
        id: `item-${Date.now()}-${Math.random()}`,
        productId: product.id,
        name: product.name,
        serialNumber: product.serialNumber || '',
        quantity: 1,
        price: product.sellingPrice,
        discountPercent: 0,
        priceAfterDiscount: product.sellingPrice,
        total: product.sellingPrice,
        costPrice: product.costPrice,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          const price = updated.price || 0;
          const discount = updated.discountPercent || 0;
          const priceAfterDiscount = Math.round((price * (1 - discount / 100)) * 100) / 100;
          const total = Math.round((priceAfterDiscount * updated.quantity) * 100) / 100;
          return {
            ...updated,
            priceAfterDiscount,
            total,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    if (cartItems.length > 0 && window.confirm('هل تريد بالتأكيد فتح فاتورة جديدة وتفريغ السلة؟')) {
      setCartItems([]);
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemForm.name.trim()) return;

    const newItem: InvoiceItem = {
      id: `custom-${Date.now()}`,
      name: customItemForm.name,
      serialNumber: customItemForm.serialNumber,
      quantity: Number(customItemForm.quantity) || 1,
      price: Number(customItemForm.price) || 0,
      discountPercent: 0,
      priceAfterDiscount: Number(customItemForm.price) || 0,
      total: (Number(customItemForm.price) || 0) * (Number(customItemForm.quantity) || 1),
    };

    setCartItems([...cartItems, newItem]);
    setCustomItemForm({ name: '', serialNumber: '', price: 0, quantity: 1 });
    setCustomItemModal(false);
  };

  const handleSaveNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustForm.name.trim()) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      code: newCustForm.code,
      name: newCustForm.name,
      phone1: newCustForm.phone1,
      phone2: newCustForm.phone2,
      city: newCustForm.city,
      address: newCustForm.address,
      category: newCustForm.category,
      previousBalance: Number(newCustForm.previousBalance) || 0,
      currentBalance: Number(newCustForm.previousBalance) || 0,
    };

    onAddCustomer(newCust);
    setSelectedCustomer(newCust);
    setShowAddCustomerModal(false);
    setNewCustForm({
      name: '',
      code: `01/3/${Math.floor(800 + Math.random() * 199)}`,
      phone1: '',
      phone2: '',
      city: 'المنصورة',
      address: '',
      category: 'عملاء',
      previousBalance: 0,
    });
  };

  const handleSave = (shouldPrint: boolean) => {
    if (cartItems.length === 0) {
      alert('من فضلك أضف أصنافاً للفاتورة أولاً!');
      return;
    }

    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    const formattedTime = today.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: nextInvoiceNumber,
      date: formattedDate,
      time: formattedTime,
      type: invoiceType,
      employeeNumber,
      employeeName,
      warehouse,
      customer: selectedCustomer,
      items: cartItems,
      totalAmount,
      totalQuantity,
      previousBalance,
      netAmount,
      paidAmount: paymentMethod === 'cash' ? netAmount : paidAmount,
      currentBalance,
      paymentMethod,
      amountInWords,
      notes,
      printFormat: 'a4',
    };

    onSaveInvoice(invoice, shouldPrint);
  };

  return (
    <div className="space-y-3">
      {/* Top Station Command Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Document Type Badge Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">المستند:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setInvoiceType('quotation')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  invoiceType === 'quotation'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                بيان أسعار
              </button>
              <button
                type="button"
                onClick={() => setInvoiceType('sales')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  invoiceType === 'sales'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                فاتورة مبيعات
              </button>
              <button
                type="button"
                onClick={() => setInvoiceType('tax_invoice')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  invoiceType === 'tax_invoice'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ضريبية
              </button>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          {/* Warehouse */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-500">المستودع:</span>
            <input
              type="text"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs font-medium w-28 text-slate-800 focus:bg-white"
            />
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          {/* Cashier / Employee */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-500">الكاشير:</span>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs font-medium w-24 text-slate-800"
            />
          </div>
        </div>

        {/* Invoice Number & New Invoice Action */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleClearCart}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
            title="فاتورة جديدة (F2)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>فاتورة جديدة [F2]</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-mono font-bold shadow-xs">
            <span className="text-slate-400 font-sans font-normal">رقم:</span>
            <span className="text-sm text-blue-400">#{nextInvoiceNumber}</span>
          </div>
        </div>
      </div>

      {/* Main POS Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* ============================================================== */}
        {/* LEFT COLUMN: ACTIVE INVOICE CART (8 COLS) */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 space-y-3">
          {/* Customer Selection Card */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>بيانات العميل والحساب</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({selectedCustomer.category} - {selectedCustomer.city})
                </span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(true)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ عميل جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              <div className="md:col-span-6">
                <select
                  value={selectedCustomer.id}
                  onChange={(e) => {
                    const found = customers.find((c) => c.id === e.target.value);
                    if (found) setSelectedCustomer(found);
                  }}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus:bg-white"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} · {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer debt status bar */}
              <div className="md:col-span-6 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">الهاتف</span>
                  <span className="font-mono font-bold text-slate-800">{selectedCustomer.phone1 || 'لا يوجد'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">العنوان</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[130px] block">
                    {selectedCustomer.address || selectedCustomer.city}
                  </span>
                </div>
                <div className="text-left font-mono">
                  <span className="text-slate-400 text-[11px] block">الرصيد السابق</span>
                  <span className={`font-bold ${selectedCustomer.currentBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {selectedCustomer.currentBalance.toLocaleString()} {settings.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Table Container */}
          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900">جدول أصناف الفاتورة</h3>
                <span className="text-[11px] px-2 py-0.2 bg-blue-100 text-blue-800 rounded font-mono font-bold">
                  {cartItems.length} صنف · {totalQuantity} قطعة
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomItemModal(true)}
                  className="text-xs flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>بند حر / خدمة</span>
                </button>
                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="text-xs text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                    title="تفريغ السلة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-600">سلة الفاتورة فارغة حالياً</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  انقر على أي صنف من قائمة المتجر على اليسار أو اضغط F3 للبحث
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-2 text-center w-8">#</th>
                      <th className="py-2.5 px-3">اسم الصنف والمواصفات</th>
                      <th className="py-2.5 px-2 w-28">السريال (S.N)</th>
                      <th className="py-2.5 px-2 text-center w-24">الكمية</th>
                      <th className="py-2.5 px-2 text-center w-24">السعر</th>
                      <th className="py-2.5 px-2 text-center w-16">خصم %</th>
                      <th className="py-2.5 px-2 text-center w-24">بعد الخصم</th>
                      <th className="py-2.5 px-3 text-center w-28">الإجمالي</th>
                      <th className="py-2.5 px-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cartItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/90 transition-colors">
                        <td className="py-2 px-2 text-center font-mono text-slate-400">
                          {index + 1}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                            className="w-full bg-transparent border-0 focus:ring-1 focus:ring-blue-400 rounded px-1 -mx-1 p-0 text-xs font-bold text-slate-900"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            placeholder="سريال S.N..."
                            value={item.serialNumber || ''}
                            onChange={(e) =>
                              handleUpdateItem(item.id, { serialNumber: e.target.value })
                            }
                            className="w-full text-[11px] font-mono bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateItem(item.id, {
                                  quantity: Math.max(1, item.quantity - 1),
                                })
                              }
                              className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-700"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateItem(item.id, {
                                  quantity: Math.max(1, Number(e.target.value) || 1),
                                })
                              }
                              className="w-10 text-center font-mono font-bold bg-slate-50 border border-slate-200 rounded py-0.5"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateItem(item.id, { quantity: item.quantity + 1 })
                              }
                              className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-700"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.price}
                            onChange={(e) =>
                              handleUpdateItem(item.id, { price: Number(e.target.value) || 0 })
                            }
                            className="w-20 text-center font-mono bg-slate-50 border border-slate-200 rounded py-1 font-bold text-slate-900"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercent || 0}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                discountPercent: Number(e.target.value) || 0,
                              })
                            }
                            className="w-12 text-center font-mono bg-slate-50 border border-slate-200 rounded py-1"
                          />
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-700 font-medium">
                          {item.priceAfterDiscount.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-900 text-sm">
                          {item.total.toLocaleString()}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment & Terms Section */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                  طريقة السداد / الحساب:
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'cash', label: 'كاش نقدي' },
                    { id: 'credit', label: 'آجل (ذمم)' },
                    { id: 'partial', label: 'سداد جزئي' },
                    { id: 'transfer', label: 'تحويل / بنك' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`py-2 px-1 text-center rounded-lg border font-semibold transition-all ${
                        paymentMethod === m.id
                          ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'partial' && (
                  <div className="mt-3 flex items-center gap-3 bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs">
                    <span className="font-bold text-amber-900">المبلغ المدفوع كاش:</span>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                      className="w-24 font-mono font-bold bg-white border border-amber-300 rounded px-2 py-1 text-center"
                    />
                    <span className="text-amber-800 font-mono">
                      المتبقي آجل: {(netAmount - paidAmount).toLocaleString()} {settings.currency}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                  ملاحظات الفاتورة والضمان:
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800"
                  placeholder="ملاحظات وشروط الضمان المطبوعة بالفاتورة..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: CATALOG QUICK PICK & TOTALS (4 COLS) */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 space-y-3">
          {/* Checkout Totals Summary Station */}
          <div className="bg-slate-950 text-white rounded-xl p-4 shadow-md space-y-3 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-400">ملخص الحساب والمستحق</span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                جاهز للإصدار
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span className="font-sans text-slate-400">إجمالي الأصناف:</span>
                <span>{totalAmount.toLocaleString()} {settings.currency}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="font-sans text-slate-400">إجمالي الكمية:</span>
                <span>{totalQuantity} قطعة</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="font-sans text-slate-400">الرصيد السابق للعميل:</span>
                <span>{previousBalance.toLocaleString()} {settings.currency}</span>
              </div>

              <div className="border-t border-slate-800 pt-2 flex justify-between text-base font-bold text-white font-sans items-center">
                <span>الصافي المطلوب:</span>
                <span className="text-xl font-mono text-emerald-400 font-black">
                  {netAmount.toLocaleString()} <span className="text-xs font-sans font-normal text-slate-400">{settings.currency}</span>
                </span>
              </div>

              <div className="flex justify-between text-xs font-bold text-amber-300 pt-1 border-t border-slate-800/80 font-sans">
                <span>الرصيد الحالي بعد الفاتورة:</span>
                <span className="font-mono">{currentBalance.toLocaleString()} {settings.currency}</span>
              </div>
            </div>

            {/* Arabic Tafqeet */}
            <div className="text-[11px] bg-slate-900/90 p-2.5 rounded-lg text-slate-300 font-sans border border-slate-800 leading-relaxed">
              <span className="font-bold text-slate-400 ml-1">فقط:</span>
              <span className="text-blue-300 font-semibold">{amountInWords}</span>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 space-y-2 font-sans">
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                <Printer className="w-5 h-5" />
                <span className="text-sm">حفظ وطباعة الفاتورة [F9]</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ الفاتورة فقط [F8]</span>
              </button>
            </div>
          </div>

          {/* Product Quick-Picker Station */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-blue-600" />
                <span>أصناف المتجر [F3 للبحث]</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {filteredProducts.length} صنف
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ابحث بالاسم أو الباركود أو السريال..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pr-8 pl-3 py-1.5 text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'الكل' : cat}
                </button>
              ))}
            </div>

            {/* Product Quick-Click List */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-0.5">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleAddToCart(prod)}
                  className="p-2 border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 rounded-lg transition-all cursor-pointer flex items-center justify-between text-xs group"
                >
                  <div className="min-w-0 pr-1">
                    <p className="font-bold text-slate-900 truncate group-hover:text-blue-700 text-xs">
                      {prod.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span className="font-mono text-slate-400">#{prod.code}</span>
                      <span>·</span>
                      <span className={prod.currentStock <= prod.minStock ? 'text-amber-700 font-bold' : ''}>
                        المتاح: {prod.currentStock} {prod.unit}
                      </span>
                    </div>
                  </div>
                  <div className="text-left font-mono shrink-0 pl-1">
                    <div className="font-bold text-slate-900 text-xs">
                      {prod.sellingPrice.toLocaleString()} {settings.currency}
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold group-hover:underline block">
                      + إضافة
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD CUSTOM ITEM */}
      {customItemModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">
              إضافة صنف أو خدمة مخصصة للفاتورة
            </h3>
            <form onSubmit={handleAddCustomItem} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم الصنف / الخدمة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مصنعية تركيب كاميرات ومستلزمات"
                  value={customItemForm.name}
                  onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">السريال S.N (اختياري):</label>
                <input
                  type="text"
                  placeholder="الرقم التسلسلي إذا توفر"
                  value={customItemForm.serialNumber}
                  onChange={(e) => setCustomItemForm({ ...customItemForm, serialNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">السعر:</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={customItemForm.price || ''}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, price: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الكمية:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={customItemForm.quantity}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, quantity: Number(e.target.value) || 1 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setCustomItemModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  إضافة للفاتورة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW CUSTOMER */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">
              تسجيل عميل جديد في النظام
            </h3>
            <form onSubmit={handleSaveNewCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم العميل:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: كريم هشام"
                    value={newCustForm.name}
                    onChange={(e) => setNewCustForm({ ...newCustForm, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">كود العميل:</label>
                  <input
                    type="text"
                    value={newCustForm.code}
                    onChange={(e) => setNewCustForm({ ...newCustForm, code: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">هاتف 1:</label>
                  <input
                    type="text"
                    required
                    placeholder="01026642088"
                    value={newCustForm.phone1}
                    onChange={(e) => setNewCustForm({ ...newCustForm, phone1: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">هاتف 2 (اختياري):</label>
                  <input
                    type="text"
                    value={newCustForm.phone2}
                    onChange={(e) => setNewCustForm({ ...newCustForm, phone2: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المدينة:</label>
                  <input
                    type="text"
                    value={newCustForm.city}
                    onChange={(e) => setNewCustForm({ ...newCustForm, city: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الفئة:</label>
                  <select
                    value={newCustForm.category}
                    onChange={(e) => setNewCustForm({ ...newCustForm, category: e.target.value as any })}
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
                  value={newCustForm.address}
                  onChange={(e) => setNewCustForm({ ...newCustForm, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الرصيد الافتتاحي السابق (إن وجد دَين سابق):</label>
                <input
                  type="number"
                  value={newCustForm.previousBalance || ''}
                  onChange={(e) => setNewCustForm({ ...newCustForm, previousBalance: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  حفظ واختيار العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
