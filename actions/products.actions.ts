import axios from "axios";
import { baseUrl } from "./auth.actions";

export const createProduct = async ({ name, price, description, image, }: {name: string, image: string, description: string, price: string}) => {
    const token = localStorage.getItem('buzzToken')

    try {
        const response = await axios.post(`${baseUrl}/products/create/`, {
        name, price, description, image,
        }, {
            headers: {
                "Authorization": `token ${token}`
            }
        });


        return response;
    } catch (error) {
        throw error;
    }
};


export const getuserProducts = async () => {
     const token = localStorage.getItem('buzzToken')

     try {
        const response = await axios.get(`${baseUrl}/products/list/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response
     } catch (error: any) {
        throw error.response.data;
     }
}


export const getProductbyId = async (id: number) => {
      const token = localStorage.getItem('buzzToken')

     try {
        const response = await axios.get(`${baseUrl}/products/${id}/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response
     } catch (error: any) {
        throw error.response.data;
     }
}


export const deleteProduct = async (id: number) => {
      const token = localStorage.getItem('buzzToken')

     try {
        const response = await axios.delete(`${baseUrl}/products/${id}/delete/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response
     } catch (error: any) {
        throw error.response.data;
     }
}


export const togglearchiveProduct = async (id: number) => {
      const token = localStorage.getItem('buzzToken')

     try {
        const response = await axios.patch(`${baseUrl}/products/${id}/toggle-archive/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response
     } catch (error: any) {
        throw error.response.data;
     }
}