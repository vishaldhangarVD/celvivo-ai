
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * @fileOverview Subscription Creator for Starter and Pro plans.
 */

export async function POST(req: Request) {
  try {
    const { planType } = await req.json();
    
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    const starter_id = process.env.RAZORPAY_STARTER_PLAN_ID; // ₹299
    const pro_id = process.env.RAZORPAY_PRO_PLAN_ID; // ₹599

    if (!key_id || !key_secret) return NextResponse.json({ error: "Config missing" }, { status: 500 });

    const plan_id = planType === 'pro' ? pro_id : starter_id;

    if (!plan_id) return NextResponse.json({ error: "Plan ID not configured" }, { status: 500 });

    const razorpay = new Razorpay({ key_id, key_secret });

    const subscription = await razorpay.subscriptions.create({
      plan_id: plan_id,
      customer_notify: 1,
      total_count: 12,
      notes: { planType }
    });

    return NextResponse.json({ 
      subscriptionId: subscription.id,
      keyId: key_id
    });

  } catch (error: any) {
    console.error('[Razorpay Sub Error]:', error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
