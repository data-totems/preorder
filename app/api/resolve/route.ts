import { NextResponse } from "next/server"
import axios from "axios"

export async function POST(req: Request) {
  try {
    const { bankCode, accountNumber } = await req.json()

    const response = await axios.post(
      "https://api.flutterwave.com/v3/accounts/resolve",
      {
        account_bank: bankCode,
        account_number: accountNumber,
      },
      {
        headers: {
          Authorization: `Bearer FLWSECK-cd6a3ae6cfbb31fa73e8f008a8843561-19b3b17db3cvt-X`,
          "Content-Type": "application/json",
        },
      }
    )

    return NextResponse.json(response.data)
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.response?.data ?? "Failed to resolve account" },
      { status: 400 }
    )
  }
}
