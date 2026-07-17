package com.gestorgastos.dto;

import com.gestorgastos.model.TransactionType;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record TransactionResponse(
        Long id,
        Long accountId,
        String accountName,
        Long categoryId,
        String categoryName,
        BigDecimal amount,
        TransactionType type,
        String description,
        OffsetDateTime transactionDate,
        boolean budgetExceeded
) {}
