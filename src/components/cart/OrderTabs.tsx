import { useState, useEffect } from "react";
import type { RefObject } from "react";
import { FaUtensils, FaMotorcycle } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "react-i18next";

interface OrderTabsProps {
    onConfirm: (
        type: "in" | "out",
        customerData: {
            name: string;
            table?: string;
            phone?: string;
            address?: string;
            notes?: string;
        },
        message: string
    ) => void;
    firstInputRef?: RefObject<HTMLInputElement | null>;
    disableSend?: boolean;
    orderSettings?: {
        inRestaurant: boolean;
        takeaway: boolean;
        inPhone: string;
        outPhone: string;
    };
}

export default function OrderTabs({
    onConfirm,
    firstInputRef,
    disableSend,
    orderSettings,
}: OrderTabsProps) {
    const { items, totalPrice } = useCart();
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    /* ================= Tabs ================= */

    const [tab, setTab] = useState<"in" | "out">(() => {
        if (orderSettings?.inRestaurant) return "in";
        if (orderSettings?.takeaway) return "out";
        return "in";
    });

    useEffect(() => {
        if (!orderSettings) return;

        if (tab === "in" && !orderSettings.inRestaurant && orderSettings.takeaway) {
            setTab("out");
        }
        if (tab === "out" && !orderSettings.takeaway && orderSettings.inRestaurant) {
            setTab("in");
        }
    }, [orderSettings, tab]);

    /* ================= Form ================= */

    const [form, setForm] = useState({
        name: "",
        table: "",
        phone: "",
        address: "",
        notes: "",
    });

    const [error, setError] = useState<string | null>(null);

    const isCurrentTabActive = () => {
        if (!orderSettings) return true; // Default to active if settings not loaded yet to avoid blocking
        if (tab === "in") return orderSettings.inRestaurant;
        if (tab === "out") return orderSettings.takeaway;
        return false;
    };

    /* ================= Validation ================= */

    const validateForm = () => {
        console.log("🔍 [OrderTabs] Validating form...", { tab, form });
        
        if (!isCurrentTabActive()) {
            console.warn("⚠️ [OrderTabs] Service unavailable for tab:", tab);
            setError(t('common.service_unavailable'));
            return false;
        }

        if (!form.name.trim()) {
            setError(t('common.name_required'));
            return false;
        }

        if (tab === "in") {
            if (!form.table.trim()) {
                setError(t('common.table_required'));
                return false;
            }
        }

        if (tab === "out") {
            if (!form.phone.trim()) {
                setError(t('common.phone_required'));
                return false;
            }
            if (!/^\d{6,15}$/.test(form.phone)) {
                setError(t('common.invalid_phone'));
                return false;
            }
            if (!form.address.trim()) {
                setError(t('common.address_required'));
                return false;
            }
        }

        if (items.length === 0) {
            setError(t('common.empty_cart'));
            return false;
        }

        console.log("✅ [OrderTabs] Validation passed.");
        setError(null);
        return true;
    };

    /* ================= Message ================= */

    const buildMessage = () => {
        const now = new Date();
        const dateStr = now.toLocaleDateString(isRtl ? "ar-EG" : "en-US");
        const timeStr = now.toLocaleTimeString(isRtl ? "ar-EG" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });

        const list = items
            .map(
                i => {
                    const itemName = isRtl ? (i as any).nameAr || i.name : (i as any).nameEn || i.name;
                    return `🔹 ${i.qty} × ${itemName} → ${i.selectedPrice * i.qty}₪`;
                }
            )
            .join("\n");

        if (tab === "in") {
            return `✨ *${t('common.dine_in')}* ✨
========================
${list}
========================
💰 *${t('common.total')}:* ${totalPrice}₪
========================

👤 *${t('whatsapp.customer_name')}:* ${form.name}
🍽️ *${t('whatsapp.table_number')}:* ${form.table}
📝 *${t('whatsapp.notes')}:* ${form.notes || "—"}

⏰ *${t('whatsapp.time')}:* ${timeStr}
📅 *${t('whatsapp.date')}:* ${dateStr}

💵 ${t('whatsapp.payment_cashier')}
========================`;
        }

        return `✨ *${t('common.takeaway')}* ✨
========================
${list}
========================

💰 *${t('common.total')}:* ${totalPrice}₪
👤 *${t('whatsapp.customer_name')}:* ${form.name}
📱 *${t('whatsapp.phone_number')}:* ${form.phone}
🏠 *${t('whatsapp.address')}:* ${form.address}
📝 *${t('whatsapp.notes')}:* ${form.notes || "—"}

⏰ *${t('whatsapp.time')}:* ${timeStr}
📅 *${t('whatsapp.date')}:* ${dateStr}

💵 ${t('whatsapp.payment_delivery')}
========================`;
    };

    const submit = () => {
        console.log("🔘 [OrderTabs] Submit button clicked.");
        if (!validateForm()) return;

        const message = buildMessage();
        console.log("📨 [OrderTabs] Calling onConfirm handler...");

        onConfirm(
            tab,
            {
                name: form.name,
                table: tab === "in" ? (form.table || "") : "",
                phone: tab === "out" ? (form.phone || "") : "",
                address: tab === "out" ? (form.address || "") : "",
                notes: form.notes || "",
            },
            message
        );
    };


    /* ================= UI ================= */

    return (
        <div className="mt-6 space-y-5">
            {/* Tabs */}
            <div className="flex gap-4">
                <button
                    onClick={() => orderSettings?.inRestaurant && setTab("in")}
                    disabled={!orderSettings?.inRestaurant}
                    className={`
                        flex-1 flex items-center justify-center gap-3
                        py-4 rounded-2xl font-black text-sm transition-all
                        duration-300
                        ${tab === "in"
                            ? "bg-primary text-white shadow-xl shadow-primary/30"
                            : "bg-(--bg-main) border border-(--border-color) text-(--text-muted) hover:bg-(--bg-card)"}
                        ${!orderSettings?.inRestaurant ? "opacity-30 cursor-not-allowed grayscale" : ""}
                        `}
                >
                    <FaUtensils className="text-lg" />
                    {t('common.dine_in')}
                </button>

                <button
                    onClick={() => orderSettings?.takeaway && setTab("out")}
                    disabled={!orderSettings?.takeaway}
                    className={`
                            flex-1 flex items-center justify-center gap-3
                            py-4 rounded-2xl font-black text-sm transition-all
                            duration-300
                            ${tab === "out"
                            ? "bg-primary text-white shadow-xl shadow-primary/30"
                            : "bg-(--bg-main) border border-(--border-color) text-(--text-muted) hover:bg-(--bg-card)"}
                            ${!orderSettings?.takeaway ? "opacity-30 cursor-not-allowed grayscale" : ""}
                            `}
                >
                    <FaMotorcycle className="text-lg" />
                    {t('common.takeaway')}
                </button>
            </div>


            {/* Error */}
            {error && (
                <div className="text-xs font-bold text-red-500 bg-red-500/5 p-3 rounded-2xl text-center border border-red-500/10">
                    {error}
                </div>
            )}

            {/* Inputs */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div className="relative group">
                        <input
                            ref={firstInputRef}
                            placeholder={t('common.customer_name')}
                            className={`w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-3.5 ${isRtl ? 'pr-4 pl-4' : 'pl-4 pr-4'} text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all`}
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    {tab === "in" && (
                        <input
                            placeholder={t('common.table_number')}
                            className={`w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-3.5 px-4 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all`}
                            value={form.table}
                            onChange={e => setForm({ ...form, table: e.target.value })}
                        />
                    )}

                    {tab === "out" && (
                        <>
                            <input
                                placeholder={t('common.phone_number')}
                                className={`w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-3.5 px-4 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all`}
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                            />
                            <input
                                placeholder={t('common.address')}
                                className={`w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-3.5 px-4 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all`}
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                            />
                        </>
                    )}

                    <textarea
                        placeholder={t('common.notes_optional')}
                        rows={2}
                        className={`w-full bg-(--bg-main) border border-(--border-color) rounded-2xl py-3.5 px-4 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-none`}
                        value={form.notes}
                        onChange={e => setForm({ ...form, notes: e.target.value })}
                    />
                </div>
            </div>

            {/* Submit */}
            <button
                onClick={submit}
                disabled={disableSend || !isCurrentTabActive()}
                className={`w-full py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all
                ${disableSend || !isCurrentTabActive() ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                {t('common.confirm_order')}
            </button>
        </div>
    );
}
