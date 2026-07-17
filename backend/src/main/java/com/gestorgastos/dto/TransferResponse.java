package com.gestorgastos.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record TransferResponse(
        Long id,
        Long sourceAccountId,
        String sourceAccountName,
        Long destinationAccountId,
        String destinationAccountName,
        BigDecimal amount,
        String description,
        OffsetDateTime transferDate
) {}
