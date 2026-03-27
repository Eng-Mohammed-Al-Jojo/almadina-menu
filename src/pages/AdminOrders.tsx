import { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
    FiSearch, FiFilter, FiCalendar, FiPackage, FiTruck, FiCheckCircle,
    FiClock, FiTrash2, FiArchive, FiPhone, FiMapPin,
    FiMessageSquare, FiChevronDown
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { OrderService } from "../services/orderService";
import { FirebaseService } from "../services/firebaseService";

export default function AdminOrdersPage() {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const navigate = useNavigate();
    const [authOk, setAuthOk] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(50);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");
    const [showArchived, setShowArchived] = useState(false);
    const [, setPrevOrdersCount] = useState<number | null>(null);
    const [openOrderId, setOpenOrderId] = useState<string | null>(null);

    const toggleOrder = (id: string) => {
        setOpenOrderId(prev => (prev === id ? null : id));
    };
    useEffect(() => {
        const auth = FirebaseService.auth();
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            setAuthOk(!!user);
            if (!user) {
                setLoading(false);
            }
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!authOk) return;

        const unsubscribe = OrderService.listenToOrders(limit, (ordersArray) => {
            setPrevOrdersCount(prev => {
                if (prev !== null && ordersArray.length > prev) {
                    const latestOrder = ordersArray[0];
                    toast.success(`${t('admin.new_order_alert')}: ${latestOrder.customer?.name || t('admin.customer')}`, {
                        duration: 5000,
                        icon: '🔔',
                    });
                    new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3").play().catch(() => { });
                }
                return ordersArray.length;
            });

            setOrders(ordersArray);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [authOk, limit, t]);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // Search filter
            const matchesSearch =
                (order.customer?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.customer?.phone || "").includes(searchTerm) ||
                (order.orderId || "").toLowerCase().includes(searchTerm.toLowerCase());

            // Archiving filter (Soft delete)
            const matchesArchived = showArchived ? order.archived === true : !order.archived;

            // Status filter
            const matchesStatus = statusFilter === "all" || order.status === statusFilter;

            // Date filter
            const orderDate = new Date(order.createdAt).toDateString();
            const today = new Date().toDateString();
            const matchesDate = dateFilter === "all" || orderDate === today;

            return matchesSearch && matchesArchived && matchesStatus && matchesDate;
        });
    }, [orders, searchTerm, statusFilter, dateFilter, showArchived]);

    const updateOrderStatus = async (id: string, status: string) => {
        try {
            await OrderService.updateStatus(id, status);
            toast.success(t('common.success_message'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const archiveOrder = async (id: string, archived: boolean) => {
        try {
            await OrderService.toggleArchive(id, archived);
            toast.success(t('common.success_message'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const deleteOrder = async (id: string) => {
        if (window.confirm(t('admin.confirm_delete_order'))) {
            try {
                await OrderService.deleteOrder(id);
                toast.success(t('common.success_message'));
            } catch (error) {
                toast.error(t('common.error'));
            }
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending": return <FiClock className="text-yellow-500" />;
            case "preparing": return <FiPackage className="text-blue-500" />;
            case "on_the_way": return <FiTruck className="text-purple-500" />;
            case "delivered": return <FiCheckCircle className="text-green-500" />;
            case "cancelled": return <FiArchive className="text-red-500" />;
            default: return <FiClock className="text-gray-400" />;
        }
    };

    if (!authOk && !loading) {
        return (
            <div className="min-h-screen bg-(--bg-main) flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-(--bg-card) p-10 rounded-[3rem] border border-(--border-color) shadow-2xl text-center max-w-sm"
                >
                    <div className="text-6xl mb-6">🔒</div>
                    <h2 className="text-2xl font-black text-(--text-main) mb-2">{t('admin.login_title')}</h2>
                    <p className="text-(--text-muted) font-bold mb-8">{t('admin.login_subtitle')}</p>
                    <button
                        onClick={() => navigate("/admin")}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {t('admin.login_btn')}
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-(--bg-main) p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                <div className="flex items-center gap-4 mb-6">
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "(--color-secondary)", color: "(--color-primary)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="px-3 py-2 bg-(--bg-card) text-(--text-main) rounded-2xl font-extrabold shadow-lg flex items-center gap-3 border border-(--border-color) hover:shadow-2xl transition-all duration-300 w-12 h-12"
                    >
                        <motion.span

                            className="text-2xl md:text-3xl"
                        >
                            →
                        </motion.span>
                    </motion.button>

                </div>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-(--text-main)">{t('admin.orders_board')}</h1>
                            <p className="text-(--text-muted) text-sm font-bold uppercase tracking-widest mt-1">
                                {showArchived ? t('admin.archived_orders') : t('admin.active_orders')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className={`flex-1 md:flex-none px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${showArchived
                                ? "bg-primary text-white shadow-primary/20"
                                : "bg-(--bg-card) text-(--text-muted) border border-(--border-color)"
                                }`}
                        >
                            <FiArchive />
                            {showArchived ? t('admin.active_orders') : t('admin.archived_orders')}
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-(--bg-card) p-4 rounded-3xl border border-(--border-color) shadow-xl">
                    <div className="relative group md:col-span-2">
                        <FiSearch className={`absolute top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-primary ${isRtl ? 'right-4' : 'left-4'}`} />
                        <input
                            type="text"
                            placeholder={t('admin.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full py-3 bg-(--bg-main) border border-(--border-color) rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                        />
                    </div>

                    <div className="relative">
                        <FiFilter className={`absolute top-1/2 -translate-y-1/2 text-(--text-muted) ${isRtl ? 'right-4' : 'left-4'}`} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`w-full py-3 bg-(--bg-main) border border-(--border-color) rounded-2xl outline-none focus:border-primary transition-all font-bold text-sm appearance-none ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                        >
                            <option value="all">{t('admin.filter_by_status')}</option>
                            <option value="pending">{t('admin.pending')}</option>
                            <option value="preparing">{t('admin.preparing')}</option>
                            <option value="on_the_way">{t('admin.on_the_way')}</option>
                            <option value="delivered">{t('admin.delivered')}</option>
                            <option value="cancelled">{t('admin.cancelled')}</option>
                        </select>
                    </div>

                    <div className="relative">
                        <FiCalendar className={`absolute top-1/2 -translate-y-1/2 text-(--text-muted) ${isRtl ? 'right-4' : 'left-4'}`} />
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className={`w-full py-3 bg-(--bg-main) border border-(--border-color) rounded-2xl outline-none focus:border-primary transition-all font-bold text-sm appearance-none ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                        >
                            <option value="all">{t('admin.all_dates')}</option>
                            <option value="today">{t('admin.today')}</option>
                        </select>
                    </div>
                </div>

                {/* Orders List */}
                <div className="grid gap-6">
                    {loading ? (
                        <div className="py-20 text-center col-span-full">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="inline-block w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full mb-4" />
                            <p className="text-(--text-muted) font-bold">{t('common.loading')}</p>
                        </div>
                    ) : (
                        <>
                            {filteredOrders.length === 0 ? (
                                <div className="bg-(--bg-card) p-20 rounded-[3rem] border border-dashed border-(--border-color) text-center col-span-full">
                                    <div className="text-6xl mb-6 opacity-30">📂</div>
                                    <h3 className="text-xl font-black text-(--text-main)">{t('admin.no_results_found')}</h3>
                                    <p className="text-(--text-muted) font-bold mt-2">{t('admin.no_orders')}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    <AnimatePresence mode="popLayout">
                                        {filteredOrders.map((order) => (
                                            <motion.div
                                                layout
                                                key={order.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="bg-(--bg-card) rounded-4xl border border-(--border-color) shadow-xl overflow-hidden transition-all group"
                                            >
                                                {/* Header (Clickable) */}
                                                <div
                                                    onClick={() => toggleOrder(order.id)}
                                                    className={`p-5 flex justify-between items-center cursor-pointer border-b border-(--border-color) transition-colors ${openOrderId === order.id ? 'bg-primary/5' : 'bg-(--bg-main)/30 hover:bg-primary/5'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                                                            {getStatusIcon(order.status || "pending")}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black uppercase tracking-widest text-primary">
                                                                {order.orderId}
                                                            </span>
                                                            <span className="text-sm font-bold text-(--text-main)">
                                                                {order.customer?.name}
                                                            </span>

                                                            <span className="text-sm font-bold text-(--text-main)">
                                                                {t('admin.table_number')} : {order.customer?.table}
                                                            </span>
                                                            {order.customer?.phone && (
                                                                <span className="text-sm font-bold text-(--text-main)">
                                                                    {t('admin.phone')} : {order.customer?.phone}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-(--text-muted)">
                                                            {new Date(order.createdAt).toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>

                                                        {/* Arrow */}
                                                        <motion.div
                                                            animate={{ rotate: openOrderId === order.id ? 180 : 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="text-(--text-muted) flex items-center justify-center w-8 h-8 rounded-full bg-(--bg-card) border border-(--border-color) shadow-sm"
                                                        >
                                                            <FiChevronDown />
                                                        </motion.div>
                                                    </div>
                                                </div>

                                                {/* Content (Accordion) */}
                                                <AnimatePresence>
                                                    {openOrderId === order.id && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="p-6 space-y-5">

                                                                {/* Customer Info */}
                                                                <div className="flex flex-col gap-1">
                                                                    {order.customer?.phone && (
                                                                        <div className="flex items-center gap-2 text-sm text-(--text-muted) font-bold">
                                                                            <FiPhone />
                                                                            <span>{order.customer.phone}</span>
                                                                        </div>
                                                                    )}
                                                                    {order.customer?.address && (
                                                                        <div className="flex items-center gap-2 text-sm text-(--text-muted) font-bold">
                                                                            <FiMapPin />
                                                                            <span>{order.customer.address}</span>
                                                                        </div>
                                                                    )}
                                                                    {order.customer?.notes && (
                                                                        <div className="mt-2 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 text-xs font-bold text-orange-600 flex gap-2 italic">
                                                                            <FiMessageSquare />
                                                                            <span>{order.customer.notes}</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Items */}
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-(--text-muted)">
                                                                        <span>{t('admin.ordered_items')}</span>
                                                                        <span>{order.items?.length || 0}</span>
                                                                    </div>

                                                                    <div className="bg-(--bg-main)/50 rounded-2xl p-3 border border-(--border-color) divide-y divide-(--border-color)/50 max-h-40 overflow-y-auto">
                                                                        {order.items?.map((item: any, idx: number) => (
                                                                            <div key={idx} className="flex justify-between py-1.5 text-xs">
                                                                                <span className="font-bold text-(--text-main)">
                                                                                    <span className="text-primary">{item.qty}×</span> {isRtl ? item.nameAr : item.nameEn || item.nameAr}
                                                                                </span>
                                                                                <span className="font-mono text-(--text-muted)">
                                                                                    {item.total}₪
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Total */}
                                                                <div className="flex justify-between items-center pt-2">
                                                                    <span className="font-black text-(--text-main)">
                                                                        {t('common.total')}
                                                                    </span>
                                                                    <span className="text-2xl font-black text-primary">
                                                                        {order.totalPrice}₪
                                                                    </span>
                                                                </div>

                                                                {/* Status Buttons (رجعناها 🔥) */}
                                                                <div className="flex flex-wrap gap-2">
                                                                    {["pending", "preparing", "on_the_way", "delivered"].map((st) => (
                                                                        <button
                                                                            key={st}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation(); // مهم عشان ما يسكر الاكورديون
                                                                                updateOrderStatus(order.id, st);
                                                                            }}
                                                                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${order.status === st
                                                                                ? "bg-primary text-white border-primary"
                                                                                : "bg-(--bg-card) text-(--text-muted) border-(--border-color) hover:bg-primary/5 hover:text-primary"
                                                                                }`}
                                                                        >
                                                                            {t(`admin.${st}`)}
                                                                        </button>
                                                                    ))}
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="grid grid-cols-2 gap-2">

                                                                    {/* Track Order 🔥 رجعناها */}
                                                                    {/* <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigate(`/track-order/${order.id}`);
                                                                        }}
                                                                        className="flex items-center justify-center py-3 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-all"
                                                                    >
                                                                        <FiExternalLink />
                                                                    </button> */}

                                                                    {/* Archive */}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            archiveOrder(order.id, !order.archived);
                                                                        }}
                                                                        className="flex items-center justify-center py-3 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-all"
                                                                    >
                                                                        <FiArchive />
                                                                    </button>

                                                                    {/* Delete */}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            deleteOrder(order.id);
                                                                        }}
                                                                        className="flex items-center justify-center py-3 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all"
                                                                    >
                                                                        <FiTrash2 />
                                                                    </button>

                                                                </div>

                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Load More */}
                            {orders.length >= limit && (
                                <div className="flex justify-center pt-8 pb-12">
                                    <button
                                        onClick={() => setLimit(prev => prev + 50)}
                                        className="px-10 py-4 bg-(--bg-card) text-(--text-main) border border-(--border-color) rounded-2xl font-black text-sm hover:border-primary hover:text-primary transition-all shadow-xl hover:shadow-primary/5 active:scale-95"
                                    >
                                        {t('admin.load_more')}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
