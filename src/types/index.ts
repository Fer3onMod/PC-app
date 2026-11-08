/**
 * Commercial Store Accounting & Invoicing Types
 */

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  minStock: number;
  currentStock: number;
  warehouse: string;
  serialNumber?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone1: string;
  phone2?: string;
  city: string;
  address: string;
  category: 'عملاء' | 'جملة' | 'شركات' | 'نقدي';
  previousBalance: number; // الرصيد السابق
  currentBalance: number;  // الرصيد الحالي
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  name: string;
  serialNumber?: string; // S.N
  quantity: number;
  price: number;
  discountPercent: number;
  priceAfterDiscount: number;
  total: number;
  costPrice?: number;
}

export type InvoiceType = 'quotation' | 'sales' | 'tax_invoice' | 'return';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "26700"
  date: string;          // DD/MM/YYYY e.g. "31/5/2026"
  time: string;          // HH:mm
  type: InvoiceType;
  employeeNumber: string; // e.g. "2"
  employeeName: string;   // e.g. "مبيعات 1"
  warehouse: string;      // e.g. "المخزن الرئيسي"
  customer: Customer;
  items: InvoiceItem[];
  totalAmount: number;    // إجمالي الفاتورة
  totalQuantity: number;  // إجمالي الكمية
  previousBalance: number;// الرصيد السابق
  netAmount: number;      // الصافي
  paidAmount: number;     // المدفوع
  currentBalance: number; // الرصيد الحالي (المتبقي في ذمة العميل)
  paymentMethod: 'cash' | 'credit' | 'partial' | 'transfer';
  amountInWords: string;  // تفقيط المبلغ بالحروف
  notes: string;          // ملاحظات الفاتورة
  cashierSignature?: string;
  printFormat?: 'a4' | 'a5' | 'thermal';
}

export interface Expense {
  id: string;
  date: string;
  title: string;
  category: 'إيجار' | 'كهرباء ومياه' | 'مرتبات' | 'نثريات وضيافة' | 'صيانة' | 'نقل وبضائع' | 'أخرى';
  amount: number;
  paidBy: string;
  notes?: string;
}

export interface CashShift {
  id: string;
  date: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  totalCashSales: number;
  totalCreditSales: number;
  totalCustomerCollections: number;
  totalExpenses: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  status: 'open' | 'closed';
  cashierName: string;
}

export interface StoreSettings {
  storeName: string;
  commercialActivity: string;
  phone1: string;
  phone2: string;
  city: string;
  address: string;
  commercialReg: string;
  taxNumber: string;
  defaultWarehouse: string;
  currency: string;
  invoiceNotes: string;
  defaultInvoiceType: InvoiceType;
  defaultPrintFormat: 'a4' | 'a5' | 'thermal';
}

export interface InternetSubscription {
  id: string;
  customerName: string;      // اسم العميل
  phone: string;             // رقم التلفون
  address: string;           // العنوان
  subscriptionAmount: number;// مبلغ الاشتراك
  planSpeed?: string;        // باقة / سرعة النت
  startDate: string;         // تاريخ بداية الشهر الحالي (YYYY-MM-DD)
  expiryDate: string;        // تاريخ انتهاء الشهر / موعد التجديد (YYYY-MM-DD)
  renewalDay?: number;       // يوم التجديد من كل شهر
  status: 'active' | 'expiring_soon' | 'expired' | 'suspended';
  lastRenewedDate?: string;  // تاريخ آخر تجديد
  ipOrAccount?: string;      // رقم الحساب أو IP العميل
  notes?: string;            // ملاحظات
}

