import React from 'react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import { displayFromISO } from '../utils/date';

const ExportBudgets = ({ budgets }) => {
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };


  const handleExportCSV = () => {
    if (!budgets || budgets.length === 0) {
      alert('No hay presupuestos para exportar');
      return;
    }

    const csvData = budgets.map((b) => ({
      Categoría: b.category,
      Mes: b.month,
      Límite: b.limit,
      Gastado: b.spent || 0,
      Restante: b.remaining || b.limit,
      Porcentaje: b.percentage.toFixed(2) + '%',
    }));

    const csv = Papa.unparse(csvData, { header: true, delimiter: ',' });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `presupuestos_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!budgets || budgets.length === 0) {
      alert('No hay presupuestos para exportar');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    doc.setFontSize(18);
    doc.text('Reporte de Presupuestos', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-AR')}`, 20, yPosition);
    yPosition += 10;

    const columnWidths = {
      categoria: 40,
      mes: 30,
      limite: 30,
      gastado: 30,
      restante: 30,
      porcentaje: 20,
    };
    const totalWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);
    const startX = (pageWidth - totalWidth) / 2;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(220, 220, 220);

    let xPos = startX;
    doc.rect(startX, yPosition - 5, totalWidth, 8, 'F');
    doc.text('Categoría', xPos, yPosition);
    xPos += columnWidths.categoria;
    doc.text('Mes', xPos, yPosition);
    xPos += columnWidths.mes;
    doc.text('Límite', xPos, yPosition);
    xPos += columnWidths.limite;
    doc.text('Gastado', xPos, yPosition);
    xPos += columnWidths.gastado;
    doc.text('Restante', xPos, yPosition);
    xPos += columnWidths.restante;
    doc.text('%', xPos, yPosition);

    yPosition += 8;
    doc.setFontSize(9);

    budgets.forEach((b, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(startX, yPosition - 4, totalWidth, 7, 'F');
      }

      xPos = startX;
      doc.text(b.category, xPos, yPosition);
      xPos += columnWidths.categoria;
      doc.text(b.month, xPos, yPosition);
      xPos += columnWidths.mes;
      doc.text(formatCurrency(b.limit), xPos, yPosition);
      xPos += columnWidths.limite;
      doc.text(formatCurrency(b.spent || 0), xPos, yPosition);
      xPos += columnWidths.gastado;
      doc.text(formatCurrency(b.remaining || b.limit), xPos, yPosition);
      xPos += columnWidths.restante;
      doc.text(b.percentage.toFixed(2) + '%', xPos, yPosition);

      yPosition += 7;
    });

    doc.save(`presupuestos_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="flex gap-3 mt-4">
      <button
        onClick={handleExportCSV}
        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition"
        title="Exportar presupuestos a CSV"
      >
        📊 Exportar CSV
      </button>
      <button
        onClick={handleExportPDF}
        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
        title="Exportar presupuestos a PDF"
      >
        📄 Exportar PDF
      </button>
    </div>
  );
};

export default ExportBudgets;
