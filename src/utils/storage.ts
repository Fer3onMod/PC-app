import { Product, Customer, Invoice, Expense, CashShift, StoreSettings } from '../types';

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'مؤسسة الأفق للأنظمة الأمنية والإلكترونيات',
  commercialActivity: 'توريد وتركيب كاميرات مراقبة وشبكات وأجهزة أمنية',
  phone1: '01026642088',
  phone2: '01223456789',
  city: 'المنصورة',
  address: 'مجمع المحاكم - شارع الجيش',
  commercialReg: '104829',
  taxNumber: '682-931-402',
  defaultWarehouse: 'المخزن الرئيسي',
  currency: 'جنيه',
  invoiceNotes: 'البضاعة المباعة ترد أو تستبدل خلال 14 يوماً من تاريخ الفاتورة بالحالة الأصلية، الضمان ساري لمدة عام ضد عيوب الصناعة.',
  defaultInvoiceType: 'quotation',
  defaultPrintFormat: 'a4',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: '1001',
    name: 'XVR5116HS-I3 بورت 16 / 5 ميجا',
    category: 'أجهزة تسجيل XVR',
    unit: 'قطعة',
    costPrice: 5200,
    sellingPrice: 6100,
    wholesalePrice: 5800,
    minStock: 3,
    currentStock: 8,
    warehouse: 'المخزن الرئيسي',
    serialNumber: 'XVR-5116-2026-A1'
  },
  {
    id: 'prod-2',
    code: '1002',
    name: 'DH-HAC-HFW1500RLP-IL-T أوت الوان',
    category: 'كاميرات داهوا',
    unit: 'قطعة',
    costPrice: 980,
    sellingPrice: 1250,
    wholesalePrice: 1150,
    minStock: 10,
    currentStock: 24,
    warehouse: 'المخزن الرئيسي'
  },
  {
    id: 'prod-3',
    code: '1003',
    name: 'سلك 200 متر هاي لينك HI LINK',
    category: 'كابلات وأسلاك',
    unit: 'لفة',
    costPrice: 1300,
    sellingPrice: 1550,
    wholesalePrice: 1450,
    minStock: 5,
    currentStock: 14,
    warehouse: 'المخزن الرئيسي'
  },
  {
    id: 'prod-4',
    code: '1004',
    name: 'راك 3 خفيف',
    category: 'كابينات وراكات',
    unit: 'قطعة',
    costPrice: 140,
    sellingPrice: 200,
    wholesalePrice: 175,
    minStock: 4,
    currentStock: 12,
    warehouse: 'المخزن الرئيسي'
  },
  {
    id: 'prod-5',
    code: '1005',
    name: 'بواط مقاس 10/10',
    category: 'مستلزمات تثبيت',
    unit: 'قطعة',
    costPrice: 6,
    sellingPrice: 10,
    wholesalePrice: 8,
    minStock: 25,
    currentStock: 90,
    warehouse: 'المخزن الرئيسي'
  },
  {
    id: 'prod-6',
    code: '1006',
    name: 'هارد ديسك ويسترن ديجيتال 2 تيرا بنفسجي',
    category: 'وحدات تخزين',
    unit: 'قطعة',
    costPrice: 2400,
    sellingPrice: 2950,
    wholesalePrice: 2750,
    minStock: 5,
    currentStock: 9,
    warehouse: 'المخزن الرئيسي'
  },
  {
    id: 'prod-7',
    code: '1007',
    name: 'باور سبلاي مركزي 12 فولت 20 أمبير مروحة',
    category: 'مصادر طاقة',
    unit: 'قطعة',
    costPrice: 420,
    sellingPrice: 580,
    wholesalePrice: 520,
    minStock: 6,
    currentStock: 18,
    warehouse: 'المخزن الرئيسي'
  },
  {
    id: 'prod-8',
    code: '1008',
    name: 'كونيكتور BNC كبس عالي الجودة نحاس (كيس 100)',
    category: 'مستلزمات توصيل',
    unit: 'كيس',
    costPrice: 180,
    sellingPrice: 260,
    wholesalePrice: 230,
    minStock: 4,
    currentStock: 15,
    warehouse: 'المخزن الرئيسي'
  },
  {
    id: 'prod-9',
    code: '1009',
    name: 'فيشة دكر نتاية باور 12 فولت (كيس 50)',
    category: 'مستلزمات توصيل',
    unit: 'كيس',
    costPrice: 75,
    sellingPrice: 120,
    wholesalePrice: 100,
    minStock: 8,
    currentStock: 22,
    warehouse: 'المخزن الرئيسي'
  },
  {
    id: 'prod-10',
    code: '1010',
    name: 'مايك تجسس خارجي ذكي لكاميرات المراقبة',
    category: 'ملحقات صوت',
    unit: 'قطعة',
    costPrice: 110,
    sellingPrice: 180,
    wholesalePrice: 150,
    minStock: 5,
    currentStock: 3, // Low stock trigger for demo
    warehouse: 'المخزن الرئيسي'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    code: '01/3/823',
    name: 'عملاء- كريم هشام',
    phone1: '01026642088',
    phone2: '',
    city: 'المنصورة',
    address: 'مجمع المحاكم',
    category: 'عملاء',
    previousBalance: 0,
    currentBalance: 12890
  },
  {
    id: 'cust-2',
    code: '01/3/824',
    name: 'شركة النيل للهندسة والمقاولات',
    phone1: '01155443322',
    phone2: '0502314567',
    city: 'المنصورة',
    address: 'حي الجامعة - برج الصفا',
    category: 'شركات',
    previousBalance: 4500,
    currentBalance: 4500
  },
  {
    id: 'cust-3',
    code: '01/3/825',
    name: 'محل البركة للأجهزة الكهربائية',
    phone1: '01298765432',
    phone2: '',
    city: 'طلخا',
    address: 'طريق بلقاس',
    category: 'جملة',
    previousBalance: 1800,
    currentBalance: 1800
  },
  {
    id: 'cust-4',
    code: '01/3/001',
    name: 'عميل نقدي صالة',
    phone1: '01000000000',
    phone2: '',
    city: 'المنصورة',
    address: 'المحل',
    category: 'نقدي',
    previousBalance: 0,
    currentBalance: 0
  }
];

