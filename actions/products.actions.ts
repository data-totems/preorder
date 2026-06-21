import axios from "axios";
import { baseUrl } from "./auth.actions";

export const createProduct = async (data: FormData | { name: string; image: File; description: string; price: string; }) => {
    const token = localStorage.getItem('buzzToken');
    
    let formData: FormData;
    
    if (data instanceof FormData) {
        formData = data;
    } else {
        // Convert object to FormData for backward compatibility
        formData = new FormData();
        formData.append("name", data.name);
        formData.append("price", data.price);
        formData.append("description", data.description);
        formData.append("image", data.image);
    }

    try {
        const response = await axios.post(
            `${baseUrl}/products/create/`,
            formData,
            {
                headers: {
                    "Authorization": `token ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            }
        );

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
        throw error?.response?.data ?? { message: error?.message ?? "Request failed" };
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
        throw error?.response?.data ?? { message: error?.message ?? "Request failed" };
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
        throw error?.response?.data ?? { message: error?.message ?? "Request failed" };
     }
}


export const togglearchiveProduct = async (id: number) => {
      const token = localStorage.getItem('buzzToken');
     try {
        const response = await axios.patch(`${baseUrl}/products/${id}/toggle-archive/`, {},
            {
            headers: {
                "Authorization": `token ${token}`
            }
        } );

        return response
     } catch (error: any) {
        throw error?.response?.data ?? { message: error?.message ?? "Request failed" };
     }
}

export const listDispatch = async () => {
    const token = localStorage.getItem('buzzToken')
    try {
        const response = await axios.get(`${baseUrl}/dispatch/list_update/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response;
    } catch (error) {
        throw error;
    }
}

export const createDispatch = async ({
    name, phone_number, address, next_of_kin, utility_bill, bank_name, account_number, account_name, vehicle_type, plate_number, location_area, peferred_transport_area, is_available
}: {
    name: string, phone_number: string, is_available: boolean, peferred_transport_area: string, location_area: string, address: string, 
    account_number: string, account_name: string, plate_number: string, utility_bill: string, next_of_kin: string, vehicle_type: string, bank_name: string
}) => {
    const token = localStorage.getItem('buzzToken');

    try {
        const response = await axios.post(`${baseUrl}/dispatch/list_update/`, {
            name, phone_number, address, next_of_kin, utility_bill, bank_name, account_number, account_name, vehicle_type, plate_number, location_area, peferred_transport_area, is_available
        }, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response;
    } catch (error: any) {
        throw error?.response?.data ?? { message: error?.message ?? "Request failed" };
    }
}

export const getAllProducts = async () => {
     const token = localStorage.getItem('buzzToken')
    try {
        const response = await axios.get(`${baseUrl}/products/all_products/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response;
    } catch (error) {
        throw error;
    }
}



export const updateProductImage = async ({ 
  productId, 
  formData 
}: { 
  productId: string, 
  formData: FormData 
}) => {
  const token = localStorage.getItem('buzzToken');
  try {
    const response = await axios.patch(
      `${baseUrl}/products/${productId}/update/`,
      formData,
      {
        headers: {
          "Authorization": `token ${token}`,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    return response;
  } catch (error) {
    throw error;
  }
}


export const getSingleProduct = async (id: number) => {
    const token = localStorage.getItem('buzzToken');
    try {
        const response = await axios.get(`${baseUrl}/products/${id}/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response
    } catch (error: any) {
        throw error?.response?.data ?? { message: error?.message ?? "Request failed" }
    }
}

export const getStoreDetails = async (slug: string) => {
    const token = localStorage.getItem('buzzToken');
    // Public store endpoint is mounted at the backend root, not under /api/.
    const rootUrl = baseUrl?.replace(/\/api\/?$/, '');
    try {
        const response = await axios.get(`${rootUrl}/store/${slug}/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response
    } catch (error: any) {
        throw error?.response?.data ?? { message: error?.message ?? "Request failed" }
    }
}

export const updateProductDetails = async ({ id,description, price, name }: {
    id: number,
    name: string,
    price: string,
    description: string

}) => {
    const token = localStorage.getItem('buzzToken')
    try {
        const response = await axios.patch(`${baseUrl}/products/${id}/update/`, {
            name, price, description,
        }, {
              headers: {
                "Authorization": `token ${token}`,
                "Content-Type": "multipart/form-data",
            }
        });

        return response;
    } catch (error: any) {
        throw error?.response?.data ?? { message: error?.message ?? "Request failed" }
    }
}