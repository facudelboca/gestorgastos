package com.gestorgastos.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record BudgetRequest(
        @NotNull(message = "El ID de la categoría es requerido")
        Long categoryId,

        @NotNull(message = "El monto límite es requerido")
        @Positive(message = "El monto límite debe ser mayor a cero")
        BigDecimal limitAmount,

        @NotNull(message = "El período mensual (YYYYMM) es requerido")
        Integer monthPeriod
) {}
