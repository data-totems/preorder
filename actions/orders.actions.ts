import axios from "axios";
import { baseUrl } from "./auth.actions";

export const getIncomingOrders = async () => {
      const token = localStorage.getItem("buzzToken")
    try {
        const response = await axios.get(`${baseUrl}/orders/accepted/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response;
    } catch (error) {
        throw error;
    }
}

export const getAcceptedOrders = async () => {
    const token = localStorage.getItem("buzzToken")
    try {
        const response = await axios.get(`${baseUrl}/orders/accepted/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response;
    } catch (error) {
        throw error;
    }
}

export const getShippedOrder = async () => {
     const token = localStorage.getItem("buzzToken")
    try {
        const response = await axios.get(`${baseUrl}/orders/shipped/`, {
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
        console.log(error.response)
        throw error.response.data;
    }
}