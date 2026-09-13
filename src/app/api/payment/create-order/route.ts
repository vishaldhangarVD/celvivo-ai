
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * @fileOverview One-Time Order Creator for Credit Packs.
 * Amounts are in INR and converted to Paise for Razorpay.
 */

const PACKS = {
  'aptitude_1': { amount: 15 },
  'coding_1': { amount: 20 },
  'interview_1': { amount: 10 },
  'bundle_1': { amount: 49 }
};

export async function POST(req: Request) {
  try {
    const { packId } = await req.json();
    const pack = PACKS[packId as keyof typeof PACKS];

    if (!pack) {
      return NextResponse.json({ error: "Invalid product identifier" }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error("[Razorpay] Missing API credentials in environment.");
      return NextResponse.json({ error: "Payment gateway configuration error" }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    const order = await razorpay.orders.create({
      amount: pack.amount * 100, // INR to Paise conversion
      currency: "INR",
      receipt: `nvr_ord_${Date.now()}`,
      notes: { 
        packId,
        platform: "Nexvoro AI"
      }
    });

    return NextResponse.json({ 
      orderId: order.id,
      keyId: key_id
    });

  } catch (error: any) {
    console.error('[Razorpay Order API] Error:', error);
    return NextResponse.json({ error: "Failed to initialize payment order" }, { status: 500 });
  }
}
