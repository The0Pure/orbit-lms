// src/utils/certificate.js
// Generates Orbit-branded PDF certificates using jsPDF

import jsPDF from 'jspdf';

// Orbit Brand Colors
const NAVY = '#2D3347';
const CREAM = '#D5CFC1';
const GOLD = '#B8965A';
const GOLD_DARK = '#8B6F4E';
const BG = '#F5F2ED';

// Helper: hex to RGB array
const hexToRGB = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

export const generateCertificatePDF = ({ studentName, courseName, instructorName, completionDate, certificateId }) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297; // A4 landscape width
  const H = 210; // A4 landscape height

  // ── Background ──
  doc.setFillColor(...hexToRGB(BG));
  doc.rect(0, 0, W, H, 'F');

  // ── Navy top band ──
  doc.setFillColor(...hexToRGB(NAVY));
  doc.rect(0, 0, W, 18, 'F');

  // ── Navy bottom band ──
  doc.setFillColor(...hexToRGB(NAVY));
  doc.rect(0, H - 18, W, 18, 'F');

  // ── Gold accent left bar ──
  doc.setFillColor(...hexToRGB(GOLD));
  doc.rect(0, 18, 6, H - 36, 'F');

  // ── Gold accent right bar ──
  doc.setFillColor(...hexToRGB(GOLD));
  doc.rect(W - 6, 18, 6, H - 36, 'F');

  // ── Orbit Logo (SVG-like circles drawn with jsPDF) ──
  const logoX = W / 2;
  const logoY = 42;
  // Outer circle — navy
  doc.setFillColor(...hexToRGB(CREAM));
  doc.circle(logoX, logoY, 12, 'F');
  // Inner arc shape — navy stroke
  doc.setDrawColor(...hexToRGB(NAVY));
  doc.setLineWidth(1.8);
  // Draw arc manually as lines
  const steps = 60;
  const startAngle = 200 * (Math.PI / 180);
  const endAngle = 340 * (Math.PI / 180);
  const radius = 7;
  for (let i = 0; i < steps; i++) {
    const a1 = startAngle + (endAngle - startAngle) * (i / steps);
    const a2 = startAngle + (endAngle - startAngle) * ((i + 1) / steps);
    doc.line(
      logoX + radius * Math.cos(a1), logoY + radius * Math.sin(a1),
      logoX + radius * Math.cos(a2), logoY + radius * Math.sin(a2)
    );
  }
  // Center dot
  doc.setFillColor(...hexToRGB(NAVY));
  doc.circle(logoX, logoY + 3.5, 1.2, 'F');

  // ── ORBIT text in top band ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...hexToRGB(CREAM));
  doc.text('ORBIT LEARNING', W / 2, 12, { align: 'center' });

  // ── Certificate header ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...hexToRGB(GOLD));
  doc.text('CERTIFICATE OF COMPLETION', W / 2, 63, { align: 'center' });

  // ── Decorative gold line ──
  doc.setDrawColor(...hexToRGB(GOLD));
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 40, 67, W / 2 + 40, 67);

  // ── "This is to certify that" ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...hexToRGB(NAVY));
  doc.text('This is to certify that', W / 2, 79, { align: 'center' });

  // ── Student Name ──
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(30);
  doc.setTextColor(...hexToRGB(NAVY));
  doc.text(studentName, W / 2, 96, { align: 'center' });

  // ── Name underline ──
  doc.setDrawColor(...hexToRGB(GOLD));
  doc.setLineWidth(0.4);
  const nameWidth = doc.getTextWidth(studentName) * 0.85;
  doc.line(W / 2 - nameWidth / 2, 100, W / 2 + nameWidth / 2, 100);

  // ── "has successfully completed" ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...hexToRGB(NAVY));
  doc.text('has successfully completed', W / 2, 112, { align: 'center' });

  // ── Course Name ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...hexToRGB(NAVY));
  doc.text(courseName, W / 2, 124, { align: 'center' });

  // ── Instructor & Date columns ──
  // Left: Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Completion Date', 72, 145, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...hexToRGB(NAVY));
  doc.text(completionDate, 72, 153, { align: 'center' });
  doc.setDrawColor(...hexToRGB(GOLD));
  doc.setLineWidth(0.4);
  doc.line(42, 156, 102, 156);

  // Right: Instructor
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Instructor', W - 72, 145, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...hexToRGB(NAVY));
  doc.text(instructorName, W - 72, 153, { align: 'center' });
  doc.setDrawColor(...hexToRGB(GOLD));
  doc.setLineWidth(0.4);
  doc.line(W - 102, 156, W - 42, 156);

  // ── Certificate ID in bottom band ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...hexToRGB(CREAM));
  doc.text(`Certificate ID: ${certificateId}`, 14, H - 7);
  doc.text('orbit-learning.com', W - 14, H - 7, { align: 'right' });

  // ── Seal circle ──
  doc.setFillColor(...hexToRGB(GOLD));
  doc.circle(W / 2, H - 18, 9, 'F');
  doc.setFillColor(...hexToRGB(GOLD_DARK));
  doc.circle(W / 2, H - 18, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(255, 255, 255);
  doc.text('ORBIT', W / 2, H - 16.5, { align: 'center' });

  return doc;
};

export const downloadCertificate = (data) => {
  const doc = generateCertificatePDF(data);
  doc.save(`Orbit_Certificate_${data.studentName.replace(/\s+/g, '_')}.pdf`);
};

export const getCertificateBlob = (data) => {
  const doc = generateCertificatePDF(data);
  return doc.output('blob');
};
