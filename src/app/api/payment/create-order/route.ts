
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * @fileOverview One-Time Order Creator for Credit Packs.
 */

const PACKS = {
  'aptitude_1': { amount: 15, credits: { aptitude: 1 } },
  'coding_1': { amount: 20, credits: { coding: 1 } },
  'interview_1': { amount: 10, credits: { interview: 1 } },
  'bundle_1': { amount: 49, credits: { aptitude: 1, coding: 1, interview: 1 } }
};

export async function POST(req: Request) {
  try {
    const { packId } = await req.json();
    const pack = PACKS[packId as keyof typeof PACKS];

    if (!pack) return NextResponse.json({ error: "Invalid pack ID" }, { status: 400 });

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: pack.amount * 100, // in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { packId }
    });

    return NextResponse.json({ 
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error: any) {
    console.error('[Razorpay Order Error]:', error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
