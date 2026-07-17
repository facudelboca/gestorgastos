package com.gestorgastos.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record BudgetResponse(
        Long id,
        Long categoryId,
        String categoryName,
        BigDecimal limitAmount,
        Integer monthPeriod,
        OffsetDateTime createdAt
) {}
