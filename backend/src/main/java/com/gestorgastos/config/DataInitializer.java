package com.gestorgastos.config;

import com.gestorgastos.model.*;
import com.gestorgastos.repository.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.data-initializer.enabled", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final TransferRepository transferRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final RecurringExpenseRepository recurringExpenseRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String demoEmail = "demo@gestorgastos.com";
        String demoPassword = "password123";

        if (userRepository.findByEmail(demoEmail).isPresent()) {
            log.info("El usuario de prueba ya existe. Omitiendo la siembra de datos.");
            return;
        }

        log.info("Creando datos de demostración en la base de datos...");

        // 1. Crear Usuario Demo
        User user = User.builder()
                .email(demoEmail)
                .passwordHash(passwordEncoder.encode(demoPassword))
                .firstName("Usuario Demo")
                .build();
        user = userRepository.save(user);

        // 2. Crear Categorías Básicas (si no existen o las creamos del usuario)
        Category comida = categoryRepository.save(Category.builder().name("Comida").icon("🍔").user(user).build());
        Category transporte = categoryRepository.save(Category.builder().name("Transporte").icon("🚗").user(user).build());
        Category servicios = categoryRepository.save(Category.builder().name("Servicios").icon("⚡").user(user).build());
        Category trabajo = categoryRepository.save(Category.builder().name("Trabajo").icon("💼").user(user).build());
        Category ocio = categoryRepository.save(Category.builder().name("Ocio").icon("🍿").user(user).build());

        // 3. Crear Cuentas Financieras
        Account galicia = accountRepository.save(Account.builder()
                .user(user)
                .name("Banco Galicia")
                .balance(BigDecimal.valueOf(185000.00))
                .currency("ARS")
                .build());

        Account mercadoPago = accountRepository.save(Account.builder()
                .user(user)
                .name("Mercado Pago")
                .balance(BigDecimal.valueOf(42300.00))
                .currency("ARS")
                .build());

        Account efectivo = accountRepository.save(Account.builder()
                .user(user)
                .name("Efectivo")
                .balance(BigDecimal.valueOf(15000.00))
                .currency("ARS")
                .build());

        Account walletUsd = accountRepository.save(Account.builder()
                .user(user)
                .name("Billetera USD")
                .balance(BigDecimal.valueOf(1250.00))
                .currency("USD")
                .build());

        // 4. Crear Límites Presupuestarios Mensuales (Periodo actual YYYYMM)
        int currentPeriod = LocalDate.now().getYear() * 100 + LocalDate.now().getMonthValue();
        budgetRepository.save(Budget.builder()
                .user(user)
                .category(comida)
                .limitAmount(BigDecimal.valueOf(50000.00))
                .monthPeriod(currentPeriod)
                .build());

        budgetRepository.save(Budget.builder()
                .user(user)
                .category(transporte)
                .limitAmount(BigDecimal.valueOf(15000.00))
                .monthPeriod(currentPeriod)
                .build());

        budgetRepository.save(Budget.builder()
                .user(user)
                .category(ocio)
                .limitAmount(BigDecimal.valueOf(20000.00))
                .monthPeriod(currentPeriod)
                .build());

        // 5. Registrar Transacciones de Ingresos/Egresos
        OffsetDateTime now = OffsetDateTime.now();
        
        // Ingresos
        transactionRepository.save(Transaction.builder()
                .account(galicia)
                .category(trabajo)
                .amount(BigDecimal.valueOf(250000.00))
                .type(TransactionType.INCOME)
                .description("Cobro de Sueldo Mensual")
                .transactionDate(now.minusDays(10))
                .build());

        transactionRepository.save(Transaction.builder()
                .account(mercadoPago)
                .category(trabajo)
                .amount(BigDecimal.valueOf(15500.00))
                .type(TransactionType.INCOME)
                .description("Venta de Teclado Usado")
                .transactionDate(now.minusDays(5))
                .build());

        // Egresos
        transactionRepository.save(Transaction.builder()
                .account(galicia)
                .category(comida)
                .amount(BigDecimal.valueOf(18500.00))
                .type(TransactionType.EXPENSE)
                .description("Compras Supermercado Coto")
                .transactionDate(now.minusDays(8))
                .build());

        transactionRepository.save(Transaction.builder()
                .account(mercadoPago)
                .category(comida)
                .amount(BigDecimal.valueOf(8400.00))
                .type(TransactionType.EXPENSE)
                .description("Cena Hamburguesas Club")
                .transactionDate(now.minusDays(4))
                .build());

        transactionRepository.save(Transaction.builder()
                .account(mercadoPago)
                .category(transporte)
                .amount(BigDecimal.valueOf(4500.00))
                .type(TransactionType.EXPENSE)
                .description("Carga Tarjeta SUBE")
                .transactionDate(now.minusDays(3))
                .build());

        transactionRepository.save(Transaction.builder()
                .account(galicia)
                .category(servicios)
                .amount(BigDecimal.valueOf(22400.00))
                .type(TransactionType.EXPENSE)
                .description("Factura de Luz Edesur")
                .transactionDate(now.minusDays(7))
                .build());

        transactionRepository.save(Transaction.builder()
                .account(efectivo)
                .category(comida)
                .amount(BigDecimal.valueOf(3200.00))
                .type(TransactionType.EXPENSE)
                .description("Compra Verdulería barrio")
                .transactionDate(now.minusDays(1))
                .build());

        transactionRepository.save(Transaction.builder()
                .account(galicia)
                .category(ocio)
                .amount(BigDecimal.valueOf(9800.00))
                .type(TransactionType.EXPENSE)
                .description("Entradas de Cine Hoyts")
                .transactionDate(now.minusDays(2))
                .build());

        // Sembrar transacciones históricas de los últimos 5 meses (para el gráfico comparativo)
        for (int i = 1; i <= 5; i++) {
            OffsetDateTime monthDate = now.minusMonths(i);
            
            // Ingreso de sueldo histórico
            transactionRepository.save(Transaction.builder()
                    .account(galicia)
                    .category(trabajo)
                    .amount(BigDecimal.valueOf(240000.00 - (i * 10000)))
                    .type(TransactionType.INCOME)
                    .description("Cobro de Sueldo Mensual")
                    .transactionDate(monthDate.withDayOfMonth(5).withHour(10).withMinute(0))
                    .build());

            // Egreso de supermercado histórico
            transactionRepository.save(Transaction.builder()
                    .account(galicia)
                    .category(comida)
                    .amount(BigDecimal.valueOf(45000.00 + (i * 2000)))
                    .type(TransactionType.EXPENSE)
                    .description("Supermercado Coto Histórico")
                    .transactionDate(monthDate.withDayOfMonth(12).withHour(15).withMinute(30))
                    .build());

            // Egreso de servicios histórico
            transactionRepository.save(Transaction.builder()
                    .account(galicia)
                    .category(servicios)
                    .amount(BigDecimal.valueOf(18000.00 - (i * 500)))
                    .type(TransactionType.EXPENSE)
                    .description("Factura de Servicios Histórica")
                    .transactionDate(monthDate.withDayOfMonth(18).withHour(9).withMinute(15))
                    .build());
            
            // Egreso de ocio histórico
            transactionRepository.save(Transaction.builder()
                    .account(galicia)
                    .category(ocio)
                    .amount(BigDecimal.valueOf(12000.00 + (i * 1000)))
                    .type(TransactionType.EXPENSE)
                    .description("Salida de Fin de Semana Histórica")
                    .transactionDate(monthDate.withDayOfMonth(25).withHour(21).withMinute(0))
                    .build());
        }

        // 6. Registrar Transferencias Realizadas
        transferRepository.save(Transfer.builder()
                .user(user)
                .sourceAccount(galicia)
                .destinationAccount(mercadoPago)
                .amount(BigDecimal.valueOf(30000.00))
                .description("Traspaso para pagar servicios")
                .transferDate(now.minusDays(6))
                .build());

        transferRepository.save(Transfer.builder()
                .user(user)
                .sourceAccount(walletUsd)
                .destinationAccount(galicia)
                .amount(BigDecimal.valueOf(200.00))
                .description("Venta de dólares a pesos [Convertido de USD a ARS]")
                .transferDate(now.minusDays(2))
                .build());

        // 7. Crear Metas de Ahorro
        savingsGoalRepository.save(SavingsGoal.builder()
                .user(user)
                .title("Vacaciones Brasil 2027")
                .targetAmount(BigDecimal.valueOf(2500.00))
                .currentAmount(BigDecimal.valueOf(650.00))
                .targetDate(LocalDate.now().plusYears(1))
                .status(SavingsGoalStatus.ACTIVE)
                .build());

        savingsGoalRepository.save(SavingsGoal.builder()
                .user(user)
                .title("Renovar Laptop Oficina")
                .targetAmount(BigDecimal.valueOf(1200.00))
                .currentAmount(BigDecimal.valueOf(1200.00))
                .targetDate(LocalDate.now().plusMonths(3))
                .status(SavingsGoalStatus.COMPLETED)
                .build());

        // 8. Crear Gastos Recurrentes / Suscripciones
        recurringExpenseRepository.save(RecurringExpense.builder()
                .user(user)
                .account(mercadoPago)
                .category(ocio)
                .amount(BigDecimal.valueOf(2800.00))
                .description("Suscripción Mensual Spotify")
                .nextExecutionDate(LocalDate.now())
                .active(true)
                .build());

        recurringExpenseRepository.save(RecurringExpense.builder()
                .user(user)
                .account(galicia)
                .category(ocio)
                .amount(BigDecimal.valueOf(6500.00))
                .description("Suscripción Mensual Netflix")
                .nextExecutionDate(LocalDate.now().plusMonths(1))
                .active(true)
                .build());

        log.info("Datos de demostración sembrados con éxito. Correo de acceso: {} | Contraseña: {}", demoEmail, demoPassword);
    }
}
