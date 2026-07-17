package com.gestorgastos.dto;

import com.gestorgastos.model.SavingsGoalStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record SavingsGoalResponse(
        Long id,
        String title,
        BigDecimal targetAmount,
        BigDecimal currentAmount,
        LocalDate targetDate,
        SavingsGoalStatus status,
        OffsetDateTime createdAt
) {}
