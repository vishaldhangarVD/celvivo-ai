import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * @fileOverview Secure Razorpay Subscription Creator.
 * Generates a subscription ID for either Pro or Premium plans.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planType } = body;

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    const pro_plan_id = process.env.RAZORPAY_PRO_PLAN_ID;
    const premium_plan_id = process.env.RAZORPAY_PREMIUM_PLAN_ID;

    if (!key_id || !key_secret) {
      return NextResponse.json({ error: "Razorpay credentials missing on server." }, { status: 500 });
    }

    const plan_id = planType === 'premium' ? premium_plan_id : pro_plan_id;

    if (!plan_id) {
      return NextResponse.json({ error: `Plan ID for ${planType} not configured.` }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const subscription = await razorpay.subscriptions.create({
      plan_id: plan_id,
      customer_notify: 1,
      total_count: 12, // For a yearly view, though normally indefinite
      addons: [],
      notes: {
        plan: planType
      }
    });

    return NextResponse.json({ 
      subscriptionId: subscription.id,
      keyId: key_id
    });

  } catch (error: any) {
    console.error('[Razorpay Create Subscription Error]:', error);
    return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 });
  }
}
