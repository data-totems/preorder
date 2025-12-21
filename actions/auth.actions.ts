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
    try {
        const response = await axios.patch(`${baseUrl}/accounts/setup/`, {
  "PersonalDetails": {
    "full_name": fullName,
    "username": username,
    "phone_number": phone_number,
    "address": address,
    "display_picture": display_picture
  },
  "BusinessDetails": {
    "business_name": business_name,
    "business_description": business_description,
    "business_email": business_email
  },
  "BankDetail": {
    "bank_name": bank_name,
    "account_number": account_number, 
  },
  "WhatsApp": {
    "whatsapp_number": phone_number
  }
}, {
    headers: {
        "Authorization": `token ${token}`
    }
}
);

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

        console.log(response)

        return response;
    } catch (error) {
        throw error;
    }
}