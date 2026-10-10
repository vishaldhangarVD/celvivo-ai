import { NextRequest } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

// Founder asel tar tyacha uid parat, nahitar null
export async function requireFounder(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const snap = await getAdminDb().collection('users').doc(decoded.uid).get();
    return snap.data()?.role === 'founder' ? decoded.uid : null;
  } catch {
    return null;
  }
}
