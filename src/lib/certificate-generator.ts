'use client';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import { createRoot } from 'react-dom/client';
import CertificateTemplate from '@/components/certificate/CertificateTemplate';

export interface CertificateData {
  userName: string;
  role: string;
  score: number;
  date: string;
  certId: string;
}

export const generateCertificatePDF = async (data: CertificateData) => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    root.render(React.createElement(CertificateTemplate, data));

    // wait for fonts + images
    await new Promise((r) => setTimeout(r, 300));
    if ((document as any).fonts?.ready) await (document as any).fonts.ready;
    const imgs = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      imgs.map((img) =>
        img.complete ? Promise.resolve() : new Promise((res) => { img.onload = img.onerror = () => res(null); })
      )
    );
    await new Promise((r) => setTimeout(r, 300));

    const target = container.querySelector('#certificate-render-node') as HTMLElement | null;
    if (!target) throw new Error('Render node not found');

    const canvas = await html2canvas(target, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1000, 707] });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 1000, 707);
    pdf.save(`Celvivo_Certificate_${data.userName.replace(/\s+/g, '_')}.pdf`);
  } finally {
    root.unmount();
    container.remove();
  }
};
