package com.gestorgastos.service;

import com.gestorgastos.dto.CreateTransactionRequest;
import com.gestorgastos.dto.TransactionResponse;
import com.gestorgastos.exception.BusinessException;
import com.gestorgastos.exception.ResourceNotFoundException;
import com.gestorgastos.model.*;
import com.gestorgastos.repository.AccountRepository;
import com.gestorgastos.repository.BudgetRepository;
import com.gestorgastos.repository.CategoryRepository;
import com.gestorgastos.repository.TransactionRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;

    @Transactional
    public TransactionResponse createTransaction(Long userId, CreateTransactionRequest request) {
        // 1. Validar que el monto sea estrictamente mayor a cero
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("El monto de la transacción debe ser mayor a cero");
        }

        // 2. Buscar la cuenta y la categoría (lanzar excepciones si no existen)
        Account account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la cuenta con ID: " + request.accountId()));

        // Validar propiedad de la cuenta
        if (!account.getUser().getId().equals(userId)) {
            throw new BusinessException("La cuenta seleccionada no pertenece al usuario autenticado");
        }

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la categoría con ID: " + request.categoryId()));

        // Asignar fecha actual si no se provee una en la request
        OffsetDateTime transactionDate = request.transactionDate() != null 
                ? request.transactionDate() 
                : OffsetDateTime.now();

        // 3. Actualizar el saldo de la cuenta
        BigDecimal newBalance;
        if (request.type() == TransactionType.INCOME) {
            newBalance = account.getBalance().add(request.amount());
        } else if (request.type() == TransactionType.EXPENSE) {
            newBalance = account.getBalance().subtract(request.amount());
        } else {
            throw new BusinessException("Tipo de transacción no soportado: " + request.type());
        }
        account.setBalance(newBalance);
        accountRepository.save(account);

        // 4. Evaluar si existe un presupuesto mensual activo y si se excede el límite
        boolean budgetExceeded = false;
        if (request.type() == TransactionType.EXPENSE) {
            User user = account.getUser();
            int year = transactionDate.getYear();
            int month = transactionDate.getMonthValue();
            int monthPeriod = year * 100 + month;

            var budgetOpt = budgetRepository.findByUserIdAndCategoryIdAndMonthPeriod(
                    user.getId(), 
                    category.getId(), 
                    monthPeriod
            );

            if (budgetOpt.isPresent()) {
                Budget budget = budgetOpt.get();
                
                // Calcular la sumatoria de egresos actuales en el mes (excluyendo esta nueva transacción)
                OffsetDateTime start = transactionDate.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                OffsetDateTime end = transactionDate.withDayOfMonth(transactionDate.toLocalDate().lengthOfMonth())
                        .withHour(23).withMinute(59).withSecond(59).withNano(999999999);

                BigDecimal currentExpensesSum = transactionRepository
                        .sumAmountByUserIdAndCategoryIdAndTypeAndDateRange(
                                user.getId(), 
                                category.getId(), 
                                TransactionType.EXPENSE, 
                                start, 
                                end
                        );

                // Sumar el egreso de la nueva transacción que se está creando
                BigDecimal totalExpenses = currentExpensesSum.add(request.amount());

                // Determinar si se excede el límite del presupuesto
                if (totalExpenses.compareTo(budget.getLimitAmount()) > 0) {
                    budgetExceeded = true;
                }
            }
        }

        // 5. Guardar la transacción
        Transaction transaction = Transaction.builder()
                .account(account)
                .category(category)
                .amount(request.amount())
                .type(request.type())
                .description(request.description())
                .transactionDate(transactionDate)
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        // Retornar respuesta mapeada a DTO
        return new TransactionResponse(
                savedTransaction.getId(),
                account.getId(),
                account.getName(),
                category.getId(),
                category.getName(),
                savedTransaction.getAmount(),
                savedTransaction.getType(),
                savedTransaction.getDescription(),
                savedTransaction.getTransactionDate(),
                budgetExceeded
        );
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(
            Long accountId,
            Long categoryId,
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            Pageable pageable) {
        return transactionRepository.findFiltered(accountId, categoryId, startDate, endDate, pageable)
                .map(t -> new TransactionResponse(
                        t.getId(),
                        t.getAccount().getId(),
                        t.getAccount().getName(),
                        t.getCategory().getId(),
                        t.getCategory().getName(),
                        t.getAmount(),
                        t.getType(),
                        t.getDescription(),
                        t.getTransactionDate(),
                        false
                ));
    }
}
