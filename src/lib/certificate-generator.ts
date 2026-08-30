'use client';

/**
 * @fileOverview Nexvoro AI Unified PDF Generator Gateway.
 * Triggers server-side PDF synthesis via the /api/generate-certificate endpoint.
 */

export interface CertificateData {
  userName: string;
  role: string;
  score: number;
  date: string;
  certId?: string;
}

export const generateCertificatePDF = async (data: CertificateData) => {
  try {
    const response = await fetch('/api/generate-certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Synthesis failed.");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nexvoro_Mastery_${data.userName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("[PDF Gateway] Critical synthesis error:", error);
    throw error;
  }
};
