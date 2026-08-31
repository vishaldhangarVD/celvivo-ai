import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

/**
 * @fileOverview Pure JS Certificate PDF Generator.
 * Replaces Puppeteer with pdf-lib to avoid system-level Chromium dependencies.
 */

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { userName, role, date, certId } = data;

    // 1. Initialize Document
    const pdfDoc = await PDFDocument.create();
    const pageWidth = 1180;
    const pageHeight = 728;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // 2. Embed Fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // 3. Define Colors
    const colorBg = rgb(5 / 255, 7 / 255, 13 / 255);
    const colorGold = rgb(216 / 255, 179 / 255, 116 / 255);
    const colorWhite = rgb(241 / 255, 238 / 255, 228 / 255);
    const colorCream = rgb(240 / 255, 217 / 255, 168 / 255);
    const colorGray = rgb(139 / 255, 138 / 255, 148 / 255);

    // 4. Draw Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: colorBg,
    });

    // 5. Draw Borders
    page.drawRectangle({
      x: 16,
      y: 16,
      width: pageWidth - 32,
      height: pageHeight - 32,
      borderColor: colorGold,
      borderWidth: 1,
      opacity: 0.3,
    });

    page.drawRectangle({
      x: 21,
      y: 21,
      width: pageWidth - 42,
      height: pageHeight - 42,
      borderColor: colorGold,
      borderWidth: 1,
      opacity: 0.15,
    });

    // 6. Draw Corner Diamonds
    const drawDiamond = (cx: number, cy: number) => {
      page.drawSquare({
        x: cx,
        y: cy,
        size: 9,
        color: colorGold,
        rotate: degrees(45),
        opacity: 0.8,
      });
    };

    drawDiamond(12.5, 12.5); // Bottom Left
    drawDiamond(pageWidth - 12.5 - 9, 12.5); // Bottom Right
    drawDiamond(12.5, pageHeight - 12.5 - 9); // Top Left
    drawDiamond(pageWidth - 12.5 - 9, pageHeight - 12.5 - 9); // Top Right

    // 7. Header Branding
    const brandText = 'NEXVOROAI';
    page.drawText(brandText, {
      x: 60,
      y: pageHeight - 75,
      size: 16,
      font: helveticaBold,
      color: colorWhite,
    });

    page.drawText('AI Career Tools', {
      x: 60,
      y: pageHeight - 90,
      size: 9,
      font: helvetica,
      color: colorGray,
    });

    const verificationLabel = 'Neural Performance Verification';
    const vLabelWidth = helvetica.widthOfTextAtSize(verificationLabel, 10);
    page.drawText(verificationLabel, {
      x: pageWidth - 60 - vLabelWidth,
      y: pageHeight - 80,
      size: 10,
      font: helvetica,
      color: colorGold,
    });

    // 8. Main Content
    const intro1 = 'This credential certifies that';
    const intro1Width = timesItalic.widthOfTextAtSize(intro1, 13);
    page.drawText(intro1, {
      x: (pageWidth - intro1Width) / 2,
      y: pageHeight - 180,
      size: 13,
      font: timesItalic,
      color: colorGray,
    });

    const nameText = userName || 'Elite Candidate';
    const nameSize = 50;
    const nameWidth = helveticaBold.widthOfTextAtSize(nameText, nameSize);
    page.drawText(nameText, {
      x: (pageWidth - nameWidth) / 2,
      y: pageHeight - 250,
      size: nameSize,
      font: helveticaBold,
      color: colorCream,
    });

    // Divider
    page.drawLine({
      start: { x: (pageWidth / 2) - 60, y: pageHeight - 280 },
      end: { x: (pageWidth / 2) + 60, y: pageHeight - 280 },
      thickness: 1,
      color: colorGold,
      opacity: 0.5,
    });

    const intro2 = 'has demonstrated mastery in the simulation for';
    const intro2Width = timesItalic.widthOfTextAtSize(intro2, 13);
    page.drawText(intro2, {
      x: (pageWidth - intro2Width) / 2,
      y: pageHeight - 310,
      size: 13,
      font: timesItalic,
      color: colorGray,
    });

    const achievementText = `${role || 'Technical'} Mastery`;
    const achievementWidth = helveticaBold.widthOfTextAtSize(achievementText, 26);
    page.drawText(achievementText, {
      x: (pageWidth - achievementWidth) / 2,
      y: pageHeight - 350,
      size: 26,
      font: helveticaBold,
      color: colorWhite,
    });

    // 9. Details Row
    const detailsY = 180;
    const drawDetail = (label: string, value: string, x: number) => {
      const lWidth = helvetica.widthOfTextAtSize(label, 9);
      page.drawText(label, { x: x - (lWidth / 2), y: detailsY, size: 9, font: helvetica, color: colorGray });
      
      const vWidth = helveticaBold.widthOfTextAtSize(value, 13);
      page.drawText(value, { x: x - (vWidth / 2), y: detailsY - 20, size: 13, font: helveticaBold, color: colorWhite });
    };

    drawDetail('Date of Issue', date || new Date().toLocaleDateString(), pageWidth * 0.33);
    drawDetail('Verification ID', (certId || 'NEX-PROTO-01').toUpperCase(), pageWidth * 0.5);
    drawDetail('Verify at', 'nexvoro.ai', pageWidth * 0.66);

    // 10. Seal & Signature
    // Circular Seal
    page.drawCircle({
      x: (pageWidth / 2) - 160,
      y: 80,
      size: 43,
      borderColor: colorGold,
      borderWidth: 2,
    });
    page.drawText('★', {
      x: (pageWidth / 2) - 173,
      y: 68,
      size: 24,
      font: helveticaBold,
      color: colorGold,
    });

    // Signature Area
    try {
      const host = req.headers.get('host');
      const protocol = host?.includes('localhost') ? 'http' : 'https';
      const sigUrl = `${protocol}://${host}/certificate-signature.png`;
      const sigResponse = await fetch(sigUrl);
      if (sigResponse.ok) {
        const sigBytes = await sigResponse.arrayBuffer();
        const sigImage = await pdfDoc.embedPng(sigBytes);
        const sigDims = sigImage.scale(0.5);
        page.drawImage(sigImage, {
          x: (pageWidth / 2) + 20,
          y: 65,
          width: sigDims.width,
          height: sigDims.height,
        });
      }
    } catch (e) {
      console.warn('Signature image embed failed, skipping...', e);
    }

    // Signature line and label
    page.drawLine({
      start: { x: (pageWidth / 2) + 20, y: 60 },
      end: { x: (pageWidth / 2) + 270, y: 60 },
      thickness: 1,
      color: colorGold,
      opacity: 0.35,
    });

    page.drawText('Founder & CEO, Nexvoro AI', {
      x: (pageWidth / 2) + 85,
      y: 45,
      size: 9,
      font: helvetica,
      color: colorGray,
    });

    // 11. Finalize
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Nexvoro_Credential.pdf"',
      },
    });
  } catch (error: any) {
    console.error("[API Certificate] Fatal fault:", error);
    return NextResponse.json({ error: "PDF Synthesis Failed", details: error.message }, { status: 500 });
  }
}
