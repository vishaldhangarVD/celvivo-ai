
import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib';

/**
 * @fileOverview Server-side Resume PDF Generator.
 * Migrated from Puppeteer to pdf-lib to eliminate system browser dependencies (libglib).
 * Handles text wrapping, multi-page layout, and professional styling.
 */

export const maxDuration = 60;

// Colors
const MAROON = rgb(122 / 255, 37 / 255, 49 / 255);
const BLACK = rgb(0.14, 0.12, 0.1);
const GREY = rgb(0.4, 0.4, 0.4);
const LIGHT_GREY = rgb(0.95, 0.95, 0.95);

interface TextOptions {
  fontSize?: number;
  color?: any;
  font?: PDFFont;
  maxWidth?: number;
  lineHeight?: number;
}

export async function POST(req: Request) {
  try {
    console.log("[API Resume] Received synthesis request (pdf-lib engine).");
    const data = await req.json();
    const { name, role, email, phone, loc, summary, skills, experience, projects, education } = data;

    if (!name) {
      return NextResponse.json({ error: "Candidate name required for synthesis." }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    const margin = 50;
    let yCursor = height - margin;

    const checkNewPage = (neededHeight: number) => {
      if (yCursor - neededHeight < margin) {
        page = pdfDoc.addPage([595.28, 841.89]);
        yCursor = height - margin;
        return true;
      }
      return false;
    };

    const drawWrappedText = (text: string, options: TextOptions = {}) => {
      const { 
        fontSize = 11, 
        color = BLACK, 
        font: textFont = font, 
        maxWidth = width - (margin * 2),
        lineHeight = 1.4
      } = options;

      const words = text.split(/\s+/);
      let line = "";
      const lines = [];

      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        const testWidth = textFont.widthOfTextAtSize(testLine, fontSize);
        if (testWidth < maxWidth) {
          line = testLine;
        } else {
          lines.push(line);
          line = word;
        }
      }
      lines.push(line);

      for (const lineText of lines) {
        checkNewPage(fontSize * lineHeight);
        page.drawText(lineText, {
          x: margin,
          y: yCursor - fontSize,
          size: fontSize,
          font: textFont,
          color,
        });
        yCursor -= (fontSize * lineHeight);
      }
    };

    const drawSectionHeader = (title: string) => {
      yCursor -= 15;
      checkNewPage(30);
      page.drawText(title.toUpperCase(), {
        x: margin,
        y: yCursor - 14,
        size: 11,
        font: fontBold,
        color: MAROON,
      });
      yCursor -= 20;
      page.drawLine({
        start: { x: margin, y: yCursor },
        end: { x: width - margin, y: yCursor },
        thickness: 1.5,
        color: MAROON,
      });
      yCursor -= 15;
    };

    // Header
    page.drawText(name || 'Candidate Name', {
      x: margin,
      y: yCursor - 30,
      size: 32,
      font: fontBold,
      color: BLACK,
    });
    yCursor -= 35;

    page.drawText((role || 'Professional Title').toUpperCase(), {
      x: margin,
      y: yCursor - 14,
      size: 12,
      font: fontBold,
      color: MAROON,
    });
    yCursor -= 20;

    const contactStr = [email, phone, loc].filter(Boolean).join(' | ');
    page.drawText(contactStr, {
      x: margin,
      y: yCursor - 10,
      size: 10,
      font: font,
      color: GREY,
    });
    yCursor -= 30;

    // Summary
    if (summary) {
      drawSectionHeader("Summary");
      drawWrappedText(summary, { font: fontItalic, lineHeight: 1.6 });
    }

    // Experience
    if (experience && experience.length > 0) {
      drawSectionHeader("Experience");
      for (const exp of experience) {
        checkNewPage(40);
        const title = `${exp.role || ''} @ ${exp.company || ''}`;
        page.drawText(title, { x: margin, y: yCursor - 12, size: 11, font: fontBold, color: BLACK });
        
        const dateWidth = font.widthOfTextAtSize(exp.dates || '', 10);
        page.drawText(exp.dates || '', { x: width - margin - dateWidth, y: yCursor - 12, size: 10, font: font, color: GREY });
        
        yCursor -= 25;
        
        if (exp.bullets) {
          const bullets = exp.bullets.split('\n').filter((b: string) => b.trim());
          for (const bullet of bullets) {
            drawWrappedText(`• ${bullet}`, { fontSize: 10.5, maxWidth: width - (margin * 2.2) });
          }
        }
        yCursor -= 10;
      }
    }

    // Projects
    if (projects && projects.length > 0) {
      drawSectionHeader("Projects");
      for (const proj of projects) {
        checkNewPage(30);
        page.drawText(proj.name || '', { x: margin, y: yCursor - 12, size: 11, font: fontBold, color: BLACK });
        yCursor -= 18;
        if (proj.desc) {
          drawWrappedText(proj.desc, { fontSize: 10.5 });
        }
        yCursor -= 10;
      }
    }

    // Education
    if (education && education.length > 0) {
      drawSectionHeader("Education");
      for (const ed of education) {
        checkNewPage(20);
        const edTitle = `${ed.degree || ''}, ${ed.school || ''}`;
        page.drawText(edTitle, { x: margin, y: yCursor - 12, size: 11, font: fontBold, color: BLACK });
        
        const edDateWidth = font.widthOfTextAtSize(ed.dates || '', 10);
        page.drawText(ed.dates || '', { x: width - margin - edDateWidth, y: yCursor - 12, size: 10, font: font, color: GREY });
        yCursor -= 25;
      }
    }

    // Skills
    if (skills && skills.length > 0) {
      drawSectionHeader("Skills");
      let skillRow = "";
      const skillMargin = margin;
      
      for (let i = 0; i < skills.length; i++) {
        const skill = skills[i];
        const testLine = skillRow ? `${skillRow}, ${skill}` : skill;
        const testWidth = font.widthOfTextAtSize(testLine, 10);
        
        if (testWidth < width - (margin * 2)) {
          skillRow = testLine;
        } else {
          checkNewPage(15);
          page.drawText(skillRow, { x: skillMargin, y: yCursor - 10, size: 10, font: font, color: BLACK });
          yCursor -= 15;
          skillRow = skill;
        }
      }
      if (skillRow) {
        checkNewPage(15);
        page.drawText(skillRow, { x: skillMargin, y: yCursor - 10, size: 10, font: font, color: BLACK });
        yCursor -= 15;
      }
    }

    const pdfBytes = await pdfDoc.save();

    console.log("[API Resume] PDF generated successfully. Returning response.");
    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Resume_${name.replace(/\s+/g, '_')}.pdf"`
      }
    });

  } catch (error: any) {
    console.error("[API Resume] FATAL FAULT DURING SYNTHESIS:", error);
    return NextResponse.json({ 
      error: "Resume Synthesis Failed", 
      details: error.message
    }, { status: 500 });
  }
}
