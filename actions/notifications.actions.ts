import axios from "axios";
import { baseUrl } from "./auth.actions";

export const getNotifications = async () => {
    const token = localStorage.getItem("buzzToken")
    try {
        const response =await axios.get(`${baseUrl}/notifications/notifications/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response;
    } catch (error) {
        throw error;
    }
}