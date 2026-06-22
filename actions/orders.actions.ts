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

export const createOrders = async ({
 product,
  customer_name,
  customer_address,
  customer_whatsapp,
  delivery_method,
  quantity
}: {
    product: number,
    customer_name: string,
    customer_address: string,
    customer_whatsapp: string,
    delivery_method: string,
    quantity: number
}) => {
    try {
        const response = await axios.post(`${baseUrl}/orders/create/`, {
             product,
  customer_name,
  customer_address,
  customer_whatsapp,
  delivery_method,
  quantity
        });

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