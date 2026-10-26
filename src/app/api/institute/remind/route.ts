import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // ekach student la 24 tasat ekdach reminder

export async function POST(req: NextRequest) {
  try {
    // 1. TPO login check
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const adminDb = getAdminDb();
    const decoded = await getAdminAuth().verifyIdToken(token);

    // 2. TPO check: users madhe role == 'tpo' ani tyacha instituteId (stats route sarkhach)
    const callerSnap = await adminDb.collection('users').doc(decoded.uid).get();
    const caller = callerSnap.data();
    if (caller?.role !== 'tpo' || !caller?.instituteId) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    const instSnap = await adminDb.collection('institutes').doc(caller.instituteId).get();
    if (!instSnap.exists) return NextResponse.json({ error: 'Institute not found' }, { status: 404 });
    const institute = { id: instSnap.id, name: (instSnap.data()?.name as string) || 'your institute' };

    // 3. Student verify: ha student ya TPO chyach institute cha pahije
    const { studentUid } = await req.json();
    if (!studentUid) return NextResponse.json({ error: 'studentUid missing' }, { status: 400 });
    const stuDoc = await adminDb.collection('users').doc(studentUid).get();
    const stu = stuDoc.data();
    if (!stu || stu.role !== 'student' || stu.instituteId !== institute.id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    // 4. Spam rokh: 24 tasat ekdach
    const remRef = adminDb.collection('reminders').doc(studentUid);
    const last = (await remRef.get()).data()?.lastSentAt as number | undefined;
    if (last && Date.now() - last < COOLDOWN_MS) {
      return NextResponse.json({ error: 'Reminder already sent in the last 24 hours.' }, { status: 429 });
    }

    // 5. Demo students la khara email pathvu nako (fake email bounce hotat)
    if (stu.isDemo === true) {
      await remRef.set({ lastSentAt: Date.now(), instituteId: institute.id, demo: true });
      return NextResponse.json({ ok: true, demo: true });
    }

    // 6. Email pathav
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const appUrl = process.env.APP_URL || 'https://celvivo.ai';
    const name = stu.displayName || 'there';

    await transporter.sendMail({
      from: `"Celvivo AI" <${process.env.SMTP_USER}>`,
      to: stu.email,
      subject: `${institute.name} placement cell: keep practising on Celvivo AI`,
      text:
        `Hi ${name},\n\n` +
        `Your Training & Placement Cell at ${institute.name} noticed you haven't practised on Celvivo AI recently.\n` +
        `A few minutes of aptitude, coding or mock interview practice today keeps you ready for the next drive.\n\n` +
        `Continue here: ${appUrl}\n\nAll the best,\nCelvivo AI`,
      html:
        `<p>Hi ${name},</p>` +
        `<p>Your Training &amp; Placement Cell at <b>${institute.name}</b> noticed you haven't practised on Celvivo AI recently.</p>` +
        `<p>A few minutes of aptitude, coding or mock interview practice today keeps you ready for the next drive.</p>` +
        `<p><a href="${appUrl}" style="background:#FF6B1A;color:#0C0C0E;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Continue practising</a></p>` +
        `<p>All the best,<br/>Celvivo AI</p>`,
    });

    await remRef.set({ lastSentAt: Date.now(), instituteId: institute.id });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('remind error', e);
    return NextResponse.json({ error: 'Could not send reminder. Try again.' }, { status: 500 });
  }
}
