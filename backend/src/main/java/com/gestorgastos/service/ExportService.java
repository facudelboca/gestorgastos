package com.gestorgastos.service;

import com.gestorgastos.dto.CategoryReportDto;
import com.gestorgastos.dto.TrendResponse;
import com.gestorgastos.model.Transaction;
import com.gestorgastos.model.TransactionType;
import com.gestorgastos.repository.TransactionRepository;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.IOException;
import java.io.OutputStream;
import java.io.Writer;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final TransactionRepository transactionRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Transactional(readOnly = true)
    public void exportToCsv(Long userId, Writer writer) throws IOException {
        exportTransactionsToCsv(userId, null, null, null, null, null, writer);
    }

    @Transactional(readOnly = true)
    public void exportTransactionsToCsv(Long userId,
                                        Long accountId,
                                        Long categoryId,
                                        TransactionType type,
                                        OffsetDateTime startDate,
                                        OffsetDateTime endDate,
                                        Writer writer) throws IOException {
        List<Transaction> transactions = transactionRepository.findUserTransactionsFiltered(
                userId, accountId, categoryId, type, startDate, endDate
        );

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
    public void exportTransactionsToExcel(Long userId,
                                          Long accountId,
                                          Long categoryId,
                                          TransactionType type,
                                          OffsetDateTime startDate,
                                          OffsetDateTime endDate,
                                          OutputStream outputStream) throws IOException {
        List<Transaction> transactions = transactionRepository.findUserTransactionsFiltered(
                userId, accountId, categoryId, type, startDate, endDate
        );

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Movimientos");
            sheet.setDisplayGridlines(true);

            // Estilos
            XSSFFont titleFont = workbook.createFont();
            titleFont.setFontName("Calibri");
            titleFont.setFontHeightInPoints((short) 16);
            titleFont.setBold(true);
            titleFont.setColor(new XSSFColor(new byte[]{(byte) 31, (byte) 41, (byte) 55}, null));

            XSSFCellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);

            XSSFFont headerFont = workbook.createFont();
            headerFont.setFontName("Calibri");
            headerFont.setFontHeightInPoints((short) 11);
            headerFont.setBold(true);
            headerFont.setColor(new XSSFColor(new byte[]{(byte) 255, (byte) 255, (byte) 255}, null));

            XSSFCellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 31, (byte) 41, (byte) 55}, null));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(headerStyle);

            XSSFCellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setAlignment(HorizontalAlignment.LEFT);
            setBorders(dataStyle);

            XSSFCellStyle centerDataStyle = workbook.createCellStyle();
            centerDataStyle.setAlignment(HorizontalAlignment.CENTER);
            setBorders(centerDataStyle);

            DataFormat dataFormat = workbook.createDataFormat();
            XSSFCellStyle amountStyle = workbook.createCellStyle();
            amountStyle.setDataFormat(dataFormat.getFormat("#,##0.00"));
            amountStyle.setAlignment(HorizontalAlignment.RIGHT);
            setBorders(amountStyle);

            XSSFFont totalFont = workbook.createFont();
            totalFont.setBold(true);
            XSSFCellStyle totalLabelStyle = workbook.createCellStyle();
            totalLabelStyle.setFont(totalFont);
            totalLabelStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 243, (byte) 244, (byte) 246}, null));
            totalLabelStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            totalLabelStyle.setAlignment(HorizontalAlignment.RIGHT);
            setBorders(totalLabelStyle);

            XSSFCellStyle totalAmountStyle = workbook.createCellStyle();
            totalAmountStyle.setFont(totalFont);
            totalAmountStyle.setDataFormat(dataFormat.getFormat("#,##0.00"));
            totalAmountStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 243, (byte) 244, (byte) 246}, null));
            totalAmountStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            totalAmountStyle.setAlignment(HorizontalAlignment.RIGHT);
            setBorders(totalAmountStyle);

            // Titulo
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Reporte de Movimientos Financieros");
            titleCell.setCellStyle(titleStyle);

            Row metaRow = sheet.createRow(1);
            Cell metaCell = metaRow.createCell(0);
            metaCell.setCellValue("Generado el: " + OffsetDateTime.now().format(DATE_FORMATTER) + " | Total registros: " + transactions.size());

            // Cabeceras de tabla
            String[] headers = {"ID", "Fecha", "Descripción", "Cuenta", "Moneda", "Categoría", "Tipo", "Monto"};
            Row headerRow = sheet.createRow(3);
            headerRow.setHeightInPoints(24);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Filas de datos
            int rowIndex = 4;
            BigDecimal totalAmount = BigDecimal.ZERO;
            for (Transaction t : transactions) {
                Row row = sheet.createRow(rowIndex++);
                
                Cell c0 = row.createCell(0);
                c0.setCellValue(t.getId());
                c0.setCellStyle(centerDataStyle);

                Cell c1 = row.createCell(1);
                c1.setCellValue(t.getTransactionDate().format(DATE_FORMATTER));
                c1.setCellStyle(centerDataStyle);

                Cell c2 = row.createCell(2);
                c2.setCellValue(t.getDescription() != null ? t.getDescription() : "");
                c2.setCellStyle(dataStyle);

                Cell c3 = row.createCell(3);
                c3.setCellValue(t.getAccount().getName());
                c3.setCellStyle(dataStyle);

                Cell c4 = row.createCell(4);
                c4.setCellValue(t.getAccount().getCurrency());
                c4.setCellStyle(centerDataStyle);

                Cell c5 = row.createCell(5);
                c5.setCellValue(t.getCategory().getName());
                c5.setCellStyle(dataStyle);

                Cell c6 = row.createCell(6);
                c6.setCellValue(t.getType().toString());
                c6.setCellStyle(centerDataStyle);

                Cell c7 = row.createCell(7);
                double amt = t.getAmount().doubleValue();
                c7.setCellValue(amt);
                c7.setCellStyle(amountStyle);

                totalAmount = totalAmount.add(t.getAmount());
            }

            // Fila de totales
            Row totalRow = sheet.createRow(rowIndex);
            for (int i = 0; i < 7; i++) {
                Cell cell = totalRow.createCell(i);
                cell.setCellStyle(totalLabelStyle);
                if (i == 6) {
                    cell.setCellValue("Total:");
                }
            }
            Cell totalAmountCell = totalRow.createCell(7);
            totalAmountCell.setCellValue(totalAmount.doubleValue());
            totalAmountCell.setCellStyle(totalAmountStyle);

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, Math.max(sheet.getColumnWidth(i) + 1024, 3000));
            }

            workbook.write(outputStream);
        }
    }

    public void exportMonthlyReportToExcel(List<CategoryReportDto> reports, String currency, OutputStream outputStream) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Resumen Mensual");
            sheet.setDisplayGridlines(true);

            XSSFFont titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 15);
            XSSFCellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);

            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Reporte de Gastos por Categoría (" + (currency != null ? currency : "ARS") + ")");
            titleCell.setCellStyle(titleStyle);

            XSSFFont headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(new XSSFColor(new byte[]{(byte) 255, (byte) 255, (byte) 255}, null));
            XSSFCellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 31, (byte) 41, (byte) 55}, null));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            setBorders(headerStyle);

            XSSFCellStyle dataStyle = workbook.createCellStyle();
            setBorders(dataStyle);

            XSSFCellStyle centerDataStyle = workbook.createCellStyle();
            centerDataStyle.setAlignment(HorizontalAlignment.CENTER);
            setBorders(centerDataStyle);

            DataFormat dataFormat = workbook.createDataFormat();
            XSSFCellStyle amountStyle = workbook.createCellStyle();
            amountStyle.setDataFormat(dataFormat.getFormat("#,##0.00"));
            amountStyle.setAlignment(HorizontalAlignment.RIGHT);
            setBorders(amountStyle);

            XSSFCellStyle percentStyle = workbook.createCellStyle();
            percentStyle.setDataFormat(dataFormat.getFormat("0.00%"));
            percentStyle.setAlignment(HorizontalAlignment.RIGHT);
            setBorders(percentStyle);

            String[] headers = {"ID Categoría", "Categoría", "Total Gastado", "Porcentaje"};
            Row headerRow = sheet.createRow(2);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 3;
            BigDecimal totalSum = BigDecimal.ZERO;
            for (CategoryReportDto dto : reports) {
                Row row = sheet.createRow(rowIdx++);
                Cell c0 = row.createCell(0);
                c0.setCellValue(dto.categoryId() != null ? dto.categoryId() : 0);
                c0.setCellStyle(centerDataStyle);

                Cell c1 = row.createCell(1);
                c1.setCellValue(dto.categoryName());
                c1.setCellStyle(dataStyle);

                Cell c2 = row.createCell(2);
                c2.setCellValue(dto.totalSpent().doubleValue());
                c2.setCellStyle(amountStyle);

                Cell c3 = row.createCell(3);
                c3.setCellValue(dto.percentage() / 100.0);
                c3.setCellStyle(percentStyle);

                totalSum = totalSum.add(dto.totalSpent());
            }

            Row totalRow = sheet.createRow(rowIdx);
            Cell t0 = totalRow.createCell(0);
            t0.setCellStyle(dataStyle);
            Cell t1 = totalRow.createCell(1);
            t1.setCellValue("Total General");
            t1.setCellStyle(headerStyle);
            Cell t2 = totalRow.createCell(2);
            t2.setCellValue(totalSum.doubleValue());
            t2.setCellStyle(amountStyle);
            Cell t3 = totalRow.createCell(3);
            t3.setCellValue(1.0);
            t3.setCellStyle(percentStyle);

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
        }
    }

    public void exportTrendReportToExcel(List<TrendResponse> trends, String currency, OutputStream outputStream) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("Evolución Temporal");
            sheet.setDisplayGridlines(true);

            XSSFFont titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 15);
            XSSFCellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);

            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Evolución de Ingresos vs Egresos (" + (currency != null ? currency : "ARS") + ")");
            titleCell.setCellStyle(titleStyle);

            XSSFFont headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(new XSSFColor(new byte[]{(byte) 255, (byte) 255, (byte) 255}, null));
            XSSFCellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 31, (byte) 41, (byte) 55}, null));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            setBorders(headerStyle);

            XSSFCellStyle centerDataStyle = workbook.createCellStyle();
            centerDataStyle.setAlignment(HorizontalAlignment.CENTER);
            setBorders(centerDataStyle);

            DataFormat dataFormat = workbook.createDataFormat();
            XSSFCellStyle amountStyle = workbook.createCellStyle();
            amountStyle.setDataFormat(dataFormat.getFormat("#,##0.00"));
            amountStyle.setAlignment(HorizontalAlignment.RIGHT);
            setBorders(amountStyle);

            String[] headers = {"Período", "Ingresos", "Egresos", "Balance Neto"};
            Row headerRow = sheet.createRow(2);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 3;
            for (TrendResponse item : trends) {
                Row row = sheet.createRow(rowIdx++);
                Cell c0 = row.createCell(0);
                c0.setCellValue(item.label());
                c0.setCellStyle(centerDataStyle);

                Cell c1 = row.createCell(1);
                c1.setCellValue(item.income() != null ? item.income().doubleValue() : 0.0);
                c1.setCellStyle(amountStyle);

                Cell c2 = row.createCell(2);
                c2.setCellValue(item.expense() != null ? item.expense().doubleValue() : 0.0);
                c2.setCellStyle(amountStyle);

                BigDecimal net = (item.income() != null ? item.income() : BigDecimal.ZERO)
                        .subtract(item.expense() != null ? item.expense() : BigDecimal.ZERO);
                Cell c3 = row.createCell(3);
                c3.setCellValue(net.doubleValue());
                c3.setCellStyle(amountStyle);
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
        }
    }

    private void setBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
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
