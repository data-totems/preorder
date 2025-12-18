import axios from 'axios'
export const baseUrl = process.env.NEXT_PUBLIC_BASE_URI;


export const registeUser = async ({email,  password, password_confirm}: {email: string, password: string, password_confirm: string}) => {
    try {
        const response = await axios.post(`${baseUrl}/accounts/auth/register/`, {
            email: email,
            password,
            confirm_password: password_confirm
        });

        return response;
    } catch (error: any) {
        throw error.response.data;
    }
}

export const loginUser = async ({email,  password}: {email: string, password: string}) => {
    try {
        const response = await axios.post(`${baseUrl}/accounts/auth/login`, {
            email: email,
            password,
        });

        return response;
    } catch (error) {
        throw error;
    }
}