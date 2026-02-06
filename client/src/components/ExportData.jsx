import React from 'react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';

const ExportData = ({ transactions }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-AR');
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No hay transacciones para exportar');
      return;
    }

    const csvData = transactions.map((t) => ({
      Fecha: formatDate(t.date),
      Descripción: t.text,
      Categoría: t.category,
      Monto: t.amount,
      Tipo: t.amount > 0 ? 'Ingreso' : 'Gasto',
    }));

    const csv = Papa.unparse(csvData, {
      header: true,
      delimiter: ',',
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (transactions.length === 0) {
      alert('No hay transacciones para exportar');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Título
    doc.setFontSize(18);
    doc.text('Reporte de Transacciones', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Fecha de generación
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-AR')}`, 20, yPosition);
    yPosition += 10;

    // Tabla
    const columnWidths = {
      fecha: 30,
      descripcion: 60,
      categoria: 35,
      monto: 30,
      tipo: 25,
    };

    const totalWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);
    const startX = (pageWidth - totalWidth) / 2;

    // Encabezados
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(220, 220, 220);

    let xPos = startX;
    doc.rect(startX, yPosition - 5, totalWidth, 8, 'F');
    doc.text('Fecha', xPos, yPosition);
    xPos += columnWidths.fecha;
    doc.text('Descripción', xPos, yPosition);
    xPos += columnWidths.descripcion;
    doc.text('Categoría', xPos, yPosition);
    xPos += columnWidths.categoria;
    doc.text('Monto', xPos, yPosition);
    xPos += columnWidths.monto;
    doc.text('Tipo', xPos, yPosition);

    yPosition += 8;

    // Filas de datos
    doc.setFontSize(9);
    let totalIngreso = 0;
    let totalGasto = 0;

    transactions.forEach((t, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setTextColor(0, 0, 0);
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(startX, yPosition - 4, totalWidth, 7, 'F');
      }

      xPos = startX;
      doc.text(formatDate(t.date), xPos, yPosition);
      xPos += columnWidths.fecha;
      
      // Descripción truncada
      const desc = t.text.length > 20 ? t.text.substring(0, 20) + '...' : t.text;
      doc.text(desc, xPos, yPosition);
      xPos += columnWidths.descripcion;
      
      doc.text(t.category, xPos, yPosition);
      xPos += columnWidths.categoria;
      
      const tipo = t.amount > 0 ? 'Ingreso' : 'Gasto';
      const color = t.amount > 0 ? [0, 128, 0] : [255, 0, 0];
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(formatCurrency(Math.abs(t.amount)), xPos, yPosition, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      xPos += columnWidths.monto;
      
      doc.text(tipo, xPos, yPosition);

      if (t.amount > 0) {
        totalIngreso += t.amount;
      } else {
        totalGasto += Math.abs(t.amount);
      }

      yPosition += 7;
    });

    // Totales
    yPosition += 5;
    doc.setFontSize(10);
    doc.setFillColor(200, 220, 200);
    doc.rect(startX, yPosition - 5, totalWidth, 8, 'F');
    xPos = startX;
    doc.text('TOTALES', xPos, yPosition);
    xPos += columnWidths.fecha + columnWidths.descripcion + columnWidths.categoria;
    doc.setTextColor(0, 128, 0);
    doc.text(formatCurrency(totalIngreso), xPos, yPosition, { align: 'right' });
    xPos += columnWidths.monto;
    doc.setTextColor(0, 0, 0);

    yPosition += 8;
    doc.setFillColor(220, 200, 200);
    doc.rect(startX, yPosition - 5, totalWidth, 8, 'F');
    xPos = startX;
    doc.text('GASTOS', xPos, yPosition);
    xPos += columnWidths.fecha + columnWidths.descripcion + columnWidths.categoria;
    doc.setTextColor(255, 0, 0);
    doc.text(formatCurrency(totalGasto), xPos, yPosition, { align: 'right' });

    // Descargar PDF
    doc.save(`transacciones_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="flex gap-3 mt-4">
      <button
        onClick={handleExportCSV}
        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition"
        title="Exportar a CSV"
      >
        📊 Exportar CSV
      </button>
      <button
        onClick={handleExportPDF}
        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
        title="Exportar a PDF"
      >
        📄 Exportar PDF
      </button>
    </div>
  );
};

export default ExportData;
