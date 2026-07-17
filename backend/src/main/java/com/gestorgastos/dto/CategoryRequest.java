package com.gestorgastos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "El nombre de la categoría es requerido")
        @Size(max = 50, message = "El nombre no puede superar los 50 caracteres")
        String name,

        @NotBlank(message = "El ícono o emoji de la categoría es requerido")
        @Size(max = 10, message = "El ícono debe ser un emoji o texto corto")
        String icon
) {}
