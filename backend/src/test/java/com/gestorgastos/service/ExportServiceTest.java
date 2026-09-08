package com.gestorgastos.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.gestorgastos.dto.CategoryReportDto;
import com.gestorgastos.dto.TrendResponse;
import com.gestorgastos.model.*;
import com.gestorgastos.repository.TransactionRepository;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ExportServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private ExportService exportService;

    private User user;
    private Account account;
    private Category category;
    private Transaction transaction1;
    private Transaction transaction2;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("user@test.com").firstName("Facundo").build();
        account = Account.builder().id(10L).user(user).name("Mercado Pago").currency("ARS").balance(new BigDecimal("50000.00")).build();
        category = Category.builder().id(100L).user(user).name("Supermercado").icon("cart").build();

        transaction1 = Transaction.builder()
                .id(1L)
                .account(account)
                .category(category)
                .amount(new BigDecimal("1500.50"))
                .type(TransactionType.EXPENSE)
                .description("Compras Coto")
                .transactionDate(OffsetDateTime.now())
                .build();

        transaction2 = Transaction.builder()
                .id(2L)
                .account(account)
                .category(category)
                .amount(new BigDecimal("80000.00"))
                .type(TransactionType.INCOME)
                .description("Cobro de sueldo")
                .transactionDate(OffsetDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Debe exportar transacciones a formato CSV correctamente con encabezados y datos")
    void testExportTransactionsToCsv() throws Exception {
        when(transactionRepository.findUserTransactionsFiltered(eq(1L), any(), any(), any(), any(), any()))
                .thenReturn(List.of(transaction1, transaction2));

        StringWriter writer = new StringWriter();
        exportService.exportTransactionsToCsv(1L, null, null, null, null, null, writer);

        String csvOutput = writer.toString();
        assertNotNull(csvOutput);
        assertTrue(csvOutput.contains("ID,Fecha,Descripción,Cuenta,Moneda,Categoría,Tipo,Monto"));
        assertTrue(csvOutput.contains("Compras Coto"));
        assertTrue(csvOutput.contains("Mercado Pago"));
        assertTrue(csvOutput.contains("1500.50"));
        assertTrue(csvOutput.contains("Cobro de sueldo"));
        assertTrue(csvOutput.contains("80000.00"));
    }

    @Test
    @DisplayName("Debe exportar transacciones a formato Excel .xlsx válido y con estructura esperada")
    void testExportTransactionsToExcel() throws Exception {
        when(transactionRepository.findUserTransactionsFiltered(eq(1L), any(), any(), any(), any(), any()))
                .thenReturn(List.of(transaction1, transaction2));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        exportService.exportTransactionsToExcel(1L, null, null, null, null, null, out);

        byte[] bytes = out.toByteArray();
        assertTrue(bytes.length > 0);

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            Sheet sheet = workbook.getSheet("Movimientos");
            assertNotNull(sheet);
            assertEquals("Reporte de Movimientos Financieros", sheet.getRow(0).getCell(0).getStringCellValue());
            assertEquals("ID", sheet.getRow(3).getCell(0).getStringCellValue());
            assertEquals("Monto", sheet.getRow(3).getCell(7).getStringCellValue());
            // Data rows: row 4 is transaction 1, row 5 is transaction 2, row 6 is total
            assertEquals(1.0, sheet.getRow(4).getCell(0).getNumericCellValue());
            assertEquals("Compras Coto", sheet.getRow(4).getCell(2).getStringCellValue());
            assertEquals(1500.50, sheet.getRow(4).getCell(7).getNumericCellValue());
            assertEquals(81500.50, sheet.getRow(6).getCell(7).getNumericCellValue());
        }
    }

    @Test
    @DisplayName("Debe exportar reporte mensual por categoría a Excel .xlsx correctamente")
    void testExportMonthlyReportToExcel() throws Exception {
        List<CategoryReportDto> reports = List.of(
                new CategoryReportDto(100L, "Supermercado", new BigDecimal("15000.00"), 60.0),
                new CategoryReportDto(101L, "Servicios", new BigDecimal("10000.00"), 40.0)
        );

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        exportService.exportMonthlyReportToExcel(reports, "ARS", out);

        byte[] bytes = out.toByteArray();
        assertTrue(bytes.length > 0);

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            Sheet sheet = workbook.getSheet("Resumen Mensual");
            assertNotNull(sheet);
            assertEquals("ID Categoría", sheet.getRow(2).getCell(0).getStringCellValue());
            assertEquals("Categoría", sheet.getRow(2).getCell(1).getStringCellValue());
            assertEquals("Supermercado", sheet.getRow(3).getCell(1).getStringCellValue());
            assertEquals(15000.00, sheet.getRow(3).getCell(2).getNumericCellValue());
            assertEquals(25000.00, sheet.getRow(5).getCell(2).getNumericCellValue()); // Total
        }
    }

    @Test
    @DisplayName("Debe exportar reporte de tendencias a Excel .xlsx correctamente")
    void testExportTrendReportToExcel() throws Exception {
        List<TrendResponse> trends = List.of(
                new TrendResponse("Ene 2026", new BigDecimal("200000.00"), new BigDecimal("120000.00")),
                new TrendResponse("Feb 2026", new BigDecimal("220000.00"), new BigDecimal("130000.00"))
        );

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        exportService.exportTrendReportToExcel(trends, "ARS", out);

        byte[] bytes = out.toByteArray();
        assertTrue(bytes.length > 0);

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            Sheet sheet = workbook.getSheet("Evolución Temporal");
            assertNotNull(sheet);
            assertEquals("Período", sheet.getRow(2).getCell(0).getStringCellValue());
            assertEquals("Ingresos", sheet.getRow(2).getCell(1).getStringCellValue());
            assertEquals("Egresos", sheet.getRow(2).getCell(2).getStringCellValue());
            assertEquals("Balance Neto", sheet.getRow(2).getCell(3).getStringCellValue());
            assertEquals("Ene 2026", sheet.getRow(3).getCell(0).getStringCellValue());
            assertEquals(200000.00, sheet.getRow(3).getCell(1).getNumericCellValue());
            assertEquals(120000.00, sheet.getRow(3).getCell(2).getNumericCellValue());
            assertEquals(80000.00, sheet.getRow(3).getCell(3).getNumericCellValue());
        }
    }
}
