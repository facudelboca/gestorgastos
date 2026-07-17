package com.gestorgastos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record SavingsGoalRequest(
        @NotBlank(message = "El título de la meta de ahorro no puede estar vacío")
        @Size(max = 100, message = "El título no puede superar los 100 caracteres")
        String title,

        @NotNull(message = "El monto objetivo es requerido")
        @Positive(message = "El monto objetivo debe ser mayor a cero")
        BigDecimal targetAmount,

        @NotNull(message = "La fecha límite es requerida")
        LocalDate targetDate
) {}
