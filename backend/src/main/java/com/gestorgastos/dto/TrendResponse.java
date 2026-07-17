package com.gestorgastos.dto;

import java.math.BigDecimal;

public record TrendResponse(
        String label,
        BigDecimal income,
        BigDecimal expense
) {}
