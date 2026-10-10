import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { requireFounder } from '@/lib/require-founder';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if (!(await requireFounder(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { instituteId, email } = await req.json();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!instituteId || !cleanEmail) {
      return NextResponse.json({ error: 'Institute and email are required' }, { status: 400 });
    }

    const db = getAdminDb();
    const inst = await db.collection('institutes').doc(String(instituteId)).get();
    if (!inst.exists) return NextResponse.json({ error: 'Institute not found' }, { status: 404 });

    let uid: string;
    try {
      uid = (await getAdminAuth().getUserByEmail(cleanEmail)).uid;
    } catch {
      return NextResponse.json(
        { error: 'No account with this email. Ask the TPO to sign up on Celvivo first.' },
        { status: 404 }
      );
    }

    const ref = db.collection('users').doc(uid);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    if (snap.data()?.role === 'founder') {
      return NextResponse.json({ error: 'This account is a founder' }, { status: 400 });
    }

    await ref.set(
      {
        role: 'tpo',
        instituteId: inst.id,
        instituteName: inst.data()?.name || '',
        joinedInstituteAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, name: snap.data()?.displayName || cleanEmail });
  } catch (e) {
    console.error('[founder/assign-tpo]', e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
