
'use client';

import { jsPDF } from 'jspdf';

interface CertificateData {
  userName: string;
  role: string;
  score: number;
  date: string;
}

export const generateCertificatePDF = (data: CertificateData) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(5, 8, 22); // Nexvoro Deep Navy
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative Border
  doc.setDrawColor(34, 211, 238); // Cyan-400
  doc.setLineWidth(1);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  doc.setDrawColor(147, 51, 234); // Purple-600
  doc.setLineWidth(0.5);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Logo Placeholder / Branding
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('NEXVORO AI', pageWidth / 2, 40, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('NEURAL PERFORMANCE CREDENTIAL', pageWidth / 2, 48, { align: 'center' });

  // Main Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('This is to certify that', pageWidth / 2, 75, { align: 'center' });

  doc.setFontSize(40);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 211, 238);
  doc.text(data.userName.toUpperCase(), pageWidth / 2, 95, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('has successfully completed the neural simulation for', pageWidth / 2, 115, { align: 'center' });

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.role} Mastery`, pageWidth / 2, 130, { align: 'center' });

  // Score Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('with an Efficiency Rating of', pageWidth / 2, 145, { align: 'center' });
  
  doc.setFontSize(32);
  doc.setTextColor(147, 51, 234);
  doc.text(`${data.score}%`, pageWidth / 2, 160, { align: 'center' });

  // Footer Info
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`Verified Date: ${data.date}`, 30, pageHeight - 30);
  doc.text('Verification ID: ' + Math.random().toString(36).substring(2, 15).toUpperCase(), pageWidth - 30, pageHeight - 30, { align: 'right' });

  // Signatures
  doc.setDrawColor(255, 255, 255, 0.2);
  doc.line(pageWidth / 2 - 40, pageHeight - 45, pageWidth / 2 + 40, pageHeight - 45);
  doc.setFontSize(8);
  doc.text('SYSTEM DIRECTOR, NEXVORO AI', pageWidth / 2, pageHeight - 40, { align: 'center' });

  doc.save(`Nexvoro_Certificate_${data.role.replace(/\s+/g, '_')}.pdf`);
};
