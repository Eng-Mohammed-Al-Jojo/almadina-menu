import { FirebaseService } from "./firebaseService";

/**
 * Order Service
 * Handles business logic for orders
 */
export const OrderService = {
    /**
     * Create a new order
     */
    createOrder: async (orderData: any, customId?: string) => {
        try {
            const data = {
                ...orderData,
                createdAt: Date.now(),
                status: "pending",
                archived: false
            };
            
            if (customId) {
                await FirebaseService.update(`orders/${customId}`, data);
                return customId;
            } else {
                return await FirebaseService.push("orders", data);
            }
        } catch (error) {
            console.error("Order creation failed:", error);
            throw error;
        }
    },

    /**
     * Update order status
     */
    updateStatus: async (id: string, status: string) => {
        try {
            await FirebaseService.update(`orders/${id}`, { status });
            return true;
        } catch (error) {
            console.error("Status update failed:", error);
            throw error;
        }
    },

    /**
     * Toggle order archiving (soft delete)
     */
    toggleArchive: async (id: string, archived: boolean) => {
        try {
            await FirebaseService.update(`orders/${id}`, { archived });
            return true;
        } catch (error) {
            console.error("Archiving failed:", error);
            throw error;
        }
    },

    /**
     * Permanently delete an order
     */
    deleteOrder: async (id: string) => {
        try {
            await FirebaseService.remove(`orders/${id}`);
            return true;
        } catch (error) {
            console.error("Deletion failed:", error);
            throw error;
        }
    },

    /**
     * Get all orders with a limit
     */
    listenToOrders: (limit: number, callback: (orders: any[]) => void) => {
        return FirebaseService.listenQuery("orders", limit, (data) => {
            const ordersArray = Object.entries(data || {}).map(([id, val]: [string, any]) => ({
                id,
                ...val
            })).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
            callback(ordersArray);
        });
    }
};
