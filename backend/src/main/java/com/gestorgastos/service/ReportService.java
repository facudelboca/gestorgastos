package com.gestorgastos.service;

import com.gestorgastos.dto.CategoryReportDto;
import com.gestorgastos.dto.TrendResponse;
import com.gestorgastos.exception.ResourceNotFoundException;
import com.gestorgastos.model.Category;
import com.gestorgastos.model.Transaction;
import com.gestorgastos.model.TransactionType;
import com.gestorgastos.repository.TransactionRepository;
import com.gestorgastos.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ExchangeRateService exchangeRateService;

    @Transactional(readOnly = true)
    public List<CategoryReportDto> getMonthlyReport(Long userId, String targetCurrency, OffsetDateTime startDate, OffsetDateTime endDate, TransactionType type) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("No se encontró el usuario con ID: " + userId);
        }

        String baseCurrency = (targetCurrency == null || targetCurrency.isBlank()) ? "USD" : targetCurrency.toUpperCase();
        TransactionType transactionType = type != null ? type : TransactionType.EXPENSE;

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime defaultStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime defaultEnd = now.withDayOfMonth(now.toLocalDate().lengthOfMonth())
                .withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        OffsetDateTime start = startDate != null ? startDate : defaultStart;
        OffsetDateTime end = endDate != null 
                ? endDate.withHour(23).withMinute(59).withSecond(59).withNano(999999999) 
                : defaultEnd;

        // Obtener transacciones según tipo y rango de fechas
        List<Transaction> transactions = transactionRepository.findByAccountUserIdAndTypeAndTransactionDateBetween(
                userId,
                transactionType,
                start,
                end
        );

        // Agrupar en memoria convirtiendo a la divisa unificada base
        Map<Long, String> categoryNames = new HashMap<>();
        Map<Long, BigDecimal> categorySums = new HashMap<>();
        BigDecimal totalSpentOverall = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            Category cat = t.getCategory();
            String currency = t.getAccount().getCurrency();
            
            // Convertir monto a la divisa base del reporte
            BigDecimal amountInBase = exchangeRateService.convert(t.getAmount(), currency, baseCurrency);

            categoryNames.put(cat.getId(), cat.getName());
            categorySums.put(cat.getId(), categorySums.getOrDefault(cat.getId(), BigDecimal.ZERO).add(amountInBase));
            totalSpentOverall = totalSpentOverall.add(amountInBase);
        }

        List<CategoryReportDto> report = new ArrayList<>();
        for (Map.Entry<Long, BigDecimal> entry : categorySums.entrySet()) {
            Long categoryId = entry.getKey();
            String categoryName = categoryNames.get(categoryId);
            BigDecimal totalSpent = entry.getValue().setScale(2, RoundingMode.HALF_UP);

            double percentage = 0.0;
            if (totalSpentOverall.compareTo(BigDecimal.ZERO) > 0) {
                percentage = totalSpent
                        .multiply(BigDecimal.valueOf(100))
                        .divide(totalSpentOverall, 4, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            report.add(new CategoryReportDto(categoryId, categoryName, totalSpent, percentage));
        }

        // Ordenar de mayor a menor gasto
        report.sort((r1, r2) -> r2.totalSpent().compareTo(r1.totalSpent()));

        return report;
    }

    @Transactional(readOnly = true)
    public List<TrendResponse> getHistoryTrendReport(Long userId, String targetCurrency) {
        return getTrendReport(userId, targetCurrency, "6_MONTHS", null, null);
    }

    @Transactional(readOnly = true)
    public List<TrendResponse> getTrendReport(Long userId, String targetCurrency, String period, OffsetDateTime customStart, OffsetDateTime customEnd) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("No se encontró el usuario con ID: " + userId);
        }

        String baseCurrency = (targetCurrency == null || targetCurrency.isBlank()) ? "ARS" : targetCurrency.toUpperCase();
        List<TrendResponse> trendList = new ArrayList<>();
        OffsetDateTime now = OffsetDateTime.now();

        List<OffsetDateTime[]> intervals = new ArrayList<>();
        List<String> labels = new ArrayList<>();

        if ("1_WEEK".equalsIgnoreCase(period)) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("E dd", Locale.forLanguageTag("es-ES"));
            for (int i = 6; i >= 0; i--) {
                OffsetDateTime d = now.minusDays(i);
                OffsetDateTime start = d.withHour(0).withMinute(0).withSecond(0).withNano(0);
                OffsetDateTime end = d.withHour(23).withMinute(59).withSecond(59).withNano(999999999);
                intervals.add(new OffsetDateTime[]{start, end});
                
                String label = start.format(formatter);
                label = label.substring(0, 1).toUpperCase() + label.substring(1);
                labels.add(label);
            }
        } else if ("1_MONTH".equalsIgnoreCase(period)) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
            for (int i = 3; i >= 0; i--) {
                OffsetDateTime target = now.minusWeeks(i);
                OffsetDateTime start = target.minusDays(target.getDayOfWeek().getValue() - 1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                OffsetDateTime end = start.plusDays(6).withHour(23).withMinute(59).withSecond(59).withNano(999999999);
                intervals.add(new OffsetDateTime[]{start, end});
                labels.add(start.format(formatter) + " - " + end.format(formatter));
            }
        } else if ("3_MONTHS".equalsIgnoreCase(period) || "6_MONTHS".equalsIgnoreCase(period) || "1_YEAR".equalsIgnoreCase(period)) {
            int months = 6;
            if ("3_MONTHS".equalsIgnoreCase(period)) months = 3;
            else if ("1_YEAR".equalsIgnoreCase(period)) months = 12;

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy", Locale.forLanguageTag("es-ES"));
            for (int i = months - 1; i >= 0; i--) {
                OffsetDateTime targetMonth = now.minusMonths(i);
                OffsetDateTime start = targetMonth.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                OffsetDateTime end = targetMonth.withDayOfMonth(targetMonth.toLocalDate().lengthOfMonth())
                        .withHour(23).withMinute(59).withSecond(59).withNano(999999999);
                intervals.add(new OffsetDateTime[]{start, end});

                String label = start.format(formatter);
                label = label.substring(0, 1).toUpperCase() + label.substring(1);
                labels.add(label);
            }
        } else if ("CUSTOM".equalsIgnoreCase(period) && customStart != null && customEnd != null) {
            OffsetDateTime startLimit = customStart.withHour(0).withMinute(0).withSecond(0).withNano(0);
            OffsetDateTime endLimit = customEnd.withHour(23).withMinute(59).withSecond(59).withNano(999999999);
            
            long days = java.time.temporal.ChronoUnit.DAYS.between(startLimit, endLimit);
            if (days <= 8) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("E dd", Locale.forLanguageTag("es-ES"));
                for (int i = 0; i <= days; i++) {
                    OffsetDateTime d = startLimit.plusDays(i);
                    OffsetDateTime start = d.withHour(0).withMinute(0).withSecond(0).withNano(0);
                    OffsetDateTime end = d.withHour(23).withMinute(59).withSecond(59).withNano(999999999);
                    intervals.add(new OffsetDateTime[]{start, end});
                    
                    String label = start.format(formatter);
                    label = label.substring(0, 1).toUpperCase() + label.substring(1);
                    labels.add(label);
                }
            } else if (days <= 45) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
                OffsetDateTime curr = startLimit;
                while (curr.isBefore(endLimit)) {
                    OffsetDateTime start = curr;
                    OffsetDateTime end = curr.plusDays(6).isBefore(endLimit) ? curr.plusDays(6) : endLimit;
                    intervals.add(new OffsetDateTime[]{start.withHour(0).withMinute(0), end.withHour(23).withMinute(59)});
                    labels.add(start.format(formatter) + " - " + end.format(formatter));
                    curr = curr.plusDays(7);
                }
            } else {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy", Locale.forLanguageTag("es-ES"));
                OffsetDateTime curr = startLimit.withDayOfMonth(1);
                while (curr.isBefore(endLimit)) {
                    OffsetDateTime start = curr.isBefore(startLimit) ? startLimit : curr;
                    OffsetDateTime end = curr.withDayOfMonth(curr.toLocalDate().lengthOfMonth());
                    if (end.isAfter(endLimit)) end = endLimit;
                    
                    intervals.add(new OffsetDateTime[]{start.withHour(0).withMinute(0), end.withHour(23).withMinute(59)});
                    String label = curr.format(formatter);
                    label = label.substring(0, 1).toUpperCase() + label.substring(1);
                    labels.add(label);
                    curr = curr.plusMonths(1);
                }
            }
        } else {
            return getHistoryTrendReport(userId, baseCurrency);
        }

        // Procesar sumas cambiarias
        for (int idx = 0; idx < intervals.size(); idx++) {
            OffsetDateTime[] range = intervals.get(idx);
            OffsetDateTime start = range[0];
            OffsetDateTime end = range[1];

            List<Transaction> incomes = transactionRepository.findByAccountUserIdAndTypeAndTransactionDateBetween(
                    userId, TransactionType.INCOME, start, end
            );
            List<Transaction> expenses = transactionRepository.findByAccountUserIdAndTypeAndTransactionDateBetween(
                    userId, TransactionType.EXPENSE, start, end
            );

            BigDecimal totalIncome = BigDecimal.ZERO;
            for (Transaction t : incomes) {
                totalIncome = totalIncome.add(exchangeRateService.convert(t.getAmount(), t.getAccount().getCurrency(), baseCurrency));
            }

            BigDecimal totalExpense = BigDecimal.ZERO;
            for (Transaction t : expenses) {
                totalExpense = totalExpense.add(exchangeRateService.convert(t.getAmount(), t.getAccount().getCurrency(), baseCurrency));
            }

            trendList.add(new TrendResponse(
                    labels.get(idx),
                    totalIncome.setScale(2, RoundingMode.HALF_UP),
                    totalExpense.setScale(2, RoundingMode.HALF_UP)
            ));
        }

        return trendList;
    }
}
