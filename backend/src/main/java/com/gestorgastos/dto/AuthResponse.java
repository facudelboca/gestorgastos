package com.gestorgastos.dto;

public record AuthResponse(
        String token,
        String email,
        String firstName
) {}
