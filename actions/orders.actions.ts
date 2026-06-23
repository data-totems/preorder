import axios, { type AxiosResponse } from "axios";
import { baseUrl } from "./auth.actions";
import type { Order, OrdersGroupResponse } from "@/types/api";

export const getIncomingOrders = async (): Promise<AxiosResponse<OrdersGroupResponse>> => {
      const token = localStorage.getItem("buzzToken")
    try {
        const response = await axios.get<OrdersGroupResponse>(`${baseUrl}/orders/incoming/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response;
    } catch (error) {
        throw error;
    }
}

export const getAcceptedOrders = async (): Promise<AxiosResponse<OrdersGroupResponse>> => {
    const token = localStorage.getItem("buzzToken")
    try {
        const response = await axios.get<OrdersGroupResponse>(`${baseUrl}/orders/accepted/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response;
    } catch (error) {
        throw error;
    }
}

export const getShippedOrder = async (): Promise<AxiosResponse<OrdersGroupResponse>> => {
     const token = localStorage.getItem("buzzToken")
    try {
        const response = await axios.get<OrdersGroupResponse>(`${baseUrl}/orders/shipped/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response;
    } catch (error) {
        throw error;
    }
}

export const getDeclinedOrders = async (): Promise<AxiosResponse<OrdersGroupResponse>> => {
    const token = localStorage.getItem("buzzToken")
    try {
        const response = await axios.get<OrdersGroupResponse>(`${baseUrl}/orders/declined/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response;
    } catch (error) {
        throw error;
    }
}

/**
 * Customer order create. Accepts either:
 *  - { items: [...], ... }  — multi-product cart (preferred)
 *  - { product, quantity, ... } — legacy single-product (kept for Buy now)
 */
export type CreateOrderArgs = {
    customer_name: string,
    customer_address: string,
    customer_whatsapp: string,
    delivery_method: string,
    payment_method?: "bank_transfer" | "pay_on_delivery",
} & (
    | { items: Array<{ product: number; quantity: number }>; product?: undefined; quantity?: undefined }
    | { product: number; quantity: number; items?: undefined }
);

export const createOrders = async (args: CreateOrderArgs) => {
    try {
        const response = await axios.post(`${baseUrl}/orders/create/`, args);
        return response;
    } catch (error: any) {
        throw error?.response?.data ?? { message: error?.message ?? "Failed to create order" };
    }
}

export const acceptOrder = async (orderId: number): Promise<AxiosResponse<Order>> => {
    const token = localStorage.getItem("buzzToken")
    try {
        const response = await axios.patch<Order>(`${baseUrl}/orders/${orderId}/accept/`, {}, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response;
    } catch (error) {
        throw error;
    }
}

export const declineOrder = async (orderId: number): Promise<AxiosResponse<Order>> => {
    const token = localStorage.getItem("buzzToken")
    try {
        const response = await axios.patch<Order>(`${baseUrl}/orders/${orderId}/decline/`, {}, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response;
    } catch (error) {
        throw error;
    }
}

export const shipOrder = async (
    orderId: number,
    dispatcherId?: number
): Promise<AxiosResponse<Order>> => {
    const token = localStorage.getItem("buzzToken")
    const body = dispatcherId !== undefined ? { dispatcher_id: dispatcherId } : {};
    try {
        const response = await axios.patch<Order>(
            `${baseUrl}/orders/${orderId}/ship/`,
            body,
            { headers: { "Authorization": `token ${token}` } }
        );

        return response;
    } catch (error) {
        throw error;
    }
}
// ---------------------------------------------------------------------------
// Payment-flow actions — manual bank-transfer + proof verification.
// ---------------------------------------------------------------------------

export const trackOrder = async (orderId: number) => {
    // Public — no auth needed. Customer hits this on the confirmation page
    // to render bank details + reference + status updates.
    try {
        const response = await axios.get(`${baseUrl}/orders/track/${orderId}/`);
        return response;
    } catch (error: any) {
        throw error?.response?.data ?? { message: error?.message ?? "Request failed" };
    }
}

export const uploadPaymentProof = async (orderId: number, file: File) => {
    const formData = new FormData();
    formData.append("payment_proof", file);
    try {
        const response = await axios.post(
            `${baseUrl}/orders/${orderId}/upload-proof/`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } },
        );
        return response;
    } catch (error: any) {
        throw error?.response?.data ?? { message: error?.message ?? "Request failed" };
    }
}

export const markOrderPaid = async (orderId: number) => {
    const token = localStorage.getItem("buzzToken")
    try {
        const response = await axios.patch(
            `${baseUrl}/orders/${orderId}/mark-paid/`,
            {},
            { headers: { "Authorization": `token ${token}` } },
        );
        return response;
    } catch (error: any) {
        throw error?.response?.data ?? { message: error?.message ?? "Request failed" };
    }
}

export const getAwaitingPaymentOrders = async () => {
    const token = localStorage.getItem("buzzToken")
    try {
        const response = await axios.get(
            `${baseUrl}/orders/awaiting-payment/`,
            { headers: { "Authorization": `token ${token}` } },
        );
        return response;
    } catch (error: any) {
        throw error?.response?.data ?? { message: error?.message ?? "Request failed" };
    }
}


export const exportOrders = async (statusFilter?: string): Promise<Blob> => {
    const token = localStorage.getItem("buzzToken");
    const params = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
    try {
        const response = await axios.get(`${baseUrl}/orders/export/${params}`, {
            headers: { "Authorization": `token ${token}` },
            responseType: "blob",
        });
        return response.data as Blob;
    } catch (error: any) {
        throw error?.response?.data ?? { message: error?.message ?? "Export failed" };
    }
};
