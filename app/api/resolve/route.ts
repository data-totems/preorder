import { NextResponse } from "next/server"
import axios from "axios"

export async function POST(req: Request) {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json(
      { message: "Bank verification is not configured. Set FLUTTERWAVE_SECRET_KEY on the server." },
      { status: 500 }
    )
  }

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
          Authorization: `Bearer ${secretKey}`,
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
