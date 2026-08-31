import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import React from 'react';

/**
 * @fileOverview High-Fidelity Certificate Generator.
 * Uses Satori (HTML-to-SVG) and ReSvg (SVG-to-PNG) for pixel-perfect rendering.
 * This browserless approach ensures reliability in restricted serverless environments.
 */

export const maxDuration = 60;

async function fetchFont(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  return await response.arrayBuffer();
}

async function fetchImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';
    return `data:${contentType};base64,${base64}`;
  } catch (e) {
    console.warn('[Certificate API] Image fetch failed:', url);
    return '';
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { userName, role, date, certId } = data;

    // 1. Fetch Resources
    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    
    const [interFont, frauncesFont, sigImage] = await Promise.all([
      fetchFont('https://rsms.me/inter/font-files/Inter-SemiBold.otf'),
      fetchFont('https://fonts.gstatic.com/s/fraunces/v32/6NUu8Du963PH5p96D-6369fI0vpt7-Y.ttf'),
      fetchImageAsBase64(`${protocol}://${host}/certificate-signature.png`)
    ]);

    // 2. Define Certificate UI (Satori/JSX)
    const certificateElement = (
      <div style={{
        width: '1180px',
        height: '728px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0c0f1a',
        color: '#f1eee4',
        fontFamily: 'Inter',
        padding: '30px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Gradient Simulator */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #0c0f1a 0%, #070911 50%, #0a0c16 100%)',
        }} />

        {/* Borders */}
        <div style={{
          position: 'absolute',
          top: '16px', left: '16px', right: '16px', bottom: '16px',
          border: '1px solid rgba(216, 179, 116, 0.3)',
        }} />
        <div style={{
          position: 'absolute',
          top: '21px', left: '21px', right: '21px', bottom: '21px',
          border: '1px solid rgba(216, 179, 116, 0.15)',
        }} />

        {/* Corner Diamonds */}
        {[
          { top: '12.5px', left: '12.5px' },
          { top: '12.5px', right: '12.5px' },
          { bottom: '12.5px', left: '12.5px' },
          { bottom: '12.5px', right: '12.5px' }
        ].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: '9px',
            height: '9px',
            backgroundColor: '#d8b374',
            transform: 'rotate(45deg)',
            opacity: 0.8,
            ...pos
          }} />
        ))}

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          height: '100%', 
          padding: '20px 56px',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px' }}>
                NEXVORO<span style={{ color: '#d8b374' }}>AI</span>
              </div>
              <div style={{ fontSize: '9px', letterSpacing: '2.5px', color: '#8b8a94', textTransform: 'uppercase', marginTop: '2px' }}>
                AI Career Tools
              </div>
            </div>
            <div style={{ 
              fontSize: '10px', 
              letterSpacing: '2.5px', 
              color: '#d8b374', 
              textTransform: 'uppercase', 
              border: '1px solid rgba(216, 179, 116, 0.3)', 
              padding: '6px 16px' 
            }}>
              Neural Performance Verification
            </div>
          </div>

          {/* Body */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#8b8a94', fontStyle: 'italic' }}>This credential certifies that</div>
            <div style={{ 
              fontSize: '50px', 
              fontFamily: 'Fraunces', 
              fontWeight: 'bold', 
              color: '#f0d9a8', 
              marginTop: '12px',
              letterSpacing: '-1px'
            }}>
              {userName}
            </div>
            <div style={{ width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, #d8b374, transparent)', margin: '16px 0' }} />
            <div style={{ fontSize: '14px', color: '#8b8a94' }}>has demonstrated mastery in the simulation for</div>
            <div style={{ fontSize: '26px', fontFamily: 'Fraunces', fontWeight: 'bold', color: '#f1eee4', marginTop: '6px' }}>
              {role} Mastery
            </div>
          </div>

          {/* Footer Details */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', width: '100%', marginBottom: '30px' }}>
              {[
                { label: 'Date of Issue', value: date },
                { label: 'Verification ID', value: (certId || 'NEX-PROTO-01').toUpperCase() },
                { label: 'Verify at', value: 'nexvoro.ai', color: '#d8b374' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', letterSpacing: '1px', color: '#8b8a94', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: item.color || '#f1eee4' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '40px', 
              width: '100%', 
              maxWidth: '600px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(216, 179, 116, 0.15)' 
            }}>
              {/* Seal */}
              <div style={{
                width: '86px', height: '86px', borderRadius: '50%',
                border: '2px solid #d8b374',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', inset: '5px', borderRadius: '50%', border: '1px dashed rgba(216, 179, 116, 0.5)' }} />
                <span style={{ fontSize: '24px', color: '#d8b374' }}>★</span>
              </div>

              {/* Signature */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '250px' }}>
                {sigImage ? (
                  <img src={sigImage} style={{ height: '50px', marginBottom: '8px' }} />
                ) : (
                  <div style={{ height: '50px' }} />
                )}
                <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(216, 179, 116, 0.35)', marginBottom: '6px' }} />
                <div style={{ fontSize: '9px', letterSpacing: '1.5px', color: '#8b8a94', textTransform: 'uppercase' }}>
                  Founder & CEO, Nexvoro AI
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    // 3. Render to PNG
    const svg = await satori(certificateElement, {
      width: 1180,
      height: 728,
      fonts: [
        { name: 'Inter', data: interFont, weight: 600, style: 'normal' },
        { name: 'Fraunces', data: frauncesFont, weight: 700, style: 'normal' }
      ]
    });

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1180 },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // 4. Wrap in PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([1180, 728]);
    const embeddedPng = await pdfDoc.embedPng(pngBuffer);
    page.drawImage(embeddedPng, {
      x: 0,
      y: 0,
      width: 1180,
      height: 728
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Nexvoro_Credential_${userName.replace(/\s+/g, '_')}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("[API Certificate] Fatal fault:", error);
    return NextResponse.json({ error: "PDF Synthesis Failed", details: error.message }, { status: 500 });
  }
}
