import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

const DAY = 24 * 60 * 60 * 1000;
const MASTERY = 70; // certificate milnyacha score (certificates page sarkhach)
const num = (v: any) => Number(v) || 0;

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminDb = getAdminDb();
    const decoded = await getAdminAuth().verifyIdToken(token);

    const callerSnap = await adminDb.collection('users').doc(decoded.uid).get();
    const caller = callerSnap.data();
    const role = caller?.role;

    let instituteId: string | undefined;
    if (role === 'tpo') {
      instituteId = caller?.instituteId;
    } else if (role === 'founder') {
      instituteId = req.nextUrl.searchParams.get('instituteId') || undefined;
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!instituteId) return NextResponse.json({ error: 'No institute linked' }, { status: 400 });

    const instSnap = await adminDb.collection('institutes').doc(instituteId).get();
    if (!instSnap.exists) return NextResponse.json({ error: 'Institute not found' }, { status: 404 });

    const snap = await adminDb.collection('users')
      .where('instituteId', '==', instituteId)
      .where('role', '==', 'student')
      .select('displayName', 'email', 'jobReadinessScore', 'lastActiveAt', 'joinedInstituteAt')
      .limit(1000)
      .get();

    const ids = snap.docs.map((d) => d.id);

    // 1) journey/active: fakt score fields (resume data nahi)
    const refs = ids.map((id) => adminDb.collection('users').doc(id).collection('journey').doc('active'));
    const journeys: Record<string, any> = {};
    for (let i = 0; i < refs.length; i += 100) {
      const docs = await adminDb.getAll(...refs.slice(i, i + 100), {
        fieldMask: [
          'aptitudeStatus', 'aptitudeReport.overallScore', 'aptitudeReport.status',
          'codingRoundCompleted', 'codingScore',
          'specialHRResult.overallScore', 'specialHRResult.verdict',
        ],
      });
      docs.forEach((j) => {
        if (j.exists) journeys[j.ref.parent.parent!.id] = j.data();
      });
    }

    // 2) interviews ani specialHRInterviews: fakt overallScore
    const sessionStats = async (uid: string) => {
      const base = adminDb.collection('users').doc(uid);
      const [iv, sp] = await Promise.all([
        base.collection('interviews').select('overallScore').get(),
        base.collection('specialHRInterviews').select('overallScore').get(),
      ]);
      const mock = iv.docs.map((d: any) => num(d.data().overallScore));
      const hr = sp.docs.map((d: any) => num(d.data().overallScore));
      return {
        mockCount: mock.length,
        mockBest: mock.length ? Math.max(...mock) : null,
        hrCount: hr.length,
        certificates: [...mock, ...hr].filter((x) => x >= MASTERY).length,
      };
    };
    const sessions: Record<string, Awaited<ReturnType<typeof sessionStats>>> = {};
    for (let i = 0; i < ids.length; i += 20) {
      const chunk = ids.slice(i, i + 20);
      const res = await Promise.all(chunk.map(sessionStats));
      chunk.forEach((id, k) => { sessions[id] = res[k]; });
    }

    const now = Date.now();
    let activeToday = 0, active7d = 0, neverActive = 0, readinessSum = 0;

    const students = snap.docs.map((d) => {
      const u = d.data();
      const last = u.lastActiveAt?.toMillis?.() ?? null;
      const joined = u.joinedInstituteAt?.toMillis?.() ?? null;

      const hasActivity = !!(
        sessions[d.id]?.mockCount ||
        sessions[d.id]?.hrCount ||
        journeys[d.id]?.aptitudeStatus === 'completed' ||
        journeys[d.id]?.codingRoundCompleted
      );
      if (last === null) {
        if (!hasActivity) neverActive++;
      } else {
        if (now - last <= DAY) activeToday++;
        if (now - last <= 7 * DAY) active7d++;
      }
      readinessSum += num(u.jobReadinessScore);

      const j = journeys[d.id];
      const aptitudeDone = j?.aptitudeStatus === 'completed';
      const s = sessions[d.id];
      const hr = j?.specialHRResult;

      return {
        uid: d.id,
        name: u.displayName || 'Student',
        email: u.email || '',
        lastActiveAt: last,
        joinedAt: joined,
        aptitudeScore: aptitudeDone ? num(j?.aptitudeReport?.overallScore) : null,
        aptitudeResult: aptitudeDone ? (j?.aptitudeReport?.status ?? null) : null,
        coding: j?.codingRoundCompleted ? num(j?.codingScore) : null,
        mockCount: s?.mockCount ?? 0,
        mockBest: s?.mockBest ?? null,
        hrCount: s?.hrCount ?? 0,
        hrScore: hr ? num(hr.overallScore) : null,
        hrVerdict: hr?.verdict ?? null,
        certificates: s?.certificates ?? 0,
        readiness: num(u.jobReadinessScore),
      };
    });

    students.sort((x, y) => (y.lastActiveAt ?? 0) - (x.lastActiveAt ?? 0));

    const total = students.length;
    return NextResponse.json({
      institute: { id: instituteId, name: instSnap.data()?.name },
      summary: {
        totalStudents: total,
        activeToday,
        active7d,
        neverActive,
        avgReadiness: total ? Math.round(readinessSum / total) : 0,
      },
      students,
    });
  } catch (e) {
    console.error('[institute/stats]', e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
