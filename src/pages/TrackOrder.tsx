import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import { motion } from "framer-motion";
import { FiClock, FiCheckCircle, FiPackage, FiTruck, FiChevronRight, FiPhone, FiShoppingBag } from "react-icons/fi";
import { useTranslation } from "react-i18next";

export default function TrackOrderPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const orderRef = ref(db, `orders/${id}`);
        const unsubscribe = onValue(orderRef, (snap) => {
            setOrder(snap.val());
            setLoading(false);
        });

        // Safety timeout: stop infinite loading after 5 seconds
        const timer = setTimeout(() => {
            setLoading(false);
        }, 5000);

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-(--bg-main) flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
                />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-(--bg-main) flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-4xl bg-(--bg-card) flex items-center justify-center mb-6 text-5xl shadow-xl border border-(--border-color)">
                    🔍
                </div>
                <h3 className="text-2xl font-black text-(--text-main)">{t('common.order_not_found')}</h3>
                <p className="text-(--text-muted) font-bold mt-2 max-w-md">
                    {t('common.order_not_found_desc')}
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="mt-8 px-10 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                    <FiChevronRight className={isRtl ? "rotate-180" : ""} />
                    {t('common.back_to_menu')}
                </button>
            </div>
        );
    }

    const statuses = ["pending", "preparing", "on_the_way", "delivered"];
    const currentStatus = order.status || "pending";
    const currentIndex = statuses.indexOf(currentStatus);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending": return <FiClock />;
            case "preparing": return <FiPackage />;
            case "on_the_way": return <FiTruck />;
            case "delivered": return <FiCheckCircle />;
            default: return <FiClock />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "pending": return t('admin.pending');
            case "preparing": return t('admin.preparing');
            case "on_the_way": return t('admin.on_the_way');
            case "delivered": return t('admin.delivered');
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-(--bg-main) py-10 px-4 sm:px-6 md:px-10 flex justify-center">
            <div className="w-full max-w-2xl space-y-8">
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-(--bg-card) p-8 rounded-[2.5rem] border border-(--border-color) shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                    <div className="text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20 mb-4">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            {t('common.live_tracking')}
                        </div>
                        <h1 className="text-3xl font-black text-(--text-main) mb-2">{t('common.order_status')}</h1>
                        <p className="text-(--text-muted) font-bold flex items-center justify-center gap-2">
                            #{order.orderId}
                        </p>
                    </div>

                    {/* Stepper */}
                    <div className="mt-12 relative">
                        {/* Track Line */}
                        <div className="absolute top-7 left-8 right-8 h-1 bg-(--bg-main) rounded-full -translate-y-1/2" />
                        <div
                            className="absolute top-7 h-1 bg-primary rounded-full -translate-y-1/2 transition-all duration-1000 ease-out"
                            style={{
                                width: `calc(${(currentIndex / (statuses.length - 1)) * 100}% - 16px)`,
                                left: isRtl ? 'auto' : '32px',
                                right: isRtl ? '32px' : 'auto'
                            }}
                        />

                        <div className="flex justify-between items-start relative z-10">
                            {statuses.map((status, idx) => {
                                const isCompleted = idx < currentIndex;
                                const isCurrent = idx === currentIndex;

                                return (
                                    <div key={status} className="flex flex-col items-center gap-3 w-1/4">
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                scale: isCurrent ? 1.2 : 1,
                                                backgroundColor: isCurrent || isCompleted ? "var(--color-primary)" : "var(--bg-main)",
                                                color: isCurrent || isCompleted ? "#fff" : "var(--text-muted)"
                                            }}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg transition-colors duration-500 ${isCurrent ? "ring-4 ring-primary/20 shadow-primary/30" : "border border-(--border-color)"
                                                }`}
                                        >
                                            {getStatusIcon(status)}
                                        </motion.div>
                                        <div className="text-center">
                                            <p className={`text-[10px] sm:text-xs font-black uppercase tracking-tighter ${isCurrent ? "text-primary" : "text-(--text-muted)"
                                                }`}>
                                                {getStatusLabel(status)}
                                            </p>
                                            {isCurrent && (
                                                <motion.div
                                                    layoutId="current-dot"
                                                    className="w-1.5 h-1.5 bg-primary rounded-full mx-auto mt-1"
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <motion.div
                        initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-(--bg-card) p-6 rounded-3xl border border-(--border-color) shadow-xl"
                    >
                        <h3 className="text-sm font-black text-(--text-muted) uppercase tracking-widest mb-4 flex items-center gap-2">
                            <FiPhone className="text-primary" /> {t('admin.customer_details')}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex flex-col">
                                <span className="text-xs text-(--text-muted)">{t('common.customer_name')}</span>
                                <span className="font-bold text-(--text-main)">{order.customer?.name}</span>
                            </div>
                            {order.customer?.phone && (
                                <div className="flex flex-col">
                                    <span className="text-xs text-(--text-muted)">{t('common.phone_number')}</span>
                                    <span className="font-bold text-(--text-main)">{order.customer.phone}</span>
                                </div>
                            )}
                            {order.customer?.address && (
                                <div className="flex flex-col">
                                    <span className="text-xs text-(--text-muted)">{t('common.address')}</span>
                                    <span className="font-bold text-(--text-main)">{order.customer.address}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Order Info */}
                    <motion.div
                        initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-(--bg-card) p-6 rounded-3xl border border-(--border-color) shadow-xl"
                    >
                        <h3 className="text-sm font-black text-(--text-muted) uppercase tracking-widest mb-4 flex items-center gap-2">
                            <FiShoppingBag className="text-secondary" /> {t('admin.ordered_items')}
                        </h3>
                        <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {order.items?.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-(--text-main)">
                                        <span className="text-primary">{item.qty}×</span> {isRtl ? item.nameAr : item.nameEn || item.nameAr}
                                    </span>
                                    <span className="font-mono text-(--text-muted) text-xs">{item.total}₪</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-(--border-color) flex justify-between items-center">
                            <span className="font-black text-(--text-main)">{t('common.total')}</span>
                            <span className="text-2xl font-black text-primary">{order.totalPrice}₪</span>
                        </div>
                    </motion.div>
                </div>

                {/* Tracking Animation / Map Placeholder */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-primary/5 border border-primary/20 p-8 rounded-4xl text-center"
                >
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-primary rounded-full blur-xl"
                        />
                        <div className="relative w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl shadow-2xl">
                            <FiTruck className="animate-bounce" />
                        </div>
                    </div>
                    <h4 className="text-xl font-black text-primary">{getStatusLabel(currentStatus)}</h4>
                    <p className="text-(--text-muted) text-sm font-bold mt-2">
                        {currentStatus === 'on_the_way'
                            ? t('common.on_the_way_desc', { defaultValue: 'طلبك في الطريق إليك الآن!' })
                            : currentStatus === 'preparing'
                                ? t('common.preparing_desc', { defaultValue: 'نقوم بتحضير وجبتك الشهية بكل حب' })
                                : currentStatus === 'delivered'
                                    ? t('common.delivered_desc', { defaultValue: 'بالهناء والشفاء! نتمنى أن تكون الوجبة أعجبتك' })
                                    : t('common.pending_desc', { defaultValue: 'وصلنا طلبك وبانتظار الموافقة' })
                        }
                    </p>
                </motion.div>

                <button
                    onClick={() => navigate("/")}
                    className="w-full py-5 rounded-3xl bg-(--bg-card) border border-(--border-color) text-(--text-main) font-black hover:bg-(--bg-main) transition-all flex items-center justify-center gap-3 group"
                >
                    {t('common.back_to_menu')}
                    <FiChevronRight className={`transition-transform group-hover:translate-x-2 ${isRtl ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
                </button>
            </div>
        </div>
    );
}
