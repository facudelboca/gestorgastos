package com.gestorgastos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record AccountRequest(
        @NotBlank(message = "El nombre de la cuenta no puede estar vacío")
        @Size(max = 100, message = "El nombre de la cuenta no puede superar los 100 caracteres")
        String name,

        @NotNull(message = "El saldo inicial es requerido")
        BigDecimal balance,

        @NotBlank(message = "El código de moneda es requerido")
        @Size(min = 3, max = 3, message = "El código de moneda debe tener exactamente 3 caracteres")
        String currency
) {}
