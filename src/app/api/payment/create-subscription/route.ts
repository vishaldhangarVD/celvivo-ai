
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { planType, userId } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    const starter_id = process.env.RAZORPAY_STARTER_PLAN_ID;
    const pro_id = process.env.RAZORPAY_PRO_PLAN_ID;

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: 'Razorpay API keys are missing' },
        { status: 500 }
      );
    }

    if (planType !== 'starter' && planType !== 'pro') {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    const plan_id = planType === 'pro' ? pro_id : starter_id;

    if (!plan_id) {
      return NextResponse.json(
        { error: `${planType} plan ID is missing` },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const subscription = await razorpay.subscriptions.create({
      plan_id,
      total_count: 12,
      quantity: 1,
      customer_notify: true,
      notes: {
        planType,
        userId,
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: key_id,
    });

  } catch (error: any) {
    console.error('RAZORPAY SUBSCRIPTION ERROR:', error);

    return NextResponse.json(
      {
        error: 'Failed to create subscription',
        details:
          error?.error?.description ||
          error?.description ||
          error?.message ||
          'Unknown Razorpay error',
      },
      { status: 500 }
    );
  }
}
