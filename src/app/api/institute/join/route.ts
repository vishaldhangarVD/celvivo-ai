import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const decoded = await adminAuth.verifyIdToken(token);

    const { code } = await req.json();
    const clean = String(code || '').trim().toUpperCase();
    if (!clean) return NextResponse.json({ error: 'Code required' }, { status: 400 });

    const snap = await adminDb.collection('institutes')
      .where('code', '==', clean)
      .where('active', '==', true)
      .limit(1)
      .get();
    if (snap.empty) return NextResponse.json({ error: 'Invalid institute code' }, { status: 404 });

    const inst = snap.docs[0];
    const { name, studentLimit } = inst.data();

    if (studentLimit) {
      const c = await adminDb.collection('users').where('instituteId', '==', inst.id).count().get();
      if (c.data().count >= studentLimit) {
        return NextResponse.json({ error: 'This institute has reached its student limit' }, { status: 403 });
      }
    }

    const userRef = adminDb.collection('users').doc(decoded.uid);
    const existing = (await userRef.get()).data();
    if (existing?.instituteId && existing.instituteId !== inst.id) {
      return NextResponse.json({ error: 'Already linked to another institute' }, { status: 409 });
    }

    await userRef.set({
      instituteId: inst.id,
      instituteName: name,
      role: existing?.role ?? 'student',
      joinedInstituteAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ ok: true, instituteName: name });
  } catch (e) {
    console.error('[institute/join]', e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
