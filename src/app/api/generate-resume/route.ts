import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

/**
 * @fileOverview Server-side Resume PDF Generator.
 * Uses Puppeteer to render a high-fidelity professional resume from structured data.
 */

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, role, email, phone, loc, summary, skills, experience, projects, education, theme } = data;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Fraunces:wght@600&display=swap" rel="stylesheet">
        <style>
          :root { --accent: #7a2531; }
          body { margin: 0; padding: 40px; font-family: 'Inter', sans-serif; color: #241f18; background: #fff; }
          .name { font-family: 'Fraunces', serif; font-size: 32px; font-weight: 600; margin-bottom: 5px; }
          .role { font-size: 14px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
          .contact { font-size: 11px; color: #666; margin-bottom: 20px; }
          .section { margin-top: 25px; }
          .section-title { font-family: 'Fraunces', serif; font-size: 14px; font-weight: 600; border-bottom: 2px solid var(--accent); padding-bottom: 5px; margin-bottom: 12px; }
          .summary { font-size: 12px; line-height: 1.6; font-style: italic; }
          .job { margin-bottom: 15px; }
          .job-head { display: flex; justify-content: space-between; font-weight: 700; font-size: 13px; }
          .job-sub { font-size: 11px; color: #777; margin-bottom: 5px; }
          .bullet { font-size: 11.5px; line-height: 1.5; margin-left: 15px; margin-bottom: 3px; }
          .skill-pill { display: inline-block; background: #f0f0f0; padding: 4px 10px; border-radius: 4px; font-size: 11px; margin: 0 5px 5px 0; }
        </style>
      </head>
      <body>
        <div class="name">${name || 'Candidate Name'}</div>
        <div class="role">${role || 'Professional Title'}</div>
        <div class="contact">${email} | ${phone} | ${loc}</div>
        
        <div class="section">
          <div class="section-title">Summary</div>
          <div class="summary">${summary}</div>
        </div>

        <div class="section">
          <div class="section-title">Experience</div>
          ${experience.map((e: any) => `
            <div class="job">
              <div class="job-head"><span>${e.role} @ ${e.company}</span><span>${e.dates}</span></div>
              <div class="job-sub">${e.role}</div>
              ${e.bullets.split('\n').map((b: string) => `<div class="bullet">• ${b}</div>`).join('')}
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">Education</div>
          ${education.map((ed: any) => `
            <div class="job-head"><span>${ed.degree}, ${ed.school}</span><span>${ed.dates}</span></div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">Skills</div>
          <div>${skills.map((s: string) => `<span class="skill-pill">${s}</span>`).join('')}</div>
        </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
    });

    await browser.close();

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Resume_${name?.replace(/\s+/g, '_')}.pdf"`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Resume Synthesis Failed", details: error.message }, { status: 500 });
  }
}