export const INITIAL_INVOICE: Invoice = {
  id: 'inv-26700',
  invoiceNumber: '26700',
  date: '31/5/2026',
  time: '14:35',
  type: 'quotation',
  employeeNumber: '2',
  employeeName: 'مبيعات 1',
  warehouse: 'المخزن الرئيسي',
  customer: INITIAL_CUSTOMERS[0],
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      name: 'XVR5116HS-I3 بورت 16 / 5 ميجا',
      serialNumber: '',
      quantity: 1,
      price: 6100,
      discountPercent: 0,
      priceAfterDiscount: 6100,
      total: 6100,
      costPrice: 5200
    },
    {
      id: 'item-2',
      productId: 'prod-2',
      name: 'DH-HAC-HFW1500RLP-IL-T أوت الوان',
      serialNumber: '',
      quantity: 4,
      price: 1250,
      discountPercent: 0,
      priceAfterDiscount: 1250,
      total: 5000,
      costPrice: 980
    },
    {
      id: 'item-3',
      productId: 'prod-3',
      name: 'سلك 200 متر هاي لينك HI LINK',
      serialNumber: '',
      quantity: 1,
      price: 1550,
      discountPercent: 0,
      priceAfterDiscount: 1550,
      total: 1550,
      costPrice: 1300
    },
    {
      id: 'item-4',
      productId: 'prod-4',
      name: 'راك 3 خفيف',
      serialNumber: '',
      quantity: 1,
      price: 200,
      discountPercent: 0,
      priceAfterDiscount: 200,
      total: 200,
      costPrice: 140
    },
    {
      id: 'item-5',
      productId: 'prod-5',
      name: 'بواط مقاس 10/10',
      serialNumber: '',
      quantity: 4,
      price: 10,
      discountPercent: 0,
      priceAfterDiscount: 10,
      total: 40,
      costPrice: 6
    }
  ],
  totalAmount: 12890,
  totalQuantity: 11,
  previousBalance: 0,
  netAmount: 12890,
  paidAmount: 0,
  currentBalance: 12890,
  paymentMethod: 'credit',
  amountInWords: 'إثنى عشر ألف وثمانمائة وتسعون جنيه',
  notes: 'الضمان سنة ضد عيوب الصناعة - الأسعار تشمل التوصيل داخل نطاق المدينة',
  printFormat: 'a4'
};

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    date: '31/5/2026',
    title: 'فاتورة كهرباء المحل لشهر مايو',
    category: 'كهرباء ومياه',
    amount: 450,
    paidBy: 'كاشير المحل',
    notes: 'تم السداد إلكترونياً فوري'
  },
  {
    id: 'exp-2',
    date: '31/5/2026',
    title: 'نثريات وضيافة عملاء',
    category: 'نثريات وضيافة',
    amount: 120,
    paidBy: 'كاشير المحل'
  },
  {
    id: 'exp-3',
    date: '31/5/2026',
    title: 'شحن طلبية كابلات من المستودع المركزي',
    category: 'نقل وبضائع',
    amount: 250,
    paidBy: 'مبيعات 1'
  }
];

