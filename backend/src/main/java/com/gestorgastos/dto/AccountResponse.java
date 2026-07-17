package com.gestorgastos.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record AccountResponse(
        Long id,
        String name,
        BigDecimal balance,
        String currency,
        OffsetDateTime createdAt
) {}
