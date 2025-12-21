import { Client, Storage,} from "appwrite";
import axios from "axios";

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_BASE_URI!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const storage = new Storage(client);





export const getAllbanks = async () => {
    try {
        const response = await axios.get(`https://api.flutterwave.com/banks?country=NG`, {
            headers: {
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY}`
            }
        });

        return response.data
    } catch (error: any) {
        console.log(error.data)
    }
}


export const getAccountDetails = async ({
  bankCode,
  accountNumber,
}: {
  bankCode: string
  accountNumber: string
}) => {
  const res = await fetch("/api/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bankCode, accountNumber }),
  })

  return res.json()
}
