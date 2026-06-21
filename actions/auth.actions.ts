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
        throw error?.response?.data ?? { message: error?.message ?? "Registration failed" };
    }
}

export const loginUser = async ({email,  password}: {email: string, password: string}) => {
    try {
        const response = await axios.post(`${baseUrl}/accounts/auth/login/`, {
            email: email,
            password,
        });

        return response;
    } catch (error: any) {
        throw error
    }
};


export const setupAccount = async ({fullName, username, phone_number, address, display_picture, business_description, business_email, business_name, bank_name, account_number}: {
    fullName: string, username: string, phone_number: string, address: string, display_picture: string, business_description: string, business_email: string, business_name: string, bank_name: string, account_number: string
}) => {
    const token = localStorage.getItem("buzzToken")
    // Backend's /setup/ view uses MultiPartParser/FormParser — application/json
    // is rejected with a 415. Build FormData even though no file is attached
    // here (display_picture is currently a URL string from Appwrite, which the
    // backend will silently ignore since it expects a File).
    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("username", username);
    formData.append("phone_number", phone_number);
    formData.append("address", address);
    if (display_picture) formData.append("display_picture", display_picture);
    formData.append("business_name", business_name);
    formData.append("business_description", business_description);
    formData.append("business_email", business_email);
    formData.append("bank_name", bank_name);
    formData.append("account_number", account_number);
    formData.append("whatsapp_number", phone_number);

    try {
        const response = await axios.patch(`${baseUrl}/accounts/setup/`, formData, {
            headers: {
                "Authorization": `token ${token}`,
                "Content-Type": "multipart/form-data"
            }
        });

        return response;
    } catch (error) {
        throw error
    }
}


export const getAccountProfile = async () => {
    const token = localStorage.getItem("buzzToken")
    try {
        const response = await axios.get(`${baseUrl}/accounts/profile/`, {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response;
    } catch (error) {
        throw error;
    }
}

export const updateProfileDetails = async ({
    full_name,
    display_picture,
    username,
    phone_number,
    address
}: {
    full_name?: string,
    display_picture?: string,
    username?: string,
    phone_number?: string,
    address?: string
}) => {
    const token = localStorage.getItem("buzzToken")

      try {
        const response = await axios.patch(`${baseUrl}/accounts/profile/update/`, {
             full_name,
    display_picture,
    username,
    phone_number,
    address
        },
             {
            headers: {
                "Authorization": `token ${token}`
            }
        });

        return response;
    } catch (error) {
        throw error;
    }
}