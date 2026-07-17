package com.gestorgastos.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record SavingsGoalAllocationRequest(
        @NotNull(message = "El ID de la cuenta es requerido")
        Long accountId,

        @NotNull(message = "El monto a ahorrar es requerido")
        @Positive(message = "El monto a ahorrar debe ser estrictamente mayor a cero")
        BigDecimal amount
) {}
