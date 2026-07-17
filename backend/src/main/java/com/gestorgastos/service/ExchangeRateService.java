package com.gestorgastos.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class ExchangeRateService {

    private static final String API_URL = "https://open.er-api.com/v6/latest/USD";
    private final RestTemplate restTemplate = new RestTemplate();

    private Map<String, BigDecimal> ratesCache = new HashMap<>();
    private Instant lastFetched = null;

    // Tasas fijas de respaldo (fallback) por si la API externa está caída o no hay internet
    private static final Map<String, BigDecimal> FALLBACK_RATES = Map.of(
            "USD", BigDecimal.ONE,
            "ARS", BigDecimal.valueOf(920.00),
            "EUR", BigDecimal.valueOf(0.92),
            "UYU", BigDecimal.valueOf(40.00),
            "BRL", BigDecimal.valueOf(5.50)
    );

    public record ExchangeRateResponse(
            String result,
            String base_code,
            Map<String, BigDecimal> rates
    ) {}

    private synchronized void updateRatesIfNeeded() {
        Instant now = Instant.now();
        // Si no se han cargado las tasas o han pasado más de 12 horas, actualizamos
        if (lastFetched == null || ChronoUnit.HOURS.between(lastFetched, now) >= 12) {
            try {
                log.info("Actualizando tasas de conversión desde API externa: {}", API_URL);
                ExchangeRateResponse response = restTemplate.getForObject(API_URL, ExchangeRateResponse.class);
                if (response != null && "success".equalsIgnoreCase(response.result()) && response.rates() != null) {
                    this.ratesCache = new HashMap<>(response.rates());
                    this.lastFetched = now;
                    log.info("Tasas de conversión actualizadas correctamente.");
                } else {
                    log.warn("La respuesta de la API de cotizaciones no fue exitosa. Usando tasas por defecto.");
                    useFallbackRates();
                }
            } catch (Exception e) {
                log.error("Error al consumir la API de cotizaciones: {}. Usando tasas de respaldo.", e.getMessage());
                useFallbackRates();
            }
        }
    }

    private void useFallbackRates() {
        this.ratesCache = new HashMap<>(FALLBACK_RATES);
        this.lastFetched = Instant.now();
    }

    private BigDecimal getRate(String currency) {
        updateRatesIfNeeded();
        BigDecimal rate = ratesCache.get(currency.toUpperCase());
        if (rate == null) {
            log.warn("Divisa no encontrada en caché: {}. Buscando en tasas de respaldo.", currency);
            rate = FALLBACK_RATES.get(currency.toUpperCase());
        }
        if (rate == null) {
            throw new IllegalArgumentException("Divisa no soportada para conversión: " + currency);
        }
        return rate;
    }

    /**
     * Convierte un monto de una divisa origen a otra destino.
     */
    public BigDecimal convert(BigDecimal amount, String from, String to) {
        if (amount == null) return BigDecimal.ZERO;
        if (from.equalsIgnoreCase(to)) return amount;

        BigDecimal fromRate = getRate(from);
        BigDecimal toRate = getRate(to);

        // Convertir monto a USD: USD = amount / rate(from)
        BigDecimal amountInUsd = amount.divide(fromRate, 8, RoundingMode.HALF_UP);
        // Convertir USD a destino: destino = USD * rate(to)
        return amountInUsd.multiply(toRate).setScale(4, RoundingMode.HALF_UP);
    }
}
