import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

/**
 * @fileOverview Server-side Certificate PDF Generator.
 * Uses Puppeteer to render a high-fidelity Navy & Gold certificate design.
 */

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { userName, role, date, certId } = data;

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const signatureUrl = `${protocol}://${host}/certificate-signature.png`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Fraunces:wght@600&family=JetBrains+Mono&display=swap" rel="stylesheet">
        <style>
          body { margin: 0; padding: 0; background: #05070d; font-family: 'Inter', sans-serif; }
          .cert {
            width: 1100px;
            height: 647px;
            background: linear-gradient(135deg, #0c0f1a 0%, #070911 50%, #0a0c16 100%);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 40px 60px;
            color: #fff;
            box-sizing: border-box;
          }
          .border-outer { position: absolute; inset: 16px; border: 1px solid rgba(216, 179, 116, 0.3); }
          .border-inner { position: absolute; inset: 21px; border: 1px solid rgba(216, 179, 116, 0.15); }
          .corner { position: absolute; width: 9px; height: 9px; background: #d8b374; transform: rotate(45deg); opacity: 0.8; }
          .header { display: flex; justify-content: space-between; align-items: center; }
          .brand { display: flex; align-items: center; gap: 12px; }
          .brand-text { font-weight: 700; font-size: 14px; letter-spacing: 2px; }
          .tagline { font-size: 8px; letter-spacing: 3px; color: #8b8a94; text-transform: uppercase; }
          .verification-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #d8b374; border: 1px solid rgba(216, 179, 116, 0.3); padding: 6px 16px; text-transform: uppercase; }
          .content { text-align: center; margin-top: 40px; }
          .intro { font-style: italic; color: #8b8a94; font-size: 12px; }
          .name { font-family: 'Fraunces', serif; font-size: 42px; color: #f0d9a8; margin: 15px 0; }
          .divider { width: 120px; height: 1px; background: linear-gradient(to right, transparent, #d8b374, transparent); margin: 20px auto; }
          .achievement { font-size: 22px; font-family: 'Fraunces', serif; color: #f1eee4; }
          .footer { display: flex; flex-direction: column; align-items: center; gap: 30px; margin-top: auto; }
          .details { display: flex; justify-content: center; gap: 60px; width: 100%; }
          .detail-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
          .detail-label { font-size: 8px; text-transform: uppercase; color: #8b8a94; font-family: 'JetBrains Mono', monospace; }
          .detail-val { font-size: 11px; color: #f1eee4; font-family: 'JetBrains Mono', monospace; }
          .auth-block { display: flex; align-items: center; gap: 40px; border-top: 1px solid rgba(216, 179, 116, 0.15); padding-top: 20px; width: 100%; max-width: 600px; justify-content: center; }
          .seal { width: 70px; height: 70px; background: radial-gradient(circle at top left, #2a2210, #0a0c16); border: 1.5px solid #d8b374; border-radius: 50%; position: relative; display: flex; align-items: center; justify-content: center; }
          .signature { text-align: center; }
          .sig-img { height: 45px; display: block; margin: 0 auto; }
          .sig-line { width: 220px; height: 1px; background: rgba(216, 179, 116, 0.35); margin-top: 10px; }
          .sig-label { font-size: 8px; color: #8b8a94; text-transform: uppercase; margin-top: 6px; font-family: 'JetBrains Mono', monospace; }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="border-outer"></div>
          <div class="border-inner"></div>
          <div class="corner" style="top: 12.5px; left: 12.5px;"></div>
          <div class="corner" style="top: 12.5px; right: 12.5px;"></div>
          <div class="corner" style="bottom: 12.5px; left: 12.5px;"></div>
          <div class="corner" style="bottom: 12.5px; right: 12.5px;"></div>

          <div class="header">
            <div class="brand">
              <div class="brand-text">NEXVORO<span style="color: #d8b374">AI</span></div>
            </div>
            <div class="verification-label">Neural Performance Verification</div>
          </div>

          <div class="content">
            <div class="intro">This credential certifies that</div>
            <div class="name">${userName}</div>
            <div class="divider"></div>
            <div class="intro">has demonstrated mastery in the simulation for</div>
            <div class="achievement">${role} Mastery</div>
          </div>

          <div class="footer">
            <div class="details">
              <div class="detail-item">
                <span class="detail-label">Date of Issue</span>
                <span class="detail-val">${date}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Verification ID</span>
                <span class="detail-val">${certId?.toUpperCase() || 'NEX-X-PROTO-01'}</span>
              </div>
            </div>

            <div class="auth-block">
              <div class="seal">
                <span style="color: #d8b374; font-size: 20px;">★</span>
              </div>
              <div class="signature">
                <img src="${signatureUrl}" class="sig-img" alt="Signature">
                <div class="sig-line"></div>
                <div class="sig-label">Founder & CEO, Nexvoro AI</div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1100, height: 647, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      width: '1100px',
      height: '647px',
      printBackground: true,
    });

    await browser.close();

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Nexvoro_Credential.pdf"`
      }
    });
  } catch (error: any) {
    console.error("[API Certificate] Fatal fault:", error);
    return NextResponse.json({ error: "PDF Synthesis Failed", details: error.message }, { status: 500 });
  }
}
