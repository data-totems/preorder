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