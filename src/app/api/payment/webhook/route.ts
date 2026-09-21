import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * @fileOverview Razorpay Webhook Handler.
 * Handles subscription lifecycle events (monthly auto-charge, cancellation,
 * completion) that happen outside the client's browser session.
 * Configure this URL in Razorpay Dashboard -> Settings -> Webhooks:
 *   https://<your-domain>/api/payment/webhook
 * Events to subscribe: subscription.charged, subscription.cancelled, subscription.completed
 */

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Webhook] RAZORPAY_WEBHOOK_SECRET is not configured.');
      return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('[Webhook] Signature mismatch — rejecting request.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const db = getAdminDb();

    console.log(`[Webhook] Received verified event: ${event}`);

    // Idempotency guard: Razorpay may retry the same webhook delivery.
    const eventId = req.headers.get('x-razorpay-event-id') || payload?.payload?.payment?.entity?.id || `${event}_${Date.now()}`;
    const eventRef = db.collection('webhook_events').doc(String(eventId));

    const alreadyHandled = await db.runTransaction(async (tx) => {
      const snap = await tx.get(eventRef);
      if (snap.exists) return true;
      tx.set(eventRef, { event, receivedAt: FieldValue.serverTimestamp() });
      return false;
    });

    if (alreadyHandled) {
      console.log(`[Webhook] Event ${eventId} already processed, skipping.`);
      return NextResponse.json({ status: 'already_processed' });
    }

    switch (event) {
      case 'subscription.charged': {
        const subscriptionEntity = payload.payload?.subscription?.entity;
        const razorpaySubscriptionId = subscriptionEntity?.id;
        const userId = subscriptionEntity?.notes?.userId;

        if (!userId) {
          console.warn('[Webhook] subscription.charged: no userId in notes, cannot process.');
          break;
        }

        const nextReset = new Date();
        nextReset.setMonth(nextReset.getMonth() + 1);

        const userRef = db.collection('users').doc(userId);
        await userRef.set(
          {
            subscription: {
              status: 'active',
              razorpaySubscriptionId,
              usage: { aptitude: 0, coding: 0, interview: 0 },
              nextResetDate: nextReset,
            },
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        console.log(`[Webhook] Monthly renewal processed for user ${userId}, usage reset.`);
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.completed': {
        const subscriptionEntity = payload.payload?.subscription?.entity;
        const userId = subscriptionEntity?.notes?.userId;

        if (!userId) {
          console.warn(`[Webhook] ${event}: no userId in notes, cannot process.`);
          break;
        }

        const userRef = db.collection('users').doc(userId);
        await userRef.set(
          {
            subscription: {
              status: event === 'subscription.cancelled' ? 'cancelled' : 'completed',
            },
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        console.log(`[Webhook] Subscription ${event} processed for user ${userId}.`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event}, ignoring.`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('[Webhook] Fatal error:', error);
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
