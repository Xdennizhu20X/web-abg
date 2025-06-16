'use client';

import html2pdf from 'html2pdf.js';

export default function PDFDownloadButton({ targetRef }) {
  const handleDownloadPDF = () => {
    const opt = {
      margin: 0,
      filename: 'certificado.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(targetRef.current).save();
  };

  return (
    <button onClick={handleDownloadPDF} style={{ margin: '20px', padding: '10px 20px' }}>
      Descargar PDF
    </button>
  );
}
