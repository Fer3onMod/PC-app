import { Product, Customer, Invoice, Expense, CashShift, StoreSettings } from '../types';

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Top Security',
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

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-walk-in',
    code: '1',
    name: 'عميل نقدي صالة',
    phone1: '',
    phone2: '',
    city: 'المنصورة',
    address: 'المحل',
    category: 'نقدي',
    previousBalance: 0,
    currentBalance: 0
  }
];

export const INITIAL_INVOICE: Invoice = {
  id: 'inv-init',
  invoiceNumber: '1',
  date: new Date().toLocaleDateString('ar-EG'),
  time: '',
  type: 'quotation',
  employeeNumber: '1',
  employeeName: 'المبيعات',
  warehouse: 'المخزن الرئيسي',
  customer: INITIAL_CUSTOMERS[0],
  items: [],
  totalAmount: 0,
  totalQuantity: 0,
  previousBalance: 0,
  netAmount: 0,
  paidAmount: 0,
  currentBalance: 0,
  paymentMethod: 'cash',
  amountInWords: 'صفر جنيه',
  notes: 'الضمان ساري ضد عيوب الصناعة.',
  printFormat: 'a4'
};

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_SHIFT: CashShift = {
  id: 'shift-1',
  date: new Date().toLocaleDateString('ar-EG'),
  openedAt: '09:00 ص',
  openingCash: 0,
  totalCashSales: 0,
  totalCreditSales: 0,
  totalCustomerCollections: 0,
  totalExpenses: 0,
  expectedCash: 0,
  status: 'open',
  cashierName: 'كاشير المحل'
};

const STORAGE_KEYS = {
  PRODUCTS: 'pos_products_clean_v2',
  CUSTOMERS: 'pos_customers_clean_v2',
  INVOICES: 'pos_invoices_clean_v2',
  EXPENSES: 'pos_expenses_clean_v2',
  CURRENT_SHIFT: 'pos_shift_clean_v2',
  SETTINGS: 'pos_settings_clean_v2',
  ACTIVE_INVOICE: 'pos_active_invoice_clean_v2',
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
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
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
      const parsed = JSON.parse(raw);
      if (parsed.storeName === 'مؤسسة الأفق للأنظمة الأمنية والإلكترونيات' || !parsed.storeName) {
        parsed.storeName = 'Top Security';
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
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

  deleteAllProducts() {
    this.saveProducts([]);
  },

  deleteProductsByIds(ids: string[]) {
    const current = this.getProducts();
    const updated = current.filter((p) => !ids.includes(p.id));
    this.saveProducts(updated);
    return updated;
  },

  purgeAllMockData() {
    // Clear both old v1 keys and new keys
    const oldKeys = [
      'pos_products_v1',
      'pos_customers_v1',
      'pos_invoices_v1',
      'pos_expenses_v1',
      'pos_shift_v1',
      'pos_active_invoice_v1',
      STORAGE_KEYS.PRODUCTS,
      STORAGE_KEYS.CUSTOMERS,
      STORAGE_KEYS.INVOICES,
      STORAGE_KEYS.EXPENSES,
      STORAGE_KEYS.CURRENT_SHIFT,
      STORAGE_KEYS.ACTIVE_INVOICE,
    ];
    oldKeys.forEach((k) => localStorage.removeItem(k));

    this.saveProducts([]);
    this.saveCustomers(INITIAL_CUSTOMERS);
    this.saveInvoices([]);
    this.saveExpenses([]);
    this.saveShift(INITIAL_SHIFT);
    this.saveActiveInvoice(INITIAL_INVOICE);
  },

  resetToClean() {
    this.purgeAllMockData();
  },

  resetToDemo() {
    this.purgeAllMockData();
  }
};
