
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * @fileOverview Unified Razorpay Signature Verifier.
 * Supports both Order and Subscription signature protocols.
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

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ verified: false, error: "Secret missing" }, { status: 500 });
    }

    let expectedSignature = "";

    if (type === 'subscription') {
      // Subscription signature format: payment_id + "|" + subscription_id
      expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_payment_id + '|' + razorpay_subscription_id)
        .digest('hex');
    } else {
      // Order signature format: order_id + "|" + payment_id
      expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');
    }

    if (expectedSignature === razorpay_signature) {
      console.log(`[Razorpay] Signature verified successfully for ${type}: ${razorpay_payment_id}`);
      return NextResponse.json({ verified: true });
    } else {
      console.warn(`[Razorpay] Signature mismatch for ${type}`);
      return NextResponse.json({ verified: false }, { status: 400 });
    }

  } catch (error: any) {
    console.error('[Razorpay Verification API] Fatal Error:', error);
    return NextResponse.json({ verified: false }, { status: 500 });
  }
}
