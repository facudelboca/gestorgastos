package com.gestorgastos.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.gestorgastos.dto.CategoryReportDto;
import com.gestorgastos.dto.TrendResponse;
import com.gestorgastos.model.*;
import com.gestorgastos.repository.TransactionRepository;
import com.gestorgastos.repository.UserRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class ReportServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExchangeRateService exchangeRateService;

    @InjectMocks
    private ReportService reportService;

    private User user;
    private Account accountArs;
    private Category comida;
    private Category servicios;

    @BeforeEach
    public void setUp() {
        user = User.builder().id(1L).email("user@test.com").firstName("Test").build();
        
        accountArs = Account.builder()
                .id(1L)
                .name("Efectivo Pesos")
                .currency("ARS")
                .balance(BigDecimal.valueOf(100000))
                .user(user)
                .build();
                
        comida = Category.builder().id(1L).name("Comida").icon("🍔").build();
        servicios = Category.builder().id(2L).name("Servicios").icon("🔌").build();
    }

    @Test
    public void testGetMonthlyReport_shouldGroupAndConvertAmounts() {
        // GIVEN
        when(userRepository.existsById(1L)).thenReturn(true);
        
        Transaction tx1 = Transaction.builder()
                .id(1L)
                .account(accountArs)
                .category(comida)
                .amount(BigDecimal.valueOf(5000))
                .type(TransactionType.EXPENSE)
                .transactionDate(OffsetDateTime.now())
                .build();

        Transaction tx2 = Transaction.builder()
                .id(2L)
                .account(accountArs)
                .category(comida)
                .amount(BigDecimal.valueOf(3000))
                .type(TransactionType.EXPENSE)
                .transactionDate(OffsetDateTime.now())
                .build();

        Transaction tx3 = Transaction.builder()
                .id(3L)
                .account(accountArs)
                .category(servicios)
                .amount(BigDecimal.valueOf(10000))
                .type(TransactionType.EXPENSE)
                .transactionDate(OffsetDateTime.now())
                .build();

        List<Transaction> transactions = Arrays.asList(tx1, tx2, tx3);

        when(transactionRepository.findByAccountUserIdAndTypeAndTransactionDateBetween(
                eq(1L), eq(TransactionType.EXPENSE), any(), any()
        )).thenReturn(transactions);

        // Simulamos tasas de cambio directas 1 a 1 para ARS -> ARS
        when(exchangeRateService.convert(any(), eq("ARS"), eq("ARS"))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        List<CategoryReportDto> report = reportService.getMonthlyReport(1L, "ARS", null, null, TransactionType.EXPENSE);

        // THEN
        assertNotNull(report);
        assertEquals(2, report.size()); // Comida y Servicios

        // El primer elemento debe ser Servicios porque es de mayor monto (10000)
        assertEquals("Servicios", report.get(0).categoryName());
        assertEquals(0, report.get(0).totalSpent().compareTo(BigDecimal.valueOf(10000)));

        // El segundo elemento debe ser Comida (5000 + 3000 = 8000)
        assertEquals("Comida", report.get(1).categoryName());
        assertEquals(0, report.get(1).totalSpent().compareTo(BigDecimal.valueOf(8000)));
    }

    @Test
    public void testGetTrendReport_weekly_shouldReturnFourWeeks() {
        // GIVEN
        when(userRepository.existsById(1L)).thenReturn(true);

        // WHEN - Solicitamos tendencia agrupada por 1 mes (4 semanas)
        List<TrendResponse> trend = reportService.getTrendReport(1L, "ARS", "1_MONTH", null, null);

        // THEN
        assertNotNull(trend);
        assertEquals(4, trend.size()); // 4 semanas
        assertTrue(trend.get(0).label().contains("-")); // Ej. "01/07 - 07/07"
    }

    @Test
    public void testGetTrendReport_1Week_shouldReturnSevenDays() {
        // GIVEN
        when(userRepository.existsById(1L)).thenReturn(true);

        // WHEN - Solicitamos tendencia agrupada por 1 semana (7 días)
        List<TrendResponse> trend = reportService.getTrendReport(1L, "ARS", "1_WEEK", null, null);

        // THEN
        assertNotNull(trend);
        assertEquals(7, trend.size()); // 7 días
    }

    @Test
    public void testGetTrendReport_6Months_shouldReturnSixMonths() {
        // GIVEN
        when(userRepository.existsById(1L)).thenReturn(true);

        // WHEN - Solicitamos tendencia de 6 meses
        List<TrendResponse> trend = reportService.getTrendReport(1L, "ARS", "6_MONTHS", null, null);

        // THEN
        assertNotNull(trend);
        assertEquals(6, trend.size()); // 6 meses
    }
}
