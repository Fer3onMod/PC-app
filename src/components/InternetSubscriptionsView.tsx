import React, { useState, useMemo } from 'react';
import { InternetSubscription, StoreSettings, Customer } from '../types';
import {
  Wifi,
  Search,
  Plus,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Printer,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  DollarSign
} from 'lucide-react';

interface InternetSubscriptionsViewProps {
  subscriptions: InternetSubscription[];
  customers: Customer[];
  settings: StoreSettings;
  onUpdateSubscription: (sub: InternetSubscription) => void;
  onAddSubscription: (sub: InternetSubscription, addToShift?: boolean) => void;
  onDeleteSubscription: (id: string) => void;
  onRenewSubscription: (sub: InternetSubscription, addToShift: boolean) => void;
  onRequestOpenTab?: (tab: string) => void;
}

export const InternetSubscriptionsView: React.FC<InternetSubscriptionsViewProps> = ({
  subscriptions,
  customers,
  settings,
  onUpdateSubscription,
  onAddSubscription,
  onDeleteSubscription,
  onRenewSubscription,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'expiring' | 'expired' | 'active'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSub, setEditingSub] = useState<InternetSubscription | null>(null);
  const [renewingSub, setRenewingSub] = useState<InternetSubscription | null>(null);
  const [receiptSub, setReceiptSub] = useState<{ sub: InternetSubscription; receiptNumber: string; date: string } | null>(null);

  // Form state for Add / Edit
  // Exactly ordered: 1. Customer Name, 2. Phone, 3. Address, 4. Amount
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    subscriptionAmount: 250,
    planSpeed: '30 ميجا',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return d.toISOString().split('T')[0];
    })(),
    renewalDay: new Date().getDate(),
    ipOrAccount: '',
    notes: '',
    addToShift: true,
  });

  // Renewal Modal state
  const [renewalData, setRenewalData] = useState({
    amount: 250,
    newExpiryDate: '',
    addToShift: true,
    printReceipt: false,
    notes: '',
  });

  // Calculate days remaining helper
  const getDaysRemaining = (expiryDateStr: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get dynamic status
  const getSubscriptionStatus = (sub: InternetSubscription): {
    key: 'expired' | 'expiring_soon' | 'active';
    label: string;
    badgeClass: string;
    days: number;
  } => {
    const days = getDaysRemaining(sub.expiryDate);
    if (days < 0) {
      return {
        key: 'expired',
        label: `منتهي منذ ${Math.abs(days)} يوم`,
        badgeClass: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
        days,
      };
    } else if (days === 0) {
      return {
        key: 'expiring_soon',
        label: 'ينتهي اليوم!',
        badgeClass: 'bg-rose-600 text-white animate-pulse shadow-sm',
        days,
      };
    } else if (days <= 5) {
      return {
        key: 'expiring_soon',
        label: `ينتهي خلال ${days} ${days === 1 ? 'يوم' : days === 2 ? 'يومين' : 'أيام'}`,
        badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
        days,
      };
    } else {
      return {
        key: 'active',
        label: `نشط (متبقي ${days} يوم)`,
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        days,
      };
    }
  };

  // Statistics
  const stats = useMemo(() => {
    let totalExpectedRevenue = 0;
    let expiringCount = 0;
    let expiredCount = 0;
    let activeCount = 0;

    subscriptions.forEach((sub) => {
      totalExpectedRevenue += Number(sub.subscriptionAmount) || 0;
      const days = getDaysRemaining(sub.expiryDate);
      if (days < 0) {
        expiredCount++;
      } else if (days <= 5) {
        expiringCount++;
      } else {
        activeCount++;
      }
    });

    return {
      totalSubscribers: subscriptions.length,
      totalExpectedRevenue,
      expiringCount,
      expiredCount,
      activeCount,
      urgentCount: expiringCount + expiredCount,
    };
  }, [subscriptions]);

  // Filtered & Sorted Subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        const matchesSearch =
          sub.customerName.toLowerCase().includes(search.toLowerCase()) ||
          sub.phone.includes(search) ||
          sub.address.toLowerCase().includes(search.toLowerCase()) ||
          (sub.planSpeed && sub.planSpeed.toLowerCase().includes(search.toLowerCase())) ||
          (sub.ipOrAccount && sub.ipOrAccount.toLowerCase().includes(search.toLowerCase()));

        if (!matchesSearch) return false;

        const days = getDaysRemaining(sub.expiryDate);
        if (statusFilter === 'expiring') {
          return days >= 0 && days <= 5;
        } else if (statusFilter === 'expired') {
          return days < 0;
        } else if (statusFilter === 'active') {
          return days > 5;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by expiry date ascending (urgent first)
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      });
  }, [subscriptions, search, statusFilter]);

  // Open Add Modal
  const handleOpenAdd = () => {
    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + 30);

    setFormData({
      customerName: '',
      phone: '',
      address: '',
      subscriptionAmount: 250,
      planSpeed: '30 ميجا',
      startDate: today.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      renewalDay: expiry.getDate(),
      ipOrAccount: '',
      notes: '',
      addToShift: true,
    });
    setEditingSub(null);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (sub: InternetSubscription) => {
    setEditingSub(sub);
    setFormData({
      customerName: sub.customerName,
      phone: sub.phone,
      address: sub.address,
      subscriptionAmount: sub.subscriptionAmount,
      planSpeed: sub.planSpeed || '30 ميجا',
      startDate: sub.startDate,
      expiryDate: sub.expiryDate,
      renewalDay: sub.renewalDay || 1,
      ipOrAccount: sub.ipOrAccount || '',
      notes: sub.notes || '',
      addToShift: false,
    });
    setShowAddModal(true);
  };

  // Open Renewal Modal
  const handleOpenRenew = (sub: InternetSubscription) => {
    setRenewingSub(sub);
    // calculate next month expiry date
    const currentExp = new Date(sub.expiryDate);
    const nextExp = new Date(currentExp);
    nextExp.setDate(nextExp.getDate() + 30);

    setRenewalData({
      amount: sub.subscriptionAmount,
      newExpiryDate: nextExp.toISOString().split('T')[0],
      addToShift: true,
      printReceipt: false,
      notes: `تجديد اشتراك شهر ${nextExp.toLocaleDateString('ar-EG', { month: 'long' })}`,
    });
  };

  // Submit Add or Edit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.phone.trim()) {
      alert('يرجى كتابة اسم العميل ورقم التلفون');
      return;
    }

    const calculatedStatus: InternetSubscription['status'] =
      getDaysRemaining(formData.expiryDate) < 0
        ? 'expired'
        : getDaysRemaining(formData.expiryDate) <= 5
        ? 'expiring_soon'
        : 'active';

    if (editingSub) {
      onUpdateSubscription({
        ...editingSub,
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        subscriptionAmount: Number(formData.subscriptionAmount) || 0,
        planSpeed: formData.planSpeed,
        startDate: formData.startDate,
        expiryDate: formData.expiryDate,
        renewalDay: Number(formData.renewalDay) || new Date(formData.expiryDate).getDate(),
        ipOrAccount: formData.ipOrAccount.trim(),
        notes: formData.notes.trim(),
        status: calculatedStatus,
      });
    } else {
      const newSub: InternetSubscription = {
        id: `sub-${Date.now()}`,
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        subscriptionAmount: Number(formData.subscriptionAmount) || 0,
        planSpeed: formData.planSpeed,
        startDate: formData.startDate,
        expiryDate: formData.expiryDate,
        renewalDay: Number(formData.renewalDay) || new Date(formData.expiryDate).getDate(),
        ipOrAccount: formData.ipOrAccount.trim(),
        notes: formData.notes.trim(),
        status: calculatedStatus,
        lastRenewedDate: formData.startDate,
      };
      onAddSubscription(newSub, formData.addToShift);
    }

    setShowAddModal(false);
    setEditingSub(null);
  };

  // Submit Renewal
  const handleConfirmRenewal = () => {
    if (!renewingSub) return;
    const todayIso = new Date().toISOString().split('T')[0];

    const updatedSub: InternetSubscription = {
      ...renewingSub,
      startDate: renewingSub.expiryDate, // New period begins from previous expiry
      expiryDate: renewalData.newExpiryDate,
      subscriptionAmount: Number(renewalData.amount) || renewingSub.subscriptionAmount,
      lastRenewedDate: todayIso,
      status: 'active',
      notes: renewalData.notes
        ? `${renewingSub.notes ? renewingSub.notes + ' | ' : ''}${renewalData.notes}`
        : renewingSub.notes,
    };

    onRenewSubscription(updatedSub, renewalData.addToShift);

    if (renewalData.printReceipt) {
      setReceiptSub({
        sub: updatedSub,
        receiptNumber: `NET-${Date.now().toString().slice(-5)}`,
        date: new Date().toLocaleDateString('ar-EG'),
      });
    }

    setRenewingSub(null);
  };

  // WhatsApp Reminder Sender
  const handleSendWhatsAppReminder = (sub: InternetSubscription) => {
    const days = getDaysRemaining(sub.expiryDate);
    let timeText = '';
    if (days < 0) {
      timeText = `انتهى منذ ${Math.abs(days)} يوم بتاريخ (${sub.expiryDate})`;
    } else if (days === 0) {
      timeText = `ينتهي اليوم بتاريخ (${sub.expiryDate})`;
    } else {
      timeText = `ينتهي خلال ${days} أيام بتاريخ (${sub.expiryDate})`;
    }

    const message = encodeURIComponent(
      `السلام عليكم أستاذ / ${sub.customerName} المحترم،\n` +
      `تحية طيبة من شركة ${settings.storeName}.\n` +
      `نود تذكيركم بموعد تجديد اشتراك الإنترنت الشهري:\n` +
      `• الباقة / السرعة: ${sub.planSpeed || 'اشتراك شهري'}\n` +
      `• مبلغ الاشتراك: ${sub.subscriptionAmount} ${settings.currency}\n` +
      `• حالة الاشتراك: ${timeText}\n\n` +
      `يرجى التكرم بسداد الاشتراك لضمان استمرار الخدمة دون انقطاع.\n` +
      `للتواصل والاستفسار: ${settings.phone1}\n` +
      `شكراً لثقتكم بنا.`
    );

    // Clean phone number: remove leading 0 and format with country code 20 for Egypt or direct
    let cleanPhone = sub.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '2' + cleanPhone;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // Print Receipt directly
  const handlePrintReceiptNow = (sub: InternetSubscription) => {
    setReceiptSub({
      sub,
      receiptNumber: `NET-${Date.now().toString().slice(-5)}`,
      date: new Date().toLocaleDateString('ar-EG'),
    });
  };

  // Quick Customer Autofill
  const handleSelectExistingCustomer = (cName: string) => {
    const found = customers.find((c) => c.name === cName);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        customerName: found.name,
        phone: found.phone1 || prev.phone,
        address: found.address || found.city || prev.address,
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header with Stats & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Wifi className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
              اشتراكات الإنترنت الشهرية
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {subscriptions.length} مشترك
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              إدارة بيانات المشتركين وتذكير العملاء قبل موعد انتهاء الشهر مع التجديد الفوري
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>إضافة مشترك جديد</span>
          </button>
        </div>
      </div>

      {/* 2. Urgent Reminder Alert Banner (Highlighted if any are expiring/expired) */}
      {stats.urgentCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-rose-50 border border-amber-300 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-bounce">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>تنبيه تذكير الاشتراكات الشهرية المستحقة</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white">
                  {stats.urgentCount} بحاجة لتذكير
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                يوجد <strong className="text-amber-700">{stats.expiringCount}</strong> اشتراك ينتهي خلال 5 أيام، و <strong className="text-rose-700">{stats.expiredCount}</strong> اشتراك منتهي بالفعل. يرجى إرسال رسائل تذكير للعملاء والتجديد.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setStatusFilter(stats.expiringCount > 0 ? 'expiring' : 'expired')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              عرض المشتركين المستحقين فقط
            </button>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                عرض الكل
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">إجمالي المشتركين</span>
            <div className="text-xl font-black text-slate-900 mt-0.5 font-mono">
              {stats.totalSubscribers}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold">إجمالي التحصيل المتوقع</span>
            <div className="text-xl font-black text-emerald-600 mt-0.5 font-mono">
              {stats.totalExpectedRevenue.toLocaleString()} <span className="text-xs font-normal text-slate-500">{settings.currency}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border shadow-2xs flex items-center justify-between cursor-pointer transition-all ${statusFilter === 'expiring' ? 'ring-2 ring-amber-500 bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'}`} onClick={() => setStatusFilter(statusFilter === 'expiring' ? 'all' : 'expiring')}>
          <div>
            <span className="text-xs text-amber-700 font-bold flex items-center gap-1">
              <span>ينتهي قريباً (تذكير)</span>
              {stats.expiringCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>}
            </span>
            <div className="text-xl font-black text-amber-600 mt-0.5 font-mono">
              {stats.expiringCount}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border shadow-2xs flex items-center justify-between cursor-pointer transition-all ${statusFilter === 'expired' ? 'ring-2 ring-rose-500 bg-rose-50/70 border-rose-300' : 'bg-white border-slate-200'}`} onClick={() => setStatusFilter(statusFilter === 'expired' ? 'all' : 'expired')}>
          <div>
            <span className="text-xs text-rose-700 font-bold">منتهي / متأخر</span>
            <div className="text-xl font-black text-rose-600 mt-0.5 font-mono">
              {stats.expiredCount}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Search and Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم العميل، التليفون، العنوان..."
            className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `الكل (${subscriptions.length})` },
            { id: 'expiring', label: `🔔 مستحق التذكير (${stats.expiringCount})` },
            { id: 'expired', label: `🔴 منتهي (${stats.expiredCount})` },
            { id: 'active', label: `🟢 نشط ومسدد (${stats.activeCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Subscriptions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-3 w-12 text-center">#</th>
                {/* 1. اسم العميل */}
                <th className="p-3 min-w-[160px]">اسم العميل</th>
                {/* 2. رقم التلفون */}
                <th className="p-3 min-w-[130px]">رقم التلفون</th>
                {/* 3. العنوان */}
                <th className="p-3 min-w-[180px]">العنوان</th>
                {/* 4. مبلغ الاشتراك */}
                <th className="p-3 min-w-[120px]">مبلغ الاشتراك</th>
                {/* موعد التجديد والحالة والتذكير */}
                <th className="p-3 min-w-[130px]">تاريخ الانتهاء</th>
                <th className="p-3 min-w-[140px] text-center">حالة التذكير والتجديد</th>
                <th className="p-3 min-w-[170px] text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <Wifi className="w-10 h-10 mx-auto stroke-1 mb-2 opacity-50" />
                    <p className="text-sm font-bold text-slate-600">لا توجد اشتراكات مطابقة للبحث</p>
                    <p className="text-xs text-slate-400 mt-1">يمكنك إضافة مشترك جديد عبر الزر أعلاه</p>
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub, idx) => {
                  const statusInfo = getSubscriptionStatus(sub);
                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        statusInfo.key === 'expired'
                          ? 'bg-rose-50/20'
                          : statusInfo.key === 'expiring_soon'
                          ? 'bg-amber-50/25'
                          : ''
                      }`}
                    >
                      <td className="p-3 text-center font-mono text-slate-400 font-medium">
                        {idx + 1}
                      </td>

                      {/* 1. اسم العميل */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{sub.customerName}</span>
                          {sub.planSpeed && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-100">
                              {sub.planSpeed}
                            </span>
                          )}
                        </div>
                        {sub.ipOrAccount && (
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            حساب: {sub.ipOrAccount}
                          </div>
                        )}
                      </td>

                      {/* 2. رقم التلفون */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800" dir="ltr">
                            {sub.phone}
                          </span>
                        </div>
                      </td>

                      {/* 3. العنوان */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]" title={sub.address}>
                            {sub.address || 'غير محدد'}
                          </span>
                        </div>
                      </td>

                      {/* 4. مبلغ الاشتراك */}
                      <td className="p-3">
                        <div className="font-mono font-black text-slate-900 text-sm">
                          {Number(sub.subscriptionAmount).toLocaleString()}{' '}
                          <span className="text-[10px] font-normal text-slate-500 font-sans">
                            {settings.currency}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          شهرياً (يوم {sub.renewalDay || new Date(sub.expiryDate).getDate()})
                        </div>
                      </td>

                      {/* تاريخ الانتهاء */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-slate-800 text-xs flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sub.expiryDate}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          بداية: {sub.startDate}
                        </div>
                      </td>

                      {/* حالة التذكير */}
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusInfo.badgeClass}`}>
                          {statusInfo.key === 'expired' && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                          {statusInfo.key === 'expiring_soon' && <Clock className="w-3.5 h-3.5 shrink-0" />}
                          {statusInfo.key === 'active' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* إجراءات سريعة */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* زر تجديد فوري لشهر جديد */}
                          <button
                            onClick={() => handleOpenRenew(sub)}
                            title="تجديد الاشتراك لشهر جديد"
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>تجديد</span>
                          </button>

                          {/* زر إرسال تذكير واتساب */}
                          <button
                            onClick={() => handleSendWhatsAppReminder(sub)}
                            title="إرسال رسالة تذكير عبر واتساب"
                            className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded transition-all cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* زر طباعة إيصال */}
                          <button
                            onClick={() => handlePrintReceiptNow(sub)}
                            title="طباعة إيصال استلام"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-all cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* زر تعديل */}
                          <button
                            onClick={() => handleOpenEdit(sub)}
                            title="تعديل بيانات المشترك"
                            className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* زر حذف */}
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف اشتراك العميل: ${sub.customerName}؟`)) {
                                onDeleteSubscription(sub.id);
                              }
                            }}
                            title="حذف المشترك"
                            className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-all cursor-pointer"
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

      {/* 6. Add / Edit Modal (Fields in exact requested order) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Wifi className="w-5 h-5 text-blue-600" />
                <span>{editingSub ? 'تعديل بيانات المشترك' : 'إضافة مشترك إنترنت جديد'}</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 pt-3 text-xs">
              {/* Optional: Pick from existing customers */}
              {!editingSub && customers.length > 0 && (
                <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">
                    أو اختر من سجل العملاء المسجلين مسبقاً (تعبئة تلقائية):
                  </label>
                  <select
                    onChange={(e) => handleSelectExistingCustomer(e.target.value)}
                    className="w-full p-1.5 bg-white border border-blue-200 rounded-lg text-xs text-slate-800"
                    defaultValue=""
                  >
                    <option value="" disabled>-- اضغط للاختيار من العملاء --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} {c.phone1 ? `(${c.phone1})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 1. اسم العميل (Required First) */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  1. اسم العميل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمود إبراهيم"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold text-xs"
                />
              </div>

              {/* 2. رقم التلفون (Required Second) */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  2. رقم التلفون <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  placeholder="01012345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono text-left font-bold text-xs"
                />
              </div>

              {/* 3. العنوان (Required Third) */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  3. العنوان <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: المنصورة - شارع الجيش - عمارة الأمل"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              {/* 4. مبلغ الاشتراك (Required Fourth) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    4. مبلغ الاشتراك ({settings.currency}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.subscriptionAmount}
                    onChange={(e) => setFormData({ ...formData, subscriptionAmount: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    باقة / سرعة النت
                  </label>
                  <select
                    value={formData.planSpeed}
                    onChange={(e) => setFormData({ ...formData, planSpeed: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-bold"
                  >
                    <option value="30 ميجا">30 ميجا</option>
                    <option value="70 ميجا">70 ميجا</option>
                    <option value="100 ميجا">100 ميجا</option>
                    <option value="140 ميجا">140 ميجا</option>
                    <option value="باقة مفتوحة غير محدودة">باقة مفتوحة غير محدودة</option>
                    <option value="اشتراك مخصص">اشتراك مخصص</option>
                  </select>
                </div>
              </div>

              {/* تواريخ الاشتراك والتجديد */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    تاريخ بداية الاشتراك
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      const nextExp = new Date(newStart);
                      nextExp.setDate(nextExp.getDate() + 30);
                      setFormData({
                        ...formData,
                        startDate: newStart,
                        expiryDate: nextExp.toISOString().split('T')[0],
                        renewalDay: nextExp.getDate(),
                      });
                    }}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    تاريخ انتهاء الشهر (موعد التجديد)
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({
                      ...formData,
                      expiryDate: e.target.value,
                      renewalDay: new Date(e.target.value).getDate(),
                    })}
                    className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-xs font-bold text-blue-700"
                  />
                </div>
              </div>

              {/* تفاصيل إضافية اختيارية */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    اسم المستخدم / رقم الحساب (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: user_123"
                    value={formData.ipOrAccount}
                    onChange={(e) => setFormData({ ...formData, ipOrAccount: e.target.value })}
                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ملاحظات
                  </label>
                  <input
                    type="text"
                    placeholder="أي ملاحظات تخص الخط..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs"
                  />
                </div>
              </div>

              {!editingSub && (
                <label className="flex items-center gap-2 p-2 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.addToShift}
                    onChange={(e) => setFormData({ ...formData, addToShift: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-xs">
                    تسجيل مبلغ الاشتراك ({formData.subscriptionAmount} {settings.currency}) فوراً في درج الخزينة اليومي (F10)
                  </span>
                </label>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                >
                  {editingSub ? 'حفظ التعديلات' : 'حفظ المشترك'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Quick Renewal Modal */}
      {renewingSub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <RefreshCw className="w-5 h-5 text-emerald-600" />
                <span>تجديد اشتراك الإنترنت لشهر جديد</span>
              </div>
              <button
                onClick={() => setRenewingSub(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 pt-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">اسم المشترك:</span>
                  <strong className="text-slate-900 text-sm">{renewingSub.customerName}</strong>
                </div>
                <div className="flex justify-between items-center font-mono">
                  <span className="text-slate-500 font-sans">رقم الهاتف:</span>
                  <span className="font-bold text-slate-800">{renewingSub.phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">الباقة:</span>
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded">
                    {renewingSub.planSpeed || 'اشتراك شهري'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">تاريخ الانتهاء السابق:</span>
                  <span className="font-mono text-rose-600 font-bold">{renewingSub.expiryDate}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  مبلغ التجديد المحصل ({settings.currency})
                </label>
                <input
                  type="number"
                  min="1"
                  value={renewalData.amount}
                  onChange={(e) => setRenewalData({ ...renewalData, amount: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-black text-base focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  تاريخ الانتهاء الجديد (بعد 30 يوماً)
                </label>
                <input
                  type="date"
                  value={renewalData.newExpiryDate}
                  onChange={(e) => setRenewalData({ ...renewalData, newExpiryDate: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-emerald-700 font-mono font-bold text-xs"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 p-2 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={renewalData.addToShift}
                    onChange={(e) => setRenewalData({ ...renewalData, addToShift: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-xs">
                    إضافة المبلغ ({renewalData.amount} {settings.currency}) فوراً إلى درج الخزينة اليومي
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={renewalData.printReceipt}
                    onChange={(e) => setRenewalData({ ...renewalData, printReceipt: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-bold text-xs">
                    معاينة وطباعة إيصال استلام للمشترك فور إتمام التجديد
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRenewingSub(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRenewal}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد التجديد الآن</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Printable Subscription Receipt Modal */}
      {receiptSub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            {/* The Printable Area */}
            <div id="subscription-receipt-print" className="p-4 bg-white border border-slate-300 rounded-xl space-y-3 text-slate-900 text-xs">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h2 className="text-base font-black text-slate-900">{settings.storeName}</h2>
                <p className="text-[10px] text-slate-500">{settings.commercialActivity}</p>
                <p className="text-[10px] text-slate-600 mt-1">هاتف: {settings.phone1} - {settings.phone2}</p>
                <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-full font-bold text-[11px] border border-slate-200">
                  إيصال سداد اشتراك إنترنت شهري
                </div>
              </div>

              <div className="space-y-1.5 py-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم الإيصال:</span>
                  <span className="font-mono font-bold">{receiptSub.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">تاريخ السداد:</span>
                  <span className="font-mono font-bold">{receiptSub.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">اسم المشترك:</span>
                  <strong className="text-slate-900 font-bold">{receiptSub.sub.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم الهاتف:</span>
                  <span className="font-mono font-bold" dir="ltr">{receiptSub.sub.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">العنوان:</span>
                  <span className="text-slate-800">{receiptSub.sub.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الباقة / السرعة:</span>
                  <span className="font-bold text-blue-700">{receiptSub.sub.planSpeed || 'اشتراك شهري'}</span>
                </div>
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-600 font-bold">فترة الاشتراك سارية حتى:</span>
                  <span className="font-mono font-black text-emerald-700">{receiptSub.sub.expiryDate}</span>
                </div>
              </div>

              <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-center font-mono">
                <span className="text-[11px] text-slate-500 font-sans block">المبلغ المسدد</span>
                <span className="text-lg font-black text-slate-900">
                  {receiptSub.sub.subscriptionAmount} {settings.currency}
                </span>
              </div>

              <div className="text-[10px] text-slate-500 text-center pt-2 border-t border-dashed border-slate-300">
                شكراً لاشتراككم معنا - لخدمة الدعم الفني: {settings.phone1}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setReceiptSub(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الإيصال فوراً</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
