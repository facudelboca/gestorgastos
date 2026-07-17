package com.gestorgastos.service;

import com.gestorgastos.dto.CategoryReportDto;
import com.gestorgastos.exception.ResourceNotFoundException;
import com.gestorgastos.model.Category;
import com.gestorgastos.model.Transaction;
import com.gestorgastos.model.TransactionType;
import com.gestorgastos.repository.TransactionRepository;
import com.gestorgastos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ExchangeRateService exchangeRateService;

    @Transactional(readOnly = true)
    public List<CategoryReportDto> getMonthlyReport(Long userId, String targetCurrency) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("No se encontró el usuario con ID: " + userId);
        }

        String baseCurrency = (targetCurrency == null || targetCurrency.isBlank()) ? "USD" : targetCurrency.toUpperCase();

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime start = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime end = now.withDayOfMonth(now.toLocalDate().lengthOfMonth())
                .withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        // Obtener transacciones de tipo gasto del mes
        List<Transaction> transactions = transactionRepository.findByAccountUserIdAndTypeAndTransactionDateBetween(
                userId,
                TransactionType.EXPENSE,
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
}
