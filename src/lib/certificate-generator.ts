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
  certId?: string;
}

/**
 * @fileOverview Nexvoro AI Client-Side PDF Generator.
 * Renders the certificate to a hidden DOM node and captures it via html2canvas.
 * Uses React.createElement instead of JSX to remain compatible with the .ts extension.
 */
export const generateCertificatePDF = async (data: CertificateData) => {
  // 1. Create a hidden mount point
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  document.body.appendChild(container);

  try {
    // 2. Render the template into the container
    const root = createRoot(container);
    
    // We wrap in a promise to wait for rendering and images to load
    await new Promise<void>((resolve) => {
      root.render(
        React.createElement(React.StrictMode, null,
          React.createElement(CertificateTemplate, {
            userName: data.userName,
            role: data.role,
            date: data.date,
            certId: data.certId || 'NEX-CERT-IDENTITY-X'
          })
        )
      );
      // Wait for React to finish rendering and for any images/fonts to potentially settle
      setTimeout(resolve, 1000);
    });

    const target = document.getElementById('certificate-render-node');
    if (!target) throw new Error("Render node not found");

    // 3. Capture with html2canvas
    const canvas = await html2canvas(target, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL('image/png');

    // 4. Generate PDF with jsPDF
    // Proportions: 1180 x 728
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [1180, 728],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, 1180, 728);
    
    // 5. Trigger download
    pdf.save(`Nexvoro_Credential_${data.userName.replace(/\s+/g, '_')}.pdf`);

    // 6. Cleanup
    root.unmount();
    document.body.removeChild(container);

  } catch (error) {
    console.error("[Certificate Generator] Client-side synthesis failed:", error);
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    throw error;
  }
};
