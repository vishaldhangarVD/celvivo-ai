import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireFounder } from '@/lib/require-founder';

export const runtime = 'nodejs';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const randomCode = () =>
  Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');

export async function GET(req: NextRequest) {
  try {
    if (!(await requireFounder(req))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const db = getAdminDb();
    const snap = await db.collection('institutes').get();

    const institutes = await Promise.all(
      snap.docs.map(async (d) => {
        const data = d.data();
        const [cnt, tpoSnap] = await Promise.all([
          db.collection('users').where('instituteId', '==', d.id).where('role', '==', 'student').count().get(),
          db.collection('users').where('instituteId', '==', d.id).where('role', '==', 'tpo')
            .select('displayName', 'email').get(),
        ]);
        return {
          id: d.id,
          name: data.name || '',
          code: data.code || '',
          studentLimit: data.studentLimit ?? null,
          active: data.active !== false,
          createdAt: data.createdAt?.toMillis?.() ?? 0,
          students: cnt.data().count,
          tpos: tpoSnap.docs.map((t) => ({
            uid: t.id,
            name: t.data().displayName || '',
            email: t.data().email || '',
          })),
        };
      })
    );

    institutes.sort((a, b) => b.createdAt - a.createdAt);
    return NextResponse.json({ institutes });
  } catch (e) {
    console.error('[founder/institutes GET]', e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const founderUid = await requireFounder(req);
    if (!founderUid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { name, studentLimit, code } = await req.json();
    const cleanName = String(name || '').trim();
    if (!cleanName) return NextResponse.json({ error: 'Institute name is required' }, { status: 400 });

    const db = getAdminDb();
    let finalCode = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const custom = !!finalCode;

    for (let i = 0; i < 6; i++) {
      if (!finalCode) finalCode = randomCode();
      const dup = await db.collection('institutes').where('code', '==', finalCode).limit(1).get();
      if (dup.empty) break;
      if (custom) return NextResponse.json({ error: 'This code is already used' }, { status: 409 });
      finalCode = '';
    }
    if (!finalCode) return NextResponse.json({ error: 'Could not generate a code, try again' }, { status: 500 });

    const limit = Number(studentLimit);
    await db.collection('institutes').add({
      name: cleanName,
      code: finalCode,
      active: true,
      studentLimit: limit > 0 ? limit : null,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: founderUid,
    });

    return NextResponse.json({ ok: true, code: finalCode });
  } catch (e) {
    console.error('[founder/institutes POST]', e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
