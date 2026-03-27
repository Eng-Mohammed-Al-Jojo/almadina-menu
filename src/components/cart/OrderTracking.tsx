import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiClock, FiCheckCircle, FiPackage, FiTruck, FiChevronRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { FirebaseService } from "../../services/firebaseService";

interface OrderTrackingProps {
    orderId: string;
    onClose: () => void;
}

export default function OrderTracking({ orderId, onClose }: OrderTrackingProps) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = FirebaseService.listen(`orders/${orderId}`, (val) => {
            setOrder(val);
            setLoading(false);
        });

        const timer = setTimeout(() => {
            setLoading(false);
        }, 5000);

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, [orderId]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
            <p className="text-(--text-muted) font-bold">{t('common.loading_order')}</p>
        </div>
    );

    if (!order) return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center h-full">
            <div className="w-24 h-24 rounded-4xl bg-(--bg-main) flex items-center justify-center mb-6 text-5xl shadow-inner border border-(--border-color)">
                🔍
            </div>
            <h3 className="text-xl font-black text-(--text-main)">{t('common.order_not_found')}</h3>
            <p className="text-(--text-muted) text-sm mt-2 font-bold max-w-[250px]">
                {t('common.order_not_found_desc')}
            </p>
            <button
                onClick={onClose}
                className="mt-8 px-10 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all"
            >
                {t('common.back_to_menu')}
            </button>
        </div>
    );

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
        <div className="p-6 sm:p-8 space-y-8">
            {/* Header Tracking */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {t('common.live_tracking')}
                </div>
                <h3 className="text-2xl font-black text-(--text-main)">{t('common.order_status')}</h3>
                <p className="text-(--text-muted) text-sm font-bold flex items-center justify-center gap-2">
                    {t('common.order_id')}: <span className="text-primary font-mono">{order.orderId}</span>
                </p>
            </div>

            {/* Status Timeline */}
            <div className="relative py-4">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-(--border-color) -translate-y-1/2 rounded-full" />
                <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-1000 rounded-full"
                    style={{ 
                        width: `${(currentIndex / (statuses.length - 1)) * 100}%`,
                        right: isRtl ? 0 : 'auto',
                        left: isRtl ? 'auto' : 0
                    }}
                />

                <div className="flex justify-between relative z-10 gap-2">
                    {statuses.map((status, idx) => {
                        const isCompleted = idx <= currentIndex;
                        const isCurrent = idx === currentIndex;

                        return (
                            <div key={status} className="flex flex-col items-center gap-3 min-w-0">
                                <motion.div
                                    animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-all duration-500 shadow-xl ${
                                        isCurrent ? "bg-primary text-white shadow-primary/30 ring-4 ring-primary/10" :
                                        isCompleted ? "bg-primary/20 text-primary" : "bg-(--bg-main) text-(--text-muted) border border-(--border-color)"
                                    }`}
                                >
                                    {getStatusIcon(status)}
                                </motion.div>
                                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-tighter sm:tracking-widest whitespace-nowrap ${
                                    isCompleted ? "text-primary" : "text-(--text-muted)"
                                }`}>
                                    {getStatusLabel(status)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Order Brief */}
            <div className="bg-(--bg-main)/50 rounded-3xl border border-(--border-color) p-5 space-y-4">
                <div className="flex justify-between items-center text-sm font-black text-(--text-main)">
                    <span>{t('admin.ordered_items')}</span>
                    <span className="text-xs text-(--text-muted)">{order.items?.length} {t('admin.products')}</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {order.items?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                            <span className="font-bold text-(--text-main)">{item.qty} × {i18n.language === 'ar' ? item.nameAr : item.nameEn || item.nameAr}</span>
                            <span className="font-mono text-(--text-muted)">{item.total}₪</span>
                        </div>
                    ))}
                </div>
                <div className="pt-4 border-t border-(--border-color) flex justify-between items-center">
                    <span className="text-sm font-black text-(--text-main)">{t('common.total')}</span>
                    <span className="text-xl font-black text-primary">{order.totalPrice}₪</span>
                </div>
            </div>

            <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-(--bg-card) text-(--text-main) border border-(--border-color) font-black text-sm hover:bg-(--bg-main) transition-all flex items-center justify-center gap-2 group"
            >
                {t('common.back_to_menu')}
                <FiChevronRight className={`transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </button>
        </div>
    );
}
