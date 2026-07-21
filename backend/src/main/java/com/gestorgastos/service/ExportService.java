package com.gestorgastos.service;

import com.gestorgastos.model.Transaction;
import com.gestorgastos.model.TransactionType;
import com.gestorgastos.repository.TransactionRepository;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.IOException;
import java.io.OutputStream;
import java.io.Writer;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final TransactionRepository transactionRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Transactional(readOnly = true)
    public void exportToCsv(Long userId, Writer writer) throws IOException {
        List<Transaction> transactions = transactionRepository.findByAccountUserIdOrderByTransactionDateDesc(userId);

        try (CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT.builder()
                .setHeader("ID", "Fecha", "Descripción", "Cuenta", "Moneda", "Categoría", "Tipo", "Monto")
                .build())) {

            for (Transaction t : transactions) {
                csvPrinter.printRecord(
                        t.getId(),
                        t.getTransactionDate().format(DATE_FORMATTER),
                        t.getDescription() != null ? t.getDescription() : "",
                        t.getAccount().getName(),
                        t.getAccount().getCurrency(),
                        t.getCategory().getName(),
                        t.getType().toString(),
                        t.getAmount()
                );
            }
            csvPrinter.flush();
        }
    }

    @Transactional(readOnly = true)
    public void exportToPdf(Long userId, OutputStream outputStream) throws DocumentException {
        List<Transaction> transactions = transactionRepository.findByAccountUserIdOrderByTransactionDateDesc(userId);

        Document document = new Document(PageSize.A4, 36, 36, 54, 36);
        PdfWriter.getInstance(document, outputStream);

        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
        Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);

        Paragraph title = new Paragraph("Reporte de Transacciones Financieras", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(4);
        document.add(title);

        Paragraph subtitle = new Paragraph("Generado automáticamente por el Gestor de Gastos", subTitleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(20);
        document.add(subtitle);

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{16f, 25f, 15f, 8f, 15f, 11f, 10f});

        String[] headers = {"Fecha", "Descripción", "Cuenta", "Divisa", "Categoría", "Tipo", "Monto"};
        Color primaryColor = new Color(31, 41, 55);

        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Paragraph(header, headerFont));
            cell.setBackgroundColor(primaryColor);
            cell.setPadding(6);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        for (Transaction t : transactions) {
            PdfPCell cellDate = new PdfPCell(new Paragraph(t.getTransactionDate().format(DATE_FORMATTER), bodyFont));
            cellDate.setPadding(5);
            table.addCell(cellDate);

            PdfPCell cellDesc = new PdfPCell(new Paragraph(t.getDescription() != null ? t.getDescription() : "", bodyFont));
            cellDesc.setPadding(5);
            table.addCell(cellDesc);

            PdfPCell cellAcc = new PdfPCell(new Paragraph(t.getAccount().getName(), bodyFont));
            cellAcc.setPadding(5);
            table.addCell(cellAcc);

            PdfPCell cellCur = new PdfPCell(new Paragraph(t.getAccount().getCurrency(), bodyFont));
            cellCur.setPadding(5);
            cellCur.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cellCur);

            PdfPCell cellCat = new PdfPCell(new Paragraph(t.getCategory().getName(), bodyFont));
            cellCat.setPadding(5);
            table.addCell(cellCat);

            String typeStr = t.getType() == TransactionType.INCOME ? "Ingreso" : "Egreso";
            Color typeColor = t.getType() == TransactionType.INCOME ? new Color(16, 124, 65) : new Color(209, 52, 56);
            Font typeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, typeColor);
            
            PdfPCell cellType = new PdfPCell(new Paragraph(typeStr, typeFont));
            cellType.setPadding(5);
            cellType.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cellType);

            String amountPrefix = t.getType() == TransactionType.INCOME ? "+" : "-";
            PdfPCell cellAmount = new PdfPCell(new Paragraph(amountPrefix + "$" + t.getAmount().toString(), bodyFont));
            cellAmount.setPadding(5);
            cellAmount.setHorizontalAlignment(Element.ALIGN_RIGHT);
            table.addCell(cellAmount);
        }

        document.add(table);
        document.close();
    }
}