export const INITIAL_SHIFT: CashShift = {
  id: 'shift-1',
  date: '31/5/2026',
  openedAt: '09:00 ص',
  openingCash: 1500,
  totalCashSales: 4850,
  totalCreditSales: 12890,
  totalCustomerCollections: 2000,
  totalExpenses: 820,
  expectedCash: 1500 + 4850 + 2000 - 820, // 7530
  status: 'open',
  cashierName: 'أحمد محمود (مبيعات 1)'
};

const STORAGE_KEYS = {
  PRODUCTS: 'pos_products_v1',
  CUSTOMERS: 'pos_customers_v1',
  INVOICES: 'pos_invoices_v1',
  EXPENSES: 'pos_expenses_v1',
  CURRENT_SHIFT: 'pos_shift_v1',
  SETTINGS: 'pos_settings_v1',
  ACTIVE_INVOICE: 'pos_active_invoice_v1',
};

export const storage = {
  getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PRODUCTS;
    }
  },
  saveProducts(products: Product[]) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getCustomers(): Customer[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CUSTOMERS;
    }
  },
  saveCustomers(customers: Customer[]) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getInvoices(): Invoice[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([INITIAL_INVOICE]));
      return [INITIAL_INVOICE];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [INITIAL_INVOICE];
    }
  },
  saveInvoices(invoices: Invoice[]) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  },

  getExpenses(): Expense[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EXPENSES;
    }
  },
  saveExpenses(expenses: Expense[]) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  getShift(): CashShift {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_SHIFT);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SHIFT, JSON.stringify(INITIAL_SHIFT));
      return INITIAL_SHIFT;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SHIFT;
    }
  },
  saveShift(shift: CashShift) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SHIFT, JSON.stringify(shift));
  },

  getSettings(): StoreSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings(settings: StoreSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getActiveInvoice(): Invoice {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_INVOICE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_INVOICE, JSON.stringify(INITIAL_INVOICE));
      return INITIAL_INVOICE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_INVOICE;
    }
  },
  saveActiveInvoice(invoice: Invoice) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_INVOICE, JSON.stringify(invoice));
  },

  exportDatabase(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      customers: this.getCustomers(),
      invoices: this.getInvoices(),
      expenses: this.getExpenses(),
      shift: this.getShift(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importDatabase(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.products) this.saveProducts(data.products);
      if (data.customers) this.saveCustomers(data.customers);
      if (data.invoices) this.saveInvoices(data.invoices);
      if (data.expenses) this.saveExpenses(data.expenses);
      if (data.shift) this.saveShift(data.shift);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  resetToDemo() {
    localStorage.clear();
    this.saveProducts(INITIAL_PRODUCTS);
    this.saveCustomers(INITIAL_CUSTOMERS);
    this.saveInvoices([INITIAL_INVOICE]);
    this.saveExpenses(INITIAL_EXPENSES);
    this.saveShift(INITIAL_SHIFT);
    this.saveSettings(DEFAULT_SETTINGS);
    this.saveActiveInvoice(INITIAL_INVOICE);
  }
};
