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
  Package,
  Barcode,
  CheckCircle2,
  X,
  Edit3,
  Users
} from 'lucide-react';

interface POSViewProps {
  products: Product[];
  customers: Customer[];
  settings: StoreSettings;
  onSaveInvoice: (invoice: Invoice, shouldPrint: boolean) => void;
  onAddCustomer: (customer: Customer) => void;
  nextInvoiceNumber: string;
  invoiceToEdit?: Invoice | null;
  resetTrigger?: number;
}

export const POSView: React.FC<POSViewProps> = ({
  products,
  customers,
  settings,
  onSaveInvoice,
  onAddCustomer,
  nextInvoiceNumber,
  invoiceToEdit,
  resetTrigger,
}) => {
  // Find default walk-in customer or first customer
  const getDefaultCustomer = (): Customer => {
    return (
      customers.find((c) => c.category === 'نقدي' || c.name.includes('نقدي')) ||
      customers[0] || {
        id: 'cust-walk-in',
        code: '1',
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
  };

  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(getDefaultCustomer());
  const [customCustomerName, setCustomCustomerName] = useState<string>('');
  const [customCustomerPhone, setCustomCustomerPhone] = useState<string>('');
  const [isManualCustomer, setIsManualCustomer] = useState<boolean>(false);

  const [invoiceType, setInvoiceType] = useState<InvoiceType>(settings.defaultInvoiceType || 'quotation');
  const [customInvoiceNum, setCustomInvoiceNum] = useState<string>(nextInvoiceNumber);
  const [invoiceDate, setInvoiceDate] = useState<string>('');
  const [warehouse, setWarehouse] = useState<string>(settings.defaultWarehouse || 'المخزن الرئيسي');
  const [employeeNumber, setEmployeeNumber] = useState<string>('2');
  const [employeeName, setEmployeeName] = useState<string>('مبيعات 1');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'partial' | 'transfer'>('credit');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>(settings.invoiceNotes || 'الضمان سنة ضد عيوب الصناعة - الأسعار تشمل التوصيل');

  // Start with a clean empty cart for a fresh invoice!
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [newCustForm, setNewCustForm] = useState({
    name: '',
    code: String(customers.length + 1),
    phone1: '',
    phone2: '',
    city: 'المنصورة',
    address: '',
    category: 'عملاء' as Customer['category'],
    previousBalance: 0,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Set today's date formatted
  useEffect(() => {
    const today = new Date();
    setInvoiceDate(`${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`);
  }, []);

  // Sync custom invoice number with nextInvoiceNumber prop
  useEffect(() => {
    if (!invoiceToEdit) {
      setCustomInvoiceNum(nextInvoiceNumber);
    }
  }, [nextInvoiceNumber, invoiceToEdit]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Add a brand new empty row to the invoice table so user can type whatever they want
  const handleAddNewBlankItem = (prefillName: string = '') => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: prefillName,
      serialNumber: '',
      quantity: 1,
      price: 0,
      discountPercent: 0,
      priceAfterDiscount: 0,
      total: 0,
    };
    setCartItems([...cartItems, newItem]);
    showToast('تمت إضافة سطر جديد للفاتورة - اكتب اسم الصنف والسعر مباشرة');
  };

  // Reset to fresh blank invoice
  const resetToNewInvoice = () => {
    setCartItems([]);
    setSelectedCustomer(getDefaultCustomer());
    setIsManualCustomer(false);
    setCustomCustomerName('');
    setCustomCustomerPhone('');
    setPaidAmount(0);
    setPaymentMethod('credit');
    setNotes(settings.invoiceNotes || 'الضمان سنة ضد عيوب الصناعة - الأسعار تشمل التوصيل');
    setSearchQuery('');
    setCustomInvoiceNum(nextInvoiceNumber);
    const today = new Date();
    setInvoiceDate(`${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`);
    showToast('تم فتح فاتورة جديدة فارغة وجاهزة للإدخال');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // React to resetTrigger from parent
  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      resetToNewInvoice();
    }
  }, [resetTrigger]);

  // React to invoiceToEdit
  useEffect(() => {
    if (invoiceToEdit) {
      setCartItems(invoiceToEdit.items || []);
      if (invoiceToEdit.customer) {
        setSelectedCustomer(invoiceToEdit.customer);
        setCustomCustomerName(invoiceToEdit.customer.name);
        setCustomCustomerPhone(invoiceToEdit.customer.phone1);
      }
      if (invoiceToEdit.type) setInvoiceType(invoiceToEdit.type);
      if (invoiceToEdit.invoiceNumber) setCustomInvoiceNum(invoiceToEdit.invoiceNumber);
      if (invoiceToEdit.date) setInvoiceDate(invoiceToEdit.date);
      if (invoiceToEdit.warehouse) setWarehouse(invoiceToEdit.warehouse);
      if (invoiceToEdit.employeeNumber) setEmployeeNumber(invoiceToEdit.employeeNumber);
      if (invoiceToEdit.employeeName) setEmployeeName(invoiceToEdit.employeeName);
      if (invoiceToEdit.paymentMethod) setPaymentMethod(invoiceToEdit.paymentMethod);
      setPaidAmount(invoiceToEdit.paidAmount || 0);
      if (invoiceToEdit.notes) setNotes(invoiceToEdit.notes);
      showToast(`تم تحميل بيانات الفاتورة رقم #${invoiceToEdit.invoiceNumber} للتعديل`);
    }
  }, [invoiceToEdit]);

  // Focus search input on F3 or mount, shortcuts F8, F9, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleSave(false);
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleSave(true);
      } else if (e.key === 'Escape') {
        if (showAddCustomerModal) setShowAddCustomerModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

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
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
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
    showToast(`تمت إضافة: ${product.name}`);
  };

  // Barcode / Scanner / Quick Text Enter handler
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = searchQuery.trim();
      if (!q) return;

      // 1. Exact code / barcode / serial match
      const exactMatch = products.find(
        (p) =>
          p.code.toLowerCase() === q.toLowerCase() ||
          (p.serialNumber && p.serialNumber.toLowerCase() === q.toLowerCase()) ||
          p.name.toLowerCase() === q.toLowerCase()
      );

      if (exactMatch) {
        handleAddToCart(exactMatch);
        setSearchQuery('');
        return;
      }

      // 2. If filtered has exactly 1 result, add it
      if (filteredProducts.length === 1) {
        handleAddToCart(filteredProducts[0]);
        setSearchQuery('');
        return;
      }

      // 3. Otherwise, add as custom item with what the user typed!
      handleAddNewBlankItem(q);
      setSearchQuery('');
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setCartItems(
      cartItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          const price = updated.price !== undefined ? Number(updated.price) || 0 : 0;
          const discount = updated.discountPercent !== undefined ? Number(updated.discountPercent) || 0 : 0;
          const quantity = updated.quantity !== undefined ? Number(updated.quantity) || 0 : 1;
          const priceAfterDiscount = Math.round(price * (1 - discount / 100) * 100) / 100;
          const total = Math.round(priceAfterDiscount * quantity * 100) / 100;
          return {
            ...updated,
            price,
            discountPercent: discount,
            quantity,
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
    setIsManualCustomer(false);
    setShowAddCustomerModal(false);
    showToast(`تم تسجيل العميل: ${newCust.name}`);
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
      showToast('⚠️ تنبيه: من فضلك أضف صنفاً واحداً على الأقل للفاتورة!');
      searchInputRef.current?.focus();
      return;
    }

    // Check if any items are missing name
    const missingName = cartItems.find((item) => !item.name.trim());
    if (missingName) {
      showToast('⚠️ تنبيه: يوجد صنف بدون اسم في الجدول، يرجى كتابة اسم الصنف أولاً.');
      return;
    }

    const today = new Date();
    const formattedDate = invoiceDate || `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    const formattedTime = today.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    // Active customer: either manual or selected
    const finalCustomer: Customer = isManualCustomer
      ? {
          ...selectedCustomer,
          id: `cust-manual-${Date.now()}`,
          name: customCustomerName.trim() || 'عميل نقدي',
          phone1: customCustomerPhone.trim() || '',
        }
      : selectedCustomer;

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: customInvoiceNum.trim() || nextInvoiceNumber,
      date: formattedDate,
      time: formattedTime,
      type: invoiceType,
      employeeNumber,
      employeeName,
      warehouse,
      customer: finalCustomer,
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

    // If saving without printing, immediately clean cart and advance to next incremented invoice number
    if (!shouldPrint) {
      setCartItems([]);
      setPaidAmount(0);
      const currentNumeric = parseInt(invoice.invoiceNumber, 10);
      const nextNum = !isNaN(currentNumeric) ? String(currentNumeric + 1) : nextInvoiceNumber;
      setCustomInvoiceNum(nextNum);
      showToast(`✓ تم حفظ الفاتورة #${invoice.invoiceNumber} بنجاح! جاهز للفاتورة رقم #${nextNum}.`);
      searchInputRef.current?.focus();
    }
  };

  return (
    <div className="space-y-3">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="bg-slate-900 text-sky-300 border border-sky-500/40 px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between text-xs font-medium animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
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
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
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
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
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

        {/* Invoice Number & Reset to Blank Action */}
        <div className="flex items-center gap-2">
          {/* Start Brand New Invoice Button */}
          <button
            type="button"
            onClick={resetToNewInvoice}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs cursor-pointer active:scale-95"
            title="فاتورة جديدة فارغة (F2)"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>فاتورة جديدة [F2]</span>
          </button>

          {/* Editable Invoice Number (Starts from 1 to infinity) */}
          <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-mono font-bold shadow-xs border border-slate-800">
            <span className="text-slate-400 font-sans font-normal text-[11px]">رقم الفاتورة:</span>
            <span className="text-sky-400 font-black text-sm">#</span>
            <input
              type="text"
              value={customInvoiceNum}
              onChange={(e) => setCustomInvoiceNum(e.target.value)}
              className="w-14 bg-transparent text-sky-400 font-mono font-black text-sm border-0 p-0 focus:outline-hidden focus:ring-1 focus:ring-sky-400 rounded text-center"
              title="رقم الفاتورة (يبدأ برقم 1 ويتغير تلقائياً مع كل فاتورة جديدة)"
            />
          </div>
        </div>
      </div>

      {/* Main POS Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* ============================================================== */}
        {/* LEFT COLUMN: ACTIVE INVOICE CART (8 COLS) */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 space-y-3">
          {/* Customer Selection & Quick Manual Input Card */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">بيانات العميل:</span>
                <button
                  type="button"
                  onClick={() => setIsManualCustomer(!isManualCustomer)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                    isManualCustomer
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  }`}
                  title={isManualCustomer ? 'العودة لاختيار عميل من القائمة' : 'كتابة اسم عميل مباشر'}
                >
                  {isManualCustomer ? (
                    <>
                      <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>اختيار من القائمة</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>كتابة اسم يدوي</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCustomerModal(true)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ تسجيل عميل جديد</span>
              </button>
            </div>

            {isManualCustomer ? (
              /* Direct Manual Customer Fields */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                <div className="md:col-span-6">
                  <input
                    type="text"
                    placeholder="اكتب اسم العميل مباشرة هنا (مثال: محمد سعيد)..."
                    value={customCustomerName}
                    onChange={(e) => setCustomCustomerName(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-blue-400 rounded-lg px-2.5 py-2 text-slate-900 focus:bg-white"
                    autoFocus
                  />
                </div>
                <div className="md:col-span-6">
                  <input
                    type="text"
                    placeholder="رقم الهاتف (اختياري)..."
                    value={customCustomerPhone}
                    onChange={(e) => setCustomCustomerPhone(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:bg-white"
                  />
                </div>
              </div>
            ) : (
              /* Dropdown Customer Selector */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                <div className="md:col-span-6">
                  <select
                    value={selectedCustomer.id}
                    onChange={(e) => {
                      const found = customers.find((c) => c.id === e.target.value);
                      if (found) {
                        setSelectedCustomer(found);
                        setCustomCustomerName(found.name);
                        setCustomCustomerPhone(found.phone1);
                      }
                    }}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus:bg-white cursor-pointer"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
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
            )}
          </div>

          {/* Cart Table Container with Direct Editing of ANY item */}
          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900">جدول أصناف وبنود الفاتورة</h3>
                <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono font-bold">
                  {cartItems.length} صنف · {totalQuantity} قطعة
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Instant Add Blank Item Row */}
                <button
                  type="button"
                  onClick={() => handleAddNewBlankItem()}
                  className="text-xs flex items-center gap-1 px-3 py-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ إضافة صنف / سطر جديد</span>
                </button>

                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowClearCartModal(true)}
                    className="text-xs text-red-600 hover:text-red-700 px-2 py-1.5 hover:bg-red-50 rounded-lg flex items-center gap-1 cursor-pointer font-bold border border-red-200"
                    title="تفريغ السلة بالكامل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح السلة</span>
                  </button>
                )}
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                <p className="text-sm font-bold text-slate-700">سلة الفاتورة فارغة حالياً</p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  يمكنك إضافة أي صنف تريده بكتابة اسمه وسعره مباشرة، أو اختيار أصناف من القائمة الجانبية أو مسح الباركود
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleAddNewBlankItem()}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ إضافة أول صنف يدوي للفاتورة</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-2 text-center w-8">#</th>
                      <th className="py-2.5 px-3 min-w-[200px]">اسم الصنف / الخدمة (يمكنك كتابة أي شيء)</th>
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
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="اكتب اسم الصنف أو الخدمة هنا..."
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                            className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded px-2 py-1 text-xs font-bold text-slate-900 transition-colors"
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
                              className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
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
                              className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
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
                            className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Bottom Add Row Bar */}
                <div className="p-2 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleAddNewBlankItem()}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-bold px-2 py-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ إضافة صنف / بند جديد آخر</span>
                  </button>
                  <span className="text-[11px] text-slate-500 font-mono">
                    إجمالي الفاتورة: {totalAmount.toLocaleString()} {settings.currency}
                  </span>
                </div>
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
                      className={`py-2 px-1 text-center rounded-lg border font-semibold transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-2xs font-bold'
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
              <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
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
              <span className="text-sky-300 font-semibold">{amountInWords}</span>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 space-y-2 font-sans">
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.99] cursor-pointer"
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

          {/* Product Quick-Picker Station with Add Custom Option */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-blue-600" />
                <span>بحث في المستودع [F3]</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {filteredProducts.length} صنف
              </span>
            </div>

            {/* Search Input with Scanner Enter support */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ابحث بالاسم أو الباركود ثم اضغط Enter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pr-8 pl-3 py-1.5 text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Quick Add Custom Typed Query as Item */}
            {searchQuery.trim().length > 0 && (
              <button
                type="button"
                onClick={() => {
                  handleAddNewBlankItem(searchQuery.trim());
                  setSearchQuery('');
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg text-blue-800 text-xs font-bold transition-colors cursor-pointer text-right"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة "{searchQuery.trim()}" كصنف جديد للفاتورة</span>
              </button>
            )}

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
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
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-0.5">
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
                    className="w-full border border-slate-300 rounded-lg p-2 cursor-pointer"
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
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  حفظ واختيار العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLEAR CART CONFIRMATION */}
      {showClearCartModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-red-200 text-right">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">تفريغ سلة الفاتورة</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              هل تريد مسح جميع الأصناف ({cartItems.length} سطر) الموجودة في الفاتورة الحالية والبدء بسلة فارغة؟
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowClearCartModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  setCartItems([]);
                  setShowClearCartModal(false);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs cursor-pointer"
              >
                نعم، مسح السلة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
