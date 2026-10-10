import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const code = (req.nextUrl.searchParams.get('code') || '').trim().toUpperCase();
    if (!code || code.length > 20) return NextResponse.json({ valid: false }, { status: 400 });

    const snap = await getAdminDb().collection('institutes')
      .where('code', '==', code)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (snap.empty) return NextResponse.json({ valid: false }, { status: 404 });
    return NextResponse.json({ valid: true, name: snap.docs[0].data().name });
  } catch (e) {
    console.error('[institute/validate]', e);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
