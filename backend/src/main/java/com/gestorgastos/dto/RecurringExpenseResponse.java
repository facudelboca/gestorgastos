package com.gestorgastos.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record RecurringExpenseResponse(
        Long id,
        Long accountId,
        String accountName,
        Long categoryId,
        String categoryName,
        BigDecimal amount,
        String description,
        LocalDate nextExecutionDate,
        boolean active,
        OffsetDateTime createdAt
) {}
