package com.gestorgastos.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record TransferRequest(
        @NotNull(message = "La cuenta origen es requerida")
        Long sourceAccountId,

        @NotNull(message = "La cuenta destino es requerida")
        Long destinationAccountId,

        @NotNull(message = "El monto es requerido")
        @Positive(message = "El monto debe ser estrictamente mayor a cero")
        BigDecimal amount,

        @Size(max = 255, message = "La descripción no puede superar los 255 caracteres")
        String description
) {}
