'use client';

import { QRCodeCanvas } from 'qrcode.react';

export interface CertificateTemplateProps {
  userName: string;
  role: string;
  score: number;
  date: string;
  certId: string;
}

const GOLD = '#c79a2e';

export default function CertificateTemplate({ userName, role, score, date, certId }: CertificateTemplateProps) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://celvivoai.com';
const verifyUrl = `${SITE_URL}/verify/${certId}`;
  const nameSize = userName.length > 28 ? 34 : userName.length > 20 ? 42 : 54;

  return (
    <div
      id="certificate-render-node"
      style={{
        position: 'relative',
        width: 1000,
        height: 707,
        background: '#fff',
        overflow: 'hidden',
        color: '#111',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Background from Canva */}
      <img src="/certificate-bg.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* Logo (top right) */}
<div style={{ position: 'absolute', top: 40, right: 70, width: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
  <img src="/LOGO.png" alt="Celvivo AI" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />
  <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 14, letterSpacing: 1.5 }}>CELVIVO AI</span>
</div>

      {/* Title */}
      <div style={{ position: 'absolute', left: 335, top: 100, width: 590 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 56, letterSpacing: 6, lineHeight: 1 }}>
          CERTIFICATE
        </div>
        <div style={{ fontSize: 22, letterSpacing: 5, marginTop: 10 }}>OF ACHIEVEMENT</div>
      </div>

      {/* Presented to */}
      <div style={{ position: 'absolute', left: 335, top: 238, fontSize: 13, fontWeight: 600, letterSpacing: 2.5 }}>
        THIS CERTIFICATE IS PRESENTED TO
      </div>

     {/* Name + auto underline */}
<div style={{ position: 'absolute', left: 335, top: 278, width: 570 }}>
  <div style={{ display: 'inline-block', maxWidth: 570 }}>
    <div
      style={{
        fontFamily: "'Great Vibes', cursive",
        fontSize: nameSize,
        color: GOLD,
        lineHeight: '1.2',
        height: nameSize * 1.2,
        display: 'flex',
        alignItems: 'flex-end',
        paddingRight: 30,
        whiteSpace: 'nowrap',
      }}
    >
      {userName}
    </div>
    <div style={{ height: 2, background: GOLD, marginTop: 6 }} />
  </div>
</div>

     {/* Body text */}
<div style={{ position: 'absolute', left: 335, top: 365, width: 560, fontSize: 16, lineHeight: 1.75, color: '#222' }}>
  For successfully demonstrating outstanding performance and strong skills in the{' '}
  <b>{role}</b> Interview, as evaluated by the AI-powered interview simulation on
  the <b>Celvivo AI</b> platform, and for achieving the required mastery level
  for certification.
</div>

      {/* Signature */}
      <div style={{ position: 'absolute', left: 335, top: 490, width: 210, textAlign: 'center' }}>
        <img src="/certificate-signature.png" alt="Signature" style={{ height: 52, margin: '0 auto', display: 'block' }} />
        <div style={{ borderTop: '1px solid #555', marginTop: 4, paddingTop: 5, fontSize: 12.5, fontWeight: 600 }}>
          VISHAL DHANGAR
        </div>
        <div style={{ fontSize: 11 }}>Founder & CEO, Celvivo AI</div>
      </div>

      {/* QR */}
<div style={{ position: 'absolute', left: 790, top: 495, textAlign: 'center', width: 100 }}>
  <QRCodeCanvas
    value={verifyUrl}
    size={400}
    level="L"
    marginSize={2}
    style={{ width: 96, height: 96 }}
  />
  <div style={{ fontSize: 10, marginTop: 4, letterSpacing: 1 }}>SCAN TO VERIFY</div>
</div>

      {/* ID + date */}
      <div style={{ position: 'absolute', left: 335, top: 622, fontSize: 10.5, color: '#444', letterSpacing: 0.5 }}>
        Certificate ID: <b>{certId}</b> &nbsp;|&nbsp; Issued: <b>{date}</b> &nbsp;|&nbsp; celvivoai.com/verify
      </div>
    </div>
  );
}
