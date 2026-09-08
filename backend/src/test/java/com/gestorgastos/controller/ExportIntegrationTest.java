package com.gestorgastos.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.gestorgastos.harness.BaseIntegrationTest;
import com.gestorgastos.model.*;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

class ExportIntegrationTest extends BaseIntegrationTest {

    private User userA;
    private User userB;
    private Account accountA;
    private Account accountB;
    private Category categoryFood;
    private Category categoryTransport;

    @BeforeEach
    void setupData() {
        userA = fixtures.createUser("alice@test.com", "Alice");
        userB = fixtures.createUser("bob@test.com", "Bob");

        accountA = fixtures.createAccount(userA, "Banco Galicia", new BigDecimal("100000.00"), "ARS");
        accountB = fixtures.createAccount(userB, "Banco Santander", new BigDecimal("50000.00"), "ARS");

        categoryFood = fixtures.createCategory(userA, "Alimentos", "food");
        categoryTransport = fixtures.createCategory(userA, "Transporte", "car");

        // Transacciones para Alice
        fixtures.createTransaction(accountA, categoryFood, new BigDecimal("2500.00"), TransactionType.EXPENSE, "Cena Pizza", OffsetDateTime.now().minusDays(1));
        fixtures.createTransaction(accountA, categoryTransport, new BigDecimal("800.00"), TransactionType.EXPENSE, "Carga SUBE", OffsetDateTime.now().minusDays(2));
        fixtures.createTransaction(accountA, categoryFood, new BigDecimal("50000.00"), TransactionType.INCOME, "Freelance", OffsetDateTime.now().minusDays(3));

        // Transacción para Bob (no debe verse en las exportaciones de Alice)
        fixtures.createTransaction(accountB, categoryFood, new BigDecimal("9999.00"), TransactionType.EXPENSE, "Bob Secreto", OffsetDateTime.now());
    }

    @Test
    @DisplayName("GET /api/reports/export/csv debe exportar transacciones en formato CSV")
    void testExportReportsToCsv() throws Exception {
        HttpHeaders headers = authHelper.createAuthHeaders(userA);

        MvcResult result = mockMvc.perform(get("/api/reports/export/csv").headers(headers))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"reporte_transacciones.csv\""))
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        assertNotNull(responseContent);
        assertTrue(responseContent.contains("ID,Fecha,Descripción,Cuenta,Moneda,Categoría,Tipo,Monto"));
        assertTrue(responseContent.contains("Cena Pizza"));
        assertTrue(responseContent.contains("Carga SUBE"));
        assertTrue(responseContent.contains("Freelance"));
        assertFalse(responseContent.contains("Bob Secreto"), "No debe contener datos de otros usuarios");
    }

    @Test
    @DisplayName("GET /api/reports/export/excel debe exportar un archivo .xlsx válido")
    void testExportReportsToExcel() throws Exception {
        HttpHeaders headers = authHelper.createAuthHeaders(userA);

        MvcResult result = mockMvc.perform(get("/api/reports/export/excel").headers(headers))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"reporte_transacciones.xlsx\""))
                .andReturn();

        byte[] content = result.getResponse().getContentAsByteArray();
        assertTrue(content.length > 0);

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(content))) {
            Sheet sheet = workbook.getSheet("Movimientos");
            assertNotNull(sheet);
            assertEquals("Reporte de Movimientos Financieros", sheet.getRow(0).getCell(0).getStringCellValue());
            assertEquals("ID", sheet.getRow(3).getCell(0).getStringCellValue());
            assertEquals("Monto", sheet.getRow(3).getCell(7).getStringCellValue());
            // 3 transacciones registradas + fila de encabezado + total
            assertTrue(sheet.getLastRowNum() >= 7);
        }
    }

    @Test
    @DisplayName("GET /api/transactions/export/csv y /excel deben funcionar desde endpoint de transacciones")
    void testTransactionControllerExports() throws Exception {
        HttpHeaders headers = authHelper.createAuthHeaders(userA);

        // Test CSV
        mockMvc.perform(get("/api/transactions/export/csv").headers(headers))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"transacciones.csv\""));

        // Test Excel
        mockMvc.perform(get("/api/transactions/export/excel").headers(headers))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"transacciones.xlsx\""));
    }

    @Test
    @DisplayName("GET /api/reports/monthly/export/excel debe generar reporte mensual en Excel")
    void testExportMonthlyReportToExcel() throws Exception {
        HttpHeaders headers = authHelper.createAuthHeaders(userA);

        MvcResult result = mockMvc.perform(get("/api/reports/monthly/export/excel")
                        .param("currency", "ARS")
                        .headers(headers))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"reporte_mensual_categorias.xlsx\""))
                .andReturn();

        byte[] content = result.getResponse().getContentAsByteArray();
        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(content))) {
            Sheet sheet = workbook.getSheet("Resumen Mensual");
            assertNotNull(sheet);
            assertEquals("ID Categoría", sheet.getRow(2).getCell(0).getStringCellValue());
        }
    }

    @Test
    @DisplayName("GET /api/reports/trend/export/excel debe generar reporte de tendencias en Excel")
    void testExportTrendReportToExcel() throws Exception {
        HttpHeaders headers = authHelper.createAuthHeaders(userA);

        MvcResult result = mockMvc.perform(get("/api/reports/trend/export/excel")
                        .param("currency", "ARS")
                        .param("period", "6_MONTHS")
                        .headers(headers))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"reporte_evolucion_temporal.xlsx\""))
                .andReturn();

        byte[] content = result.getResponse().getContentAsByteArray();
        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(content))) {
            Sheet sheet = workbook.getSheet("Evolución Temporal");
            assertNotNull(sheet);
            assertEquals("Período", sheet.getRow(2).getCell(0).getStringCellValue());
        }
    }

    @Test
    @DisplayName("Exportación con filtro por categoría debe devolver solo transacciones coincidentes")
    void testExportFilteredByCategory() throws Exception {
        HttpHeaders headers = authHelper.createAuthHeaders(userA);

        MvcResult result = mockMvc.perform(get("/api/reports/export/csv")
                        .param("categoryId", categoryTransport.getId().toString())
                        .headers(headers))
                .andExpect(status().isOk())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        assertTrue(responseContent.contains("Carga SUBE"));
        assertFalse(responseContent.contains("Cena Pizza"));
    }

    @Test
    @DisplayName("Llamada sin token de autenticación debe retornar 401/403 no autorizado")
    void testExportUnauthorized() throws Exception {
        mockMvc.perform(get("/api/reports/export/csv"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/reports/export/excel"))
                .andExpect(status().isForbidden());
    }
}
