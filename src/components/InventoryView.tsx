import React, { useState } from 'react';
import { Product, StoreSettings } from '../types';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  TrendingUp,
  ArrowUpDown,
  CheckSquare,
  Square,
  Sparkles,
  CheckCircle2,
  X,
  Layers,
  AlertCircle
} from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  settings: StoreSettings;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onDeleteMultipleProducts?: (ids: string[]) => void;
  onDeleteAllProducts?: () => void;
  onPurgeMockData?: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  settings,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onDeleteMultipleProducts,
  onDeleteAllProducts,
  onPurgeMockData,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adjustStockModal, setAdjustStockModal] = useState<Product | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('توريد بضاعة جديدة');

  // Multi-selection state for deleting specific items
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Deletion modals state (clean in-app modals, avoiding window.confirm)
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showPurgeMockModal, setShowPurgeMockModal] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const [formData, setFormData] = useState<Partial<Product>>({
    code: '',
    name: '',
    category: 'عام',
    unit: 'قطعة',
    costPrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    minStock: 5,
    currentStock: 10,
    warehouse: settings.defaultWarehouse || 'المخزن الرئيسي',
    serialNumber: '',
    notes: '',
  });

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  // Calculations
  const totalCostValue = products.reduce((acc, p) => acc + p.costPrice * p.currentStock, 0);
  const totalRetailValue = products.reduce((acc, p) => acc + p.sellingPrice * p.currentStock, 0);
  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock && p.currentStock > 0).length;
  const outOfStockCount = products.filter((p) => p.currentStock <= 0).length;

  const filtered = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
      prod.code.toLowerCase().includes(search.toLowerCase()) ||
      (prod.serialNumber && prod.serialNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = categoryFilter === 'all' || prod.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = prod.currentStock <= prod.minStock && prod.currentStock > 0;
    if (stockFilter === 'out') matchesStock = prod.currentStock <= 0;

    return matchesSearch && matchesCat && matchesStock;
  });

  // Toggle selection for a single product
  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle select all filtered items
  const isAllFilteredSelected =
    filtered.length > 0 && filtered.every((p) => selectedProductIds.includes(p.id));

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      // Unselect filtered items
      const filteredIds = new Set(filtered.map((p) => p.id));
      setSelectedProductIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      // Select all filtered items
      const newSelected = new Set([...selectedProductIds, ...filtered.map((p) => p.id)]);
      setSelectedProductIds(Array.from(newSelected));
    }
  };

  // Confirm delete single product
  const handleConfirmDeleteSingle = () => {
    if (!productToDelete) return;
    const name = productToDelete.name;
    onDeleteProduct(productToDelete.id);
    setSelectedProductIds((prev) => prev.filter((id) => id !== productToDelete.id));
    setProductToDelete(null);
    showToast(`تم حذف الصنف (${name}) بنجاح`);
  };

  // Confirm delete selected products
  const handleConfirmDeleteSelected = () => {
    const count = selectedProductIds.length;
    if (count === 0) return;

    if (onDeleteMultipleProducts) {
      onDeleteMultipleProducts(selectedProductIds);
    } else {
      selectedProductIds.forEach((id) => onDeleteProduct(id));
    }

    setSelectedProductIds([]);
    setShowDeleteSelectedModal(false);
    showToast(`تم حذف (${count}) صنف محدد بنجاح`);
  };

  // Confirm delete all products
  const handleConfirmDeleteAll = () => {
    const count = products.length;
    if (onDeleteAllProducts) {
      onDeleteAllProducts();
    } else {
      products.forEach((p) => onDeleteProduct(p.id));
    }

    setSelectedProductIds([]);
    setShowDeleteAllModal(false);
    showToast(`تم مسح وتفريغ جميع الأصناف (${count} صنف) بنجاح`);
  };

  // Confirm purge all mock data (invoices, expenses, customers)
  const handleConfirmPurgeMock = () => {
    if (onPurgeMockData) {
      onPurgeMockData();
      setSelectedProductIds([]);
      setShowPurgeMockModal(false);
      showToast('تم تنظيف وتصفير كافة البيانات الوهمية والتجريبية من النظام بنجاح!');
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      code: String(1000 + products.length + 1),
      name: '',
      category: categories[1] || 'عام',
      unit: 'قطعة',
      costPrice: 0,
      sellingPrice: 0,
      wholesalePrice: 0,
      minStock: 5,
      currentStock: 10,
      warehouse: settings.defaultWarehouse || 'المخزن الرئيسي',
      serialNumber: '',
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...formData,
      } as Product);
      setEditingProduct(null);
      showToast(`تم تعديل بيانات الصنف (${formData.name}) بنجاح`);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        code: formData.code || String(1000 + products.length + 1),
        name: formData.name,
        category: formData.category || 'عام',
        unit: formData.unit || 'قطعة',
        costPrice: Number(formData.costPrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        wholesalePrice: Number(formData.wholesalePrice) || Number(formData.sellingPrice) || 0,
        minStock: Number(formData.minStock) || 0,
        currentStock: Number(formData.currentStock) || 0,
        warehouse: formData.warehouse || 'المخزن الرئيسي',
        serialNumber: formData.serialNumber,
        notes: formData.notes,
      };
      onAddProduct(newProd);
      setShowAddModal(false);
      showToast(`تمت إضافة الصنف (${newProd.name}) بنجاح`);
    }
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustStockModal) return;

    const newStock = Math.max(0, adjustStockModal.currentStock + adjustmentQty);
    onUpdateProduct({
      ...adjustStockModal,
      currentStock: newStock,
    });
    setAdjustStockModal(null);
    setAdjustmentQty(0);
    showToast(`تم تعديل رصيد المخزن للصنف (${adjustStockModal.name})`);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all shadow-md ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : notification.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-300'
              : 'bg-blue-50 text-blue-800 border-blue-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-black/5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Header Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>إجمالي الأصناف بالمخزن</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {products.length}{' '}
            <span className="text-xs font-sans text-slate-500 font-normal">صنف مسجل</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>قيمة المخزون (سعر التكلفة)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {totalCostValue.toLocaleString()}{' '}
            <span className="text-xs font-sans text-slate-500 font-normal">
              {settings.currency}
            </span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>القيمة التقديرية (سعر البيع)</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold font-mono text-blue-700 mt-1">
            {totalRetailValue.toLocaleString()}{' '}
            <span className="text-xs font-sans text-slate-500 font-normal">
              {settings.currency}
            </span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>تنبيهات النواقص</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xl font-bold font-mono text-amber-600">
              {lowStockCount}{' '}
              <span className="text-xs font-sans text-slate-500 font-normal">
                أوشك على النفاد
              </span>
            </span>
            {outOfStockCount > 0 && (
              <span className="text-xs font-bold text-red-600 font-mono">
                ({outOfStockCount} نفد)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Toolbar & Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث باسم الصنف، الباركود، أو السريال..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pr-9 pl-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Category Selector */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700"
            >
              <option value="all">جميع التصنيفات</option>
              {categories
                .filter((c) => c !== 'all')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>

            {/* Stock status filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700"
            >
              <option value="all">كل حالات المخزون</option>
              <option value="low">أوشك على النفاد (نواقص)</option>
              <option value="out">نفد من المخزن (رصيد 0)</option>
            </select>
          </div>

          {/* Action Buttons: Add, Clear All, Purge Mock Data */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Add New Product Button */}
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف جديد</span>
            </button>

            {/* Total Deletion of All Products (زرار مسح كلي لكل الأصناف) */}
            <button
              onClick={() => setShowDeleteAllModal(true)}
              disabled={products.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="مسح كافة الأصناف الموجودة في المخزن بالكامل"
            >
              <Trash2 className="w-4 h-4" />
              <span>مسح كلي للأصناف ({products.length})</span>
            </button>
          </div>
        </div>

        {/* Bulk Selection Action Bar (يظهر عند تحديد أصناف معينة لمسحها) */}
        {selectedProductIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-800">
                تم تحديد <strong className="text-red-700 font-mono text-sm">{selectedProductIds.length}</strong> صنف من أصل {products.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteSelectedModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-xs transition-colors cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الأصناف المحددة ({selectedProductIds.length})</span>
              </button>

              <button
                onClick={() => setSelectedProductIds([])}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                {/* Checkbox Header to Select All */}
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                    disabled={filtered.length === 0}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    title={isAllFilteredSelected ? 'إلغاء تحديد الكل' : 'تحديد جميع الأصناف المعروضة'}
                  />
                </th>
                <th className="py-2.5 px-3 w-16">الكود</th>
                <th className="py-2.5 px-3">اسم الصنف والمواصفات</th>
                <th className="py-2.5 px-2">التصنيف</th>
                <th className="py-2.5 px-2 text-center">الوحدة</th>
                <th className="py-2.5 px-2 text-center">سعر التكلفة</th>
                <th className="py-2.5 px-2 text-center">سعر البيع</th>
                <th className="py-2.5 px-2 text-center">الرصيد الحالي</th>
                <th className="py-2.5 px-2 text-center">حد الطلب</th>
                <th className="py-2.5 px-3 text-center">إجمالي القيمة</th>
                <th className="py-2.5 px-3 text-center w-28">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                      <p className="font-bold text-slate-700 text-sm">
                        {products.length === 0
                          ? 'المخزن فارغ تماماً ومستعد للعمل'
                          : 'لا توجد أصناف مطابقة لمعايير البحث الحالية'}
                      </p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        {products.length === 0
                          ? 'تم تنظيف كافة البيانات الوهمية بنجاح. يمكنك الآن البدء بإضافة أصنافك الحقيقية.'
                          : 'حاول تغيير كلمة البحث أو إعادة تعيين عوامل التصفية.'}
                      </p>
                      {products.length === 0 && (
                        <button
                          onClick={handleOpenAdd}
                          className="mt-2 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة أول صنف حقيقي للمخزن</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isSelected = selectedProductIds.includes(item.id);
                  const isLow = item.currentStock <= item.minStock && item.currentStock > 0;
                  const isOut = item.currentStock <= 0;
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-red-50/50 hover:bg-red-50/80' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Checkbox Cell for Row */}
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(item.id)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                          title="تحديد الصنف للحذف أو التعديل"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-600">
                        {item.code}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        {item.serialNumber && (
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            سريال: {item.serialNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-slate-600">{item.category}</td>
                      <td className="py-2.5 px-2 text-center text-slate-500">{item.unit}</td>
                      <td className="py-2.5 px-2 text-center font-mono">
                        {item.costPrice.toLocaleString()} {settings.currency}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900">
                        {item.sellingPrice.toLocaleString()} {settings.currency}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs ${
                            isOut
                              ? 'bg-red-100 text-red-700'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-500">
                        {item.minStock}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700">
                        {(item.costPrice * item.currentStock).toLocaleString()} {settings.currency}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setAdjustStockModal(item);
                              setAdjustmentQty(0);
                            }}
                            title="تسوية رصيد المخزن"
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="تعديل بيانات الصنف"
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(item)}
                            title="حذف هذا الصنف"
                            className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
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

      {/* MODAL: CONFIRM DELETE ALL PRODUCTS (مسح كلي لكل الأصناف) */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 border border-red-200 text-right">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  تأكيد المسح الكلي لكافة الأصناف
                </h3>
                <p className="text-xs text-slate-500">تحذير أمني خاص ببيانات المخزون</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-red-50/70 p-3 rounded-xl border border-red-200">
              <p className="font-bold text-red-900">
                هل أنت متأكد تماماً من مسح وحذف كافة الأصناف المسجلة في المخزن ({products.length} صنف)؟
              </p>
              <p className="text-slate-600">
                سيتم تفريغ جدول الأصناف بالكامل، وتصفير إجمالي كميات المخزون وأرصدة البضاعة. لن تتمكن من استرجاعها إلا في حال وجود نسخة احتياطية سابقة.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAllModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAll}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>نعم، مسح جميع الأصناف الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE SELECTED PRODUCTS (حذف الأصناف المحددة) */}
      {showDeleteSelectedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 border border-red-200 text-right">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  تأكيد حذف الأصناف المحددة
                </h3>
                <p className="text-xs text-slate-500">
                  عدد الأصناف المحددة:{' '}
                  <strong className="text-red-600 font-mono">{selectedProductIds.length}</strong>
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-700 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-900">
                هل أنت متأكد من حذف الأصناف المختارة ({selectedProductIds.length} صنف) نهائياً من المخزن؟
              </p>
              <p className="text-slate-500">
                سيتم إزالة الأصناف المختارة فقط من قاعدة البيانات مع الاحتفاظ بباقي أصناف المخزن الأخرى.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteSelectedModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSelected}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تأكيد حذف المحدد</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM SINGLE PRODUCT DELETE */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-200 text-right">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">تأكيد حذف الصنف</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              هل أنت متأكد من حذف الصنف{' '}
              <strong className="text-slate-900">({productToDelete.name})</strong> كود [
              {productToDelete.code}] من المخزن؟
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSingle}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs cursor-pointer"
              >
                حذف الصنف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PURGE ALL MOCK DATA (تنظيف كل الحاجات الوهمية) */}
      {showPurgeMockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 border border-amber-200 text-right">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  تنظيف وتصفير البيانات الوهمية والتجريبية
                </h3>
                <p className="text-xs text-slate-500">تهيئة البرنامج للعمل ببيانات حقيقية 100%</p>
              </div>
            </div>

            <div className="text-xs text-slate-700 space-y-2 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
              <p className="font-bold text-amber-900">
                سيقوم هذا الإجراء بتنظيف كافة البيانات الوهمية والتجريبية، بما في ذلك:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px] pr-1">
                <li>مسح كافة أصناف المخزن التجريبية</li>
                <li>مسح كافة الفواتير التجريبية السابقة</li>
                <li>مسح ديون وسجلات العملاء التجريبية (والإبقاء على عميل نقدي صالة فقط)</li>
                <li>تصفير المصروفات وسجل وردية الخزينة</li>
              </ul>
              <p className="text-slate-500 pt-1 text-[11px]">
                ستحصل على نظام نظيف تماماً جاهز للبدء في إدخال فواتيرك وأصنافك الحقيقية فوراً.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPurgeMockModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmPurgeMock}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تنظيف وتصفير كل شيء الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد للمخزون'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    اسم الصنف والمواصفات:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: DH-HAC-HFW1500RLP-IL-T أوت الوان"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    كود الصنف / الباركود:
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">التصنيف:</label>
                  <input
                    type="text"
                    value={formData.category || 'عام'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الوحدة:</label>
                  <select
                    value={formData.unit || 'قطعة'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="قطعة">قطعة</option>
                    <option value="متر">متر</option>
                    <option value="لفة">لفة</option>
                    <option value="طقم">طقم</option>
                    <option value="كيس">كيس</option>
                    <option value="كرتونة">كرتونة</option>
                    <option value="كيلو">كيلو</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المستودع:</label>
                  <input
                    type="text"
                    value={formData.warehouse || 'المخزن الرئيسي'}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">سعر التكلفة (الشراء):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.costPrice || 0}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">سعر البيع (قطاعي):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.sellingPrice || 0}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">سعر البيع (جملة):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.wholesalePrice || 0}
                    onChange={(e) => setFormData({ ...formData, wholesalePrice: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الرصيد الافتتاحي:</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentStock || 0}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">حد إعادة الطلب (نواقص):</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock || 0}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">السريال (S.N إن وجد):</label>
                  <input
                    type="text"
                    value={formData.serialNumber || ''}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STOCK ADJUSTMENT */}
      {adjustStockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">
                تسوية رصيد المخزن ({adjustStockModal.name})
              </h3>
              <button
                type="button"
                onClick={() => setAdjustStockModal(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-slate-600">الرصيد الفعلي الحالي في النظام:</p>
                <p className="font-mono font-bold text-lg text-slate-900 mt-1">
                  {adjustStockModal.currentStock} {adjustStockModal.unit}
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  الكمية المراد إضافتها أو خصمها (سالب للخصم، موجب للإضافة):
                </label>
                <input
                  type="number"
                  required
                  placeholder="+5 أو -2"
                  value={adjustmentQty || ''}
                  onChange={(e) => setAdjustmentQty(Number(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-center text-sm"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  الرصيد بعد التسوية سيكون:{' '}
                  <strong className="font-mono text-blue-700">
                    {Math.max(0, adjustStockModal.currentStock + adjustmentQty)} {adjustStockModal.unit}
                  </strong>
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">سبب التسوية:</label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option value="توريد بضاعة جديدة">وارد من المورد (توريد بضاعة)</option>
                  <option value="جرد دوري">تسوية بعد الجرد الفعلي</option>
                  <option value="تالف أو هالك">هالك أو تالف أثناء النقل</option>
                  <option value="مرتجع من عميل بدون فاتورة">مرتجع من عميل</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setAdjustStockModal(null)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  تأكيد التسوية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
