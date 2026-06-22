import axios from "axios";
import { baseUrl } from "./auth.actions";

const authHeader = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("buzzToken") : null;
    return token ? { Authorization: `token ${token}` } : {};
};

export const getNotifications = async () => {
    try {
        const response = await axios.get(`${baseUrl}/notifications/notifications/`, {
            headers: authHeader(),
        });
        return response;
    } catch (error: any) {
        throw error?.response?.data ?? { message: error?.message ?? "Request failed" };
    }
};

export const getUnreadCount = async (): Promise<number> => {
    try {
        const response = await axios.get(`${baseUrl}/notifications/notifications/unread-count/`, {
            headers: authHeader(),
        });
        return Number(response.data?.unread_count ?? 0);
    } catch {
        return 0;
    }
};

export const markNotificationRead = async (id: number) => {
    try {
        const response = await axios.patch(
            `${baseUrl}/notifications/notifications/${id}/read/`,
            {},
            { headers: authHeader() },
        );
        return response;
    } catch (error: any) {
        throw error?.response?.data ?? { message: error?.message ?? "Request failed" };
    }
};

export const markAllNotificationsRead = async () => {
    try {
        const response = await axios.patch(
            `${baseUrl}/notifications/notifications/read-all/`,
            {},
            { headers: authHeader() },
        );
        return response;
    } catch (error: any) {
        throw error?.response?.data ?? { message: error?.message ?? "Request failed" };
    }
};
