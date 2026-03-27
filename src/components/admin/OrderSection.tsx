import React, { useState } from "react";
import { ref, update, remove } from "firebase/database";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaUtensils, FaShoppingBag, FaClock, FaTrash, FaHistory } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface Props {
    orders: Record<string, any>;
}

const OrderSection: React.FC<Props> = ({ orders }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [openOrder, setOpenOrder] = useState<string | null>(null);

    const orderArray = Object.entries(orders || {})
        .map(([id, order]) => ({ id, ...order }))
        .sort((a, b) => b.createdAt - a.createdAt);

    const toggleOrder = (id: string) => {
        setOpenOrder(openOrder === id ? null : id);
    };

    const updateStatus = (id: string, status: string) => {
        update(ref(db, `orders/${id}`), { status });
    };

    const deleteOrder = (id: string) => {
        if (confirm(t('admin.confirm_delete_order'))) {
            remove(ref(db, `orders/${id}`));
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "preparing": return "bg-blue-500/10 text-blue-500 border-blue-500/20 text-(--text-main)";
            case "ready": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "done":
            case "delivered": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
            case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
        }
    };

    const getStatusName = (status: string) => {
        switch (status) {
            case "pending": return t('admin.pending');
            case "preparing": return t('admin.preparing');
            case "ready": return t('admin.ready');
            case "done":
            case "delivered": return t('admin.delivered');
            case "cancelled": return t('admin.cancelled');
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 px-2">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-primary flex items-center gap-3">
                        <FaHistory className="text-xl sm:text-2xl" />
                        {t('admin.orders_board')}
                    </h2>
                    <p className="text-(--text-muted) text-xs sm:text-sm font-medium mt-1">
                        {t('admin.manage_orders')}
                    </p>
                </div>
                <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10 flex items-center self-end sm:self-auto">
                    <span className="text-primary font-black text-lg">{orderArray.length}</span>
                    <span className={`text-(--text-muted) text-[10px] font-bold ${isRtl ? 'mr-2' : 'ml-2'}`}>{t('admin.total_orders')}</span>
                </div>
            </header>

            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {orderArray.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-(--bg-card) rounded-4xl p-12 text-center border border-dashed border-(--border-color)"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-(--bg-main) rounded-full flex items-center justify-center mx-auto mb-4 text-3xl opacity-30">
                                📋
                            </div>
                            <p className="text-(--text-muted) font-bold">{t('admin.no_orders')}</p>
                        </motion.div>
                    ) : (
                        orderArray.map((order, index) => {
                            const isOpen = openOrder === order.id;
                            const statusStyles = getStatusStyles(order.status || "pending");

                            return (
                                <motion.div
                                    layout
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`bg-(--bg-card) rounded-3xl sm:rounded-4xl border transition-all duration-300 ${isOpen ? "border-primary shadow-xl ring-4 ring-primary/5" : "border-(--border-color) hover:border-primary/30"
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleOrder(order.id)}
                                        className={`w-full ${isRtl ? 'text-right' : 'text-left'} flex flex-col md:flex-row md:items-center gap-4 p-5 sm:p-6`}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-lg sm:text-xl shadow-inner shrink-0 ${order.orderType === "in" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                                                }`}>
                                                {order.orderType === "in" ? <FaUtensils /> : <FaShoppingBag />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-black text-base sm:text-lg text-(--text-main) flex flex-wrap items-center gap-2">
                                                    <span className="truncate max-w-[150px] sm:max-w-none">{order.customer?.name || t('admin.customer')}</span>
                                                    {order.customer?.table && (
                                                        <span className="bg-primary/10 text-primary text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                                                            {t('common.table')} {order.customer.table}
                                                        </span>
                                                    )}
                                                </h3>
                                                <div className="flex items-center gap-3 text-[10px] sm:text-xs text-(--text-muted) font-bold mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <FaClock className="opacity-50" />
                                                        {new Date(order.createdAt).toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{order.items?.length} {t('admin.products')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                                            <div className={`px-3 sm:px-4 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border shrink-0 ${statusStyles}`}>
                                                {getStatusName(order.status || "pending")}
                                            </div>
                                            <div className="text-lg sm:text-xl font-black text-primary whitespace-nowrap">
                                                {order.totalPrice} <span className="text-[10px] sm:text-xs">₪</span>
                                            </div>
                                            <div className={`text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                                                <FaChevronDown />
                                            </div>
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-(--border-color) bg-(--bg-main)/30">
                                                    <div className="grid md:grid-cols-2 gap-6 sm:gap-8 py-4">
                                                        <div className="space-y-4">
                                                            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-(--text-muted) flex items-center gap-2">
                                                                <span className="w-1 h-3 bg-primary rounded-full" />
                                                                {t('admin.customer_details')}
                                                            </h4>
                                                            <div className="bg-(--bg-card) p-4 rounded-2xl border border-(--border-color) space-y-2.5">
                                                                {order.customer?.phone && (
                                                                    <p className="text-sm font-bold text-(--text-main) flex items-center gap-2">
                                                                        <span className="opacity-50">📱</span>
                                                                        {order.customer.phone}
                                                                    </p>
                                                                )}
                                                                {order.customer?.address && (
                                                                    <p className="text-sm font-bold text-(--text-main) flex items-center gap-2">
                                                                        <span className="opacity-50">📍</span>
                                                                        {order.customer.address}
                                                                    </p>
                                                                )}
                                                                {order.customer?.notes && (
                                                                    <p className="text-xs text-(--text-muted) bg-yellow-500/5 p-3 rounded-xl border border-yellow-500/10 mt-2 italic flex gap-2">
                                                                        <span className="shrink-0">📝</span>
                                                                        {order.customer.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-(--text-muted) flex items-center gap-2">
                                                                <span className="w-1 h-3 bg-secondary rounded-full" />
                                                                {t('admin.ordered_items')}
                                                            </h4>
                                                            <div className="bg-(--bg-card) p-4 rounded-2xl border border-(--border-color) divide-y divide-(--border-color)">
                                                                {order.items.map((item: any, i: number) => {
                                                                    const itemName = isRtl 
                                                                        ? (item.nameAr || item.nameEn || item.name) 
                                                                        : (item.nameEn || item.nameAr || item.name);
                                                                    return (
                                                                        <div key={i} className="flex justify-between py-2.5 text-sm">
                                                                            <span className="font-bold text-(--text-main)">
                                                                                <span className="text-primary mr-1">{item.qty}×</span> {itemName}
                                                                            </span>
                                                                            <span className="font-mono text-(--text-muted) text-xs">{item.total} ₪</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6 pt-6 border-t border-(--border-color)">
                                                        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                                                            <button
                                                                onClick={() => updateStatus(order.id, "pending")}
                                                                className={`px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${order.status === 'pending' || !order.status ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' : 'bg-(--bg-main) text-(--text-muted) border border-(--border-color) hover:bg-yellow-50'}`}
                                                            >
                                                                ⏳ {t('admin.pending')}
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(order.id, "preparing")}
                                                                className={`px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${order.status === 'preparing' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-(--bg-main) text-(--text-muted) border border-(--border-color) hover:bg-blue-50'}`}
                                                            >
                                                                👨‍🍳 {t('admin.preparing')}
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(order.id, "ready")}
                                                                className={`px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${order.status === 'ready' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-(--bg-main) text-(--text-muted) border border-(--border-color) hover:bg-green-50'}`}
                                                            >
                                                                🔔 {t('admin.ready')}
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(order.id, "delivered")}
                                                                className={`px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${order.status === 'delivered' || order.status === 'done' ? 'bg-gray-700 text-white shadow-lg shadow-gray-700/20' : 'bg-(--bg-main) text-(--text-muted) border border-(--border-color) hover:bg-gray-50'}`}
                                                            >
                                                                ✅ {t('admin.delivered')}
                                                            </button>
                                                        </div>

                                                        <button
                                                            onClick={() => deleteOrder(order.id)}
                                                            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100"
                                                        >
                                                            <FaTrash size={12} />
                                                            {t('admin.delete_order')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrderSection;
