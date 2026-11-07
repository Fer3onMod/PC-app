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
  Layers,
  ArrowUpDown,
  Barcode
} from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  settings: StoreSettings;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  settings,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adjustStockModal, setAdjustStockModal] = useState<Product | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('توريد بضاعة جديدة');

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
  };

  return (
    <div className="space-y-4">
      {/* KPI Header Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>إجمالي الأصناف بالمخزن</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {products.length} <span className="text-xs font-sans text-slate-500 font-normal">صنف مسجل</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>قيمة المخزون (سعر التكلفة)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            {totalCostValue.toLocaleString()} <span className="text-xs font-sans text-slate-500 font-normal">{settings.currency}</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>القيمة التقديرية (سعر البيع)</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold font-mono text-blue-700 mt-1">
            {totalRetailValue.toLocaleString()} <span className="text-xs font-sans text-slate-500 font-normal">{settings.currency}</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>تنبيهات النواقص</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xl font-bold font-mono text-amber-600">
              {lowStockCount} <span className="text-xs font-sans text-slate-500 font-normal">أوشك على النفاد</span>
            </span>
            {outOfStockCount > 0 && (
              <span className="text-xs font-bold text-red-600 font-mono">
                ({outOfStockCount} نفد)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث باسم الصنف، الباركود، أو السريال..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pr-9 pl-3 py-2 text-slate-900"
              />
            </div>

            {/* Category Selector */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700"
            >
              <option value="all">جميع التصنيفات</option>
              {categories.filter((c) => c !== 'all').map((c) => (
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

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صنف جديد</span>
          </button>
        </div>
      </div>

      {/* Inventory Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
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
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    لا توجد أصناف مطابقة لمعايير البحث الحالية
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isLow = item.currentStock <= item.minStock && item.currentStock > 0;
                  const isOut = item.currentStock <= 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
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
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-blue-600 transition-colors"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="تعديل بيانات الصنف"
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف الصنف (${item.name})؟`)) {
                                onDeleteProduct(item.id);
                              }
                            }}
                            title="حذف الصنف"
                            className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-600 transition-colors"
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

      {/* MODAL: ADD / EDIT PRODUCT */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">
              {editingProduct ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد للمخزون'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">اسم الصنف والمواصفات:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: DH-HAC-HFW1500RLP-IL-T أوت الوان"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">كود الصنف / الباركود:</label>
                  <input
                    type="text"
                    required
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
                    placeholder="كاميرات مراقبة، كابلات..."
                    value={formData.category || ''}
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
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">
              تسوية رصيد المخزن ({adjustStockModal.name})
            </h3>
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
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
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
