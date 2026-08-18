import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * @fileOverview Razorpay Cryptographic Signature Verifier.
 * Verifies that the payment response truly came from Razorpay.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      razorpay_payment_id, 
      razorpay_subscription_id, 
      razorpay_signature 
    } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json({ error: "Server configuration missing." }, { status: 500 });
    }

    // Razorpay Signature Verification for Subscriptions
    // Pattern: payment_id + "|" + subscription_id
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_payment_id + '|' + razorpay_subscription_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json({ verified: false, error: "Invalid signature" }, { status: 400 });
    }

  } catch (error: any) {
    console.error('[Razorpay Verification Error]:', error);
    return NextResponse.json({ verified: false, error: "Internal verification fault" }, { status: 500 });
  }
}
