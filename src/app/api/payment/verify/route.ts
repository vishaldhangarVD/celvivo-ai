import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const PACK_CREDITS: Record<string, Record<string, number>> = {
  aptitude_1: { aptitude: 1 },
  coding_1: { coding: 1 },
  interview_1: { interview: 1 },
  bundle_1: { aptitude: 1, coding: 1, interview: 1, specialHR: 1, resumeBuilder: 2 },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_order_id,
      razorpay_subscription_id,
      userId,
      packId,
      planType,
    } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ verified: false, error: 'Secret missing' }, { status: 500 });
    }

    if (!userId) {
      return NextResponse.json({ verified: false, error: 'userId is required' }, { status: 400 });
    }

    let expectedSignature = '';

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

    if (expectedSignature !== razorpay_signature) {
      console.warn(`[Razorpay] Signature mismatch for ${type}`);
      return NextResponse.json({ verified: false }, { status: 400 });
    }

    const db = getAdminDb();
    const paymentRef = db.collection('payments').doc(razorpay_payment_id);
    const userRef = db.collection('users').doc(userId);

    const result = await db.runTransaction(async (tx) => {
      const paymentSnap = await tx.get(paymentRef);
      if (paymentSnap.exists) {
        return { alreadyProcessed: true };
      }

      if (type === 'order') {
        const grants = PACK_CREDITS[packId];
        if (!grants) {
          throw new Error(`Unknown packId: ${packId}`);
        }

        const updates: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
        for (const [key, amount] of Object.entries(grants)) {
          updates[`credits.${key}`] = FieldValue.increment(amount);
        }
        tx.set(userRef, updates, { merge: true });
      } else {
        if (planType !== 'starter' && planType !== 'pro') {
          throw new Error(`Unknown planType: ${planType}`);
        }
        const nextReset = new Date();
        nextReset.setMonth(nextReset.getMonth() + 1);

        tx.set(
          userRef,
          {
            subscription: {
              plan: planType,
              status: 'active',
              usage: { aptitude: 0, coding: 0, interview: 0 },
              nextResetDate: nextReset,
              razorpaySubscriptionId: razorpay_subscription_id,
            },
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }

      tx.set(paymentRef, {
        userId,
        type,
        packId: packId || null,
        planType: planType || null,
        razorpay_order_id: razorpay_order_id || null,
        razorpay_subscription_id: razorpay_subscription_id || null,
        processedAt: FieldValue.serverTimestamp(),
      });

      return { alreadyProcessed: false };
    });

    console.log(
      `[Razorpay] Verified ${type} payment ${razorpay_payment_id} for user ${userId}. Already processed? ${result.alreadyProcessed}`
    );

    return NextResponse.json({ verified: true, alreadyProcessed: result.alreadyProcessed });
  } catch (error: any) {
    console.error('[Razorpay Verification API] Fatal Error:', error);
    return NextResponse.json({ verified: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
}