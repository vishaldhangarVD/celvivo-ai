'use client';

import { jsPDF } from 'jspdf';

interface CertificateMetrics {
  technicalKnowledge?: number;
  communication?: number;
  problemSolving?: number;
  confidence?: number;
  hrSkills?: number;
}

interface CertificateData {
  userName: string;
  role: string;
  score: number;
  date: string;
  certId: string;
  metrics?: CertificateMetrics;
}

/**
 * @fileOverview High-Fidelity Certificate PDF Generator.
 * Synthesizes a professional, branded credential with sub-metric vectors and unique verification IDs.
 */
export const generateCertificatePDF = (data: CertificateData) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background - Nexvoro Deep Space
  doc.setFillColor(5, 8, 22);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative Border Layer 1 (Cyan)
  doc.setDrawColor(34, 211, 238);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  // Decorative Border Layer 2 (Purple)
  doc.setDrawColor(147, 51, 234);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Logo Branding
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('NEXVORO AI', pageWidth / 2, 35, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(34, 211, 238);
  doc.text('NEURAL PERFORMANCE VERIFICATION PROTOCOL', pageWidth / 2, 42, { align: 'center' });

  // Certificate Statement
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(14);
  doc.text('This credential certifies that', pageWidth / 2, 65, { align: 'center' });

  // Candidate Name
  doc.setFontSize(42);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(data.userName.toUpperCase(), pageWidth / 2, 85, { align: 'center' });

  // Accomplishment
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('has demonstrated mastery in the simulation for', pageWidth / 2, 100, { align: 'center' });

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(147, 51, 234);
  doc.text(`${data.role} Mastery`, pageWidth / 2, 115, { align: 'center' });

  // Score Highlight
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text('Achieved Overall Efficiency Rating of', pageWidth / 2, 130, { align: 'center' });
  
  doc.setFontSize(38);
  doc.setTextColor(34, 211, 238);
  doc.text(`${data.score}%`, pageWidth / 2, 148, { align: 'center' });

  // Metrics Matrix (Conditional)
  if (data.metrics) {
    const metrics = [
      { label: 'Technical', val: data.metrics.technicalKnowledge || 0 },
      { label: 'Communication', val: data.metrics.communication || 0 },
      { label: 'Problem Solving', val: data.metrics.problemSolving || 0 },
      { label: 'Confidence', val: data.metrics.confidence || 0 },
      { label: 'HR Readiness', val: data.metrics.hrSkills || 0 },
    ];

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const startX = 60;
    const spacing = 35;
    
    metrics.forEach((m, i) => {
      doc.text(m.label.toUpperCase(), startX + (i * spacing), 170, { align: 'center' });
      doc.setTextColor(255, 255, 255);
      doc.text(`${m.val}%`, startX + (i * spacing), 175, { align: 'center' });
      doc.setTextColor(100, 100, 100);
    });
  }

  // Footer Metadata
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  doc.text(`DATE OF ISSUE: ${data.date}`, 25, pageHeight - 20);
  doc.text(`VERIFICATION ID: ${data.certId.toUpperCase()}`, pageWidth - 25, pageHeight - 20, { align: 'right' });

  // Signature Area
  doc.setDrawColor(255, 255, 255, 0.1);
  doc.line(pageWidth / 2 - 30, pageHeight - 35, pageWidth / 2 + 30, pageHeight - 35);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 120, 120);
  doc.text('SYSTEM DIRECTOR, NEXVORO AI', pageWidth / 2, pageHeight - 30, { align: 'center' });

  doc.save(`Nexvoro_Credential_${data.certId.substring(0, 8)}.pdf`);
};
