import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

/**
 * @fileOverview Server-side Certificate PDF Generator.
 * Optimized for Custom Container deployments using the official Puppeteer image.
 */

export const maxDuration = 60;

export async function POST(req: Request) {
  let browser = null;
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
            width: 1180px;
            height: 728px;
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
          .brand-box { width: 44px; height: 44px; background: linear-gradient(135deg, #171a2e, #0d0f1c); border: 1px solid rgba(216, 179, 116, 0.25); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
          .brand-text { font-weight: 700; font-size: 16px; letter-spacing: 2px; }
          .tagline { font-size: 9px; letter-spacing: 3px; color: #8b8a94; text-transform: uppercase; margin-top: 2px; }
          .verification-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d8b374; border: 1px solid rgba(216, 179, 116, 0.3); padding: 8px 20px; text-transform: uppercase; }
          .content { text-align: center; margin-top: 40px; }
          .intro { font-style: italic; color: #8b8a94; font-size: 13px; }
          .name { font-family: 'Fraunces', serif; font-size: 50px; color: #f0d9a8; margin: 15px 0; }
          .divider { width: 120px; height: 1px; background: linear-gradient(to right, transparent, #d8b374, transparent); margin: 20px auto; }
          .achievement { font-size: 26px; font-family: 'Fraunces', serif; color: #f1eee4; }
          .footer { display: flex; flex-direction: column; align-items: center; gap: 30px; margin-top: auto; }
          .details { display: flex; justify-content: center; gap: 60px; width: 100%; }
          .detail-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
          .detail-label { font-size: 9px; text-transform: uppercase; color: #8b8a94; font-family: 'JetBrains Mono', monospace; }
          .detail-val { font-size: 13px; color: #f1eee4; font-family: 'JetBrains Mono', monospace; }
          .auth-block { display: flex; align-items: center; gap: 40px; border-top: 1px solid rgba(216, 179, 116, 0.15); padding-top: 20px; width: 100%; max-width: 600px; justify-content: center; }
          .seal { width: 86px; height: 86px; background: radial-gradient(circle at top left, #2a2210, #0a0c16); border: 2px solid #d8b374; border-radius: 50%; position: relative; display: flex; align-items: center; justify-content: center; }
          .signature { text-align: center; width: 250px; }
          .sig-img { height: 56px; display: block; margin: 0 auto; }
          .sig-line { width: 100%; height: 1px; background: rgba(216, 179, 116, 0.35); margin-top: 10px; }
          .sig-label { font-size: 9px; color: #8b8a94; text-transform: uppercase; margin-top: 6px; font-family: 'JetBrains Mono', monospace; }
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
              <div class="brand-box">
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                  <path d="M6 32 V8 L20 24 V8" stroke="#d8b374" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M26 32 V8" stroke="#d8b374" strokeWidth="4.2" strokeLinecap="round" fill="none" opacity=".55"/>
                  <circle cx="34" cy="7" r="3" fill="#d8b374"/>
                </svg>
              </div>
              <div style="display: flex; flex-direction: column;">
                <div class="brand-text">NEXVORO<span style="color: #d8b374">AI</span></div>
                <div class="tagline">AI Career Tools</div>
              </div>
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
              <div class="detail-item">
                <span class="detail-label">Verify at</span>
                <span class="detail-val">nexvoro.ai</span>
              </div>
            </div>

            <div class="auth-block">
              <div class="seal">
                <span style="color: #d8b374; font-size: 24px;">★</span>
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

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1180, height: 728, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      width: '1180px',
      height: '728px',
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
    if (browser) await browser.close();
    return NextResponse.json({ error: "PDF Synthesis Failed", details: error.message }, { status: 500 });
  }
}