package com.gestorgastos.dto;

import com.gestorgastos.model.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CreateTransactionRequest(
        @NotNull(message = "El ID de la cuenta es requerido")
        Long accountId,

        @NotNull(message = "El ID de la categoría es requerido")
        Long categoryId,

        @NotNull(message = "El monto es requerido")
        @Positive(message = "El monto debe ser estrictamente mayor a cero")
        BigDecimal amount,

        @NotNull(message = "El tipo de transacción es requerido")
        TransactionType type,

        @Size(max = 255, message = "La descripción no puede superar los 255 caracteres")
        String description,

        OffsetDateTime transactionDate
) {}
