import { Client, Storage } from "appwrite";
import axios from "axios";
import type { FlutterwaveBank } from "@/types/api";

interface FlutterwaveBanksResponse {
    status: string;
    message: string;
    data: FlutterwaveBank[];
}

let _storage: Storage | null = null;

export function getStorage(): Storage {
    if (_storage) return _storage;

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_BASE_URI;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    if (!endpoint || !project) {
        throw new Error(
            "Appwrite is not configured. Set NEXT_PUBLIC_APPWRITE_BASE_URI and NEXT_PUBLIC_APPWRITE_PROJECT_ID in .env.local."
        );
    }

    _storage = new Storage(new Client().setEndpoint(endpoint).setProject(project));
    return _storage;
}

export const getAllbanks = async (): Promise<FlutterwaveBanksResponse> => {
    try {
        const response = await axios.get<FlutterwaveBanksResponse>(`https://api.flutterwave.com/banks?country=NG`, {
            headers: {
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY}`
            }
        });

        return response.data
    } catch {
        return { status: "error", message: "Could not load banks.", data: [] }
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
