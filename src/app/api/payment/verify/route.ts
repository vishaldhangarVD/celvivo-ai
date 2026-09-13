
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * @fileOverview Unified Razorpay Verifier for Orders and Subscriptions.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      type, // 'order' or 'subscription'
      razorpay_payment_id, 
      razorpay_signature,
      razorpay_order_id,
      razorpay_subscription_id 
    } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    let expectedSignature = "";

    if (type === 'subscription') {
      expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_payment_id + '|' + razorpay_subscription_id)
        .digest('hex');
    } else {
      expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');
    }

    if (expectedSignature === razorpay_signature) {
      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json({ verified: false }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ verified: false }, { status: 500 });
  }
}
