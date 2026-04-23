import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const klaviyoKey = process.env.KLAVIYO_API_KEY
    const klaviyoListId = process.env.KLAVIYO_LIST_ID

    if (!klaviyoKey || !klaviyoListId) {
      throw new Error("Missing Klaviyo environment variables")
    }

    const response = await fetch(
      "https://a.klaviyo.com/api/profile-subscriptions-bulk-create-jobs/",
      {
        method: "POST",
        headers: {
          Authorization: `Klaviyo-API-Key ${klaviyoKey}`,
          "Content-Type": "application/json",
          revision: "2023-12-15",
        },
        body: JSON.stringify({
          data: {
            type: "profile-subscription-bulk-create-job",
            attributes: {
              list_id: klaviyoListId,
              subscriptions: [
                {
                  channels: { email: ["MARKETING"] },
                  email,
                },
              ],
            },
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData?.errors?.[0]?.detail ?? "Subscription failed" },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
