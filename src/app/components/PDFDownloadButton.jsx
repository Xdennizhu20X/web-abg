'use client';

export default function PDFDownloadButton({ targetRef }) {
  const handleDownloadPDF = async () => {
    if (typeof window === 'undefined') return;

    try {
      // Importación dinámica de html2pdf para evitar problemas de SSR
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: 0,
        filename: 'certificado.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
      html2pdf().set(opt).from(targetRef.current).save();
    } catch (error) {
      console.error('Error al generar PDF:', error);
    }
  };

  return (
    <button onClick={handleDownloadPDF} style={{ margin: '20px', padding: '10px 20px' }}>
      Descargar PDF
    </button>
  );
}
