import { useCallback } from 'react';

const usePDFExport = () => {
  const exportToPDF = useCallback(async (elementId: string, filename: string): Promise<boolean> => {
    try {
      // Importación dinámica de html2canvas y jsPDF
      const [html2canvas, jsPDF] = await Promise.all([import('html2canvas'), import('jspdf')]);

      const element = document.getElementById(elementId);

      if (!element) {
        console.error(`Elemento con ID '${elementId}' no encontrado`);
        return false;
      }

      // Configuración para html2canvas
      const canvas = await html2canvas.default(element, {
        scale: 2, // Mayor calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      } as any);

      const imgData = canvas.toDataURL('image/png');

      // Crear el PDF
      const pdf = new jsPDF.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Dimensiones A4 en mm
      const pdfWidth = 210;
      const pdfHeight = 297;

      // Calcular las dimensiones de la imagen
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Agregar la primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Si el contenido es más alto que una página, agregar páginas adicionales
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Descargar el PDF
      pdf.save(`${filename}.pdf`);

      return true;
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      return false;
    }
  }, []);

  return { exportToPDF };
};

export default usePDFExport;
