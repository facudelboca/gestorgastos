package com.gestorgastos.controller;

import com.gestorgastos.dto.CategoryReportDto;
import com.gestorgastos.model.User;
import com.gestorgastos.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/monthly")
    public ResponseEntity<List<CategoryReportDto>> getMonthlyReport(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false, defaultValue = "USD") String currency) {
        List<CategoryReportDto> report = reportService.getMonthlyReport(user.getId(), currency);
        return ResponseEntity.ok(report);
    }
}
