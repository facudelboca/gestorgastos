package com.gestorgastos.controller;

import com.gestorgastos.dto.CategoryReportDto;
import com.gestorgastos.dto.TrendResponse;
import com.gestorgastos.model.TransactionType;
import com.gestorgastos.model.User;
import com.gestorgastos.service.ExportService;
import com.gestorgastos.service.ReportService;
import com.lowagie.text.DocumentException;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final ExportService exportService;

    @GetMapping("/monthly")
    public ResponseEntity<List<CategoryReportDto>> getMonthlyReport(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false, defaultValue = "ARS") String currency,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
            @RequestParam(required = false) TransactionType type) {
        
        List<CategoryReportDto> report = reportService.getMonthlyReport(
                user.getId(), currency, startDate, endDate, type
        );
        return ResponseEntity.ok(report);
    }

    @GetMapping("/trend")
    public ResponseEntity<List<TrendResponse>> getTrendReport(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false, defaultValue = "ARS") String currency,
            @RequestParam(required = false, defaultValue = "6_MONTHS") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime customStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime customEnd) {
        
        List<TrendResponse> report = reportService.getTrendReport(
                user.getId(), currency, period, customStart, customEnd
        );
        return ResponseEntity.ok(report);
    }

    @GetMapping("/export/pdf")
    public void exportToPdf(@AuthenticationPrincipal User user, HttpServletResponse response) 
            throws IOException, DocumentException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=\"reporte_transacciones.pdf\"");
        exportService.exportToPdf(user.getId(), response.getOutputStream());
    }

    @GetMapping("/export/csv")
    public void exportToCsv(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
            HttpServletResponse response) throws IOException {
        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"reporte_transacciones.csv\"");
        exportService.exportTransactionsToCsv(user.getId(), accountId, categoryId, type, startDate, endDate, response.getWriter());
    }

    @GetMapping("/export/excel")
    public void exportToExcel(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
            HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"reporte_transacciones.xlsx\"");
        exportService.exportTransactionsToExcel(user.getId(), accountId, categoryId, type, startDate, endDate, response.getOutputStream());
    }

    @GetMapping("/monthly/export/excel")
    public void exportMonthlyToExcel(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false, defaultValue = "ARS") String currency,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
            @RequestParam(required = false) TransactionType type,
            HttpServletResponse response) throws IOException {
        List<CategoryReportDto> reports = reportService.getMonthlyReport(user.getId(), currency, startDate, endDate, type);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"reporte_mensual_categorias.xlsx\"");
        exportService.exportMonthlyReportToExcel(reports, currency, response.getOutputStream());
    }

    @GetMapping("/trend/export/excel")
    public void exportTrendToExcel(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false, defaultValue = "ARS") String currency,
            @RequestParam(required = false, defaultValue = "6_MONTHS") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime customStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime customEnd,
            HttpServletResponse response) throws IOException {
        List<TrendResponse> trends = reportService.getTrendReport(user.getId(), currency, period, customStart, customEnd);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=\"reporte_evolucion_temporal.xlsx\"");
        exportService.exportTrendReportToExcel(trends, currency, response.getOutputStream());
    }
}
