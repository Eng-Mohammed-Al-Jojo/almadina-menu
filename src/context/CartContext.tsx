import { createContext, useContext, useMemo, useState } from "react";
import type { Item } from "../components/menu/Menu";

/* ================= Types ================= */

export interface CartItem extends Item {
    qty: number;
    selectedPrice: number;
    priceKey: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Item, price: number) => void;
    increase: (priceKey: string) => void;
    decrease: (priceKey: string) => void;
    removeItem: (priceKey: string) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    orderId: string | null;
    updateOrderId: (id: string | null) => void;
}

/* ================= Context ================= */

const CartContext = createContext<CartContextType | null>(null);

/* ================= Provider ================= */

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [orderId, setOrderId] = useState<string | null>(() => localStorage.getItem("lastOrderId"));

    const updateOrderId = (id: string | null) => {
        setOrderId(id);
        if (id) localStorage.setItem("lastOrderId", id);
        else localStorage.removeItem("lastOrderId");
    };

    /* إضافة صنف بسعر محدد */
    const addItem = (item: Item, price: number) => {
        const key = `${item.id}-${price}`;

        setItems(prev => {
            const found = prev.find(i => i.priceKey === key);

            if (found) {
                return prev.map(i =>
                    i.priceKey === key ? { ...i, qty: i.qty + 1 } : i
                );
            }

            return [
                ...prev,
                {
                    ...item,
                    qty: 1,
                    selectedPrice: price,
                    priceKey: key,
                },
            ];
        });
    };

    /* زيادة */
    const increase = (priceKey: string) => {
        setItems(prev =>
            prev.map(i =>
                i.priceKey === priceKey ? { ...i, qty: i.qty + 1 } : i
            )
        );
    };

    /* نقصان */
    const decrease = (priceKey: string) => {
        setItems(prev =>
            prev
                .map(i =>
                    i.priceKey === priceKey ? { ...i, qty: i.qty - 1 } : i
                )
                .filter(i => i.qty > 0)
        );
    };

    /* حذف */
    const removeItem = (priceKey: string) => {
        setItems(prev => prev.filter(i => i.priceKey !== priceKey));
    };

    /* تفريغ */
    const clearCart = () => setItems([]);

    /* مجموع الكميات */
    const totalItems = useMemo(
        () => items.reduce((sum, i) => sum + i.qty, 0),
        [items]
    );

    /* مجموع السعر */
    const totalPrice = useMemo(
        () =>
            items.reduce(
                (sum, i) => sum + i.selectedPrice * i.qty,
                0
            ),
        [items]
    );

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                increase,
                decrease,
                removeItem,
                clearCart,
                totalItems,
                totalPrice,
                orderId,
                updateOrderId,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

/* ================= Hook ================= */

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart must be used inside CartProvider");
    }
    return ctx;
}
