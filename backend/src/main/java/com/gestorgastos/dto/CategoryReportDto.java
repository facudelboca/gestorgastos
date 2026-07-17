package com.gestorgastos.dto;

import java.math.BigDecimal;

public record CategoryReportDto(
        Long categoryId,
        String categoryName,
        BigDecimal totalSpent,
        double percentage
) {}
