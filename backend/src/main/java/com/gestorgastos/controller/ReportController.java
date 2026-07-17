package com.gestorgastos.controller;

import com.gestorgastos.dto.CategoryReportDto;
import com.gestorgastos.dto.TrendResponse;
import com.gestorgastos.model.TransactionType;
import com.gestorgastos.model.User;
import com.gestorgastos.service.ReportService;
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
}
