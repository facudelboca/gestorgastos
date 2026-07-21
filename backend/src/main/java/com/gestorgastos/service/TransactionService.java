package com.gestorgastos.service;

import com.gestorgastos.dto.CreateTransactionRequest;
import com.gestorgastos.dto.TransactionResponse;
import com.gestorgastos.event.TransactionCreatedEvent;
import com.gestorgastos.exception.BusinessException;
import com.gestorgastos.exception.ResourceNotFoundException;
import com.gestorgastos.model.*;
import com.gestorgastos.repository.AccountRepository;
import com.gestorgastos.repository.CategoryRepository;
import com.gestorgastos.repository.TransactionRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
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
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public TransactionResponse createTransaction(Long userId, CreateTransactionRequest request) {
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("El monto de la transacción debe ser mayor a cero");
        }

        Account account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la cuenta con ID: " + request.accountId()));

        if (!account.getUser().getId().equals(userId)) {
            throw new BusinessException("La cuenta seleccionada no pertenece al usuario autenticado");
        }

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la categoría con ID: " + request.categoryId()));

        OffsetDateTime transactionDate = request.transactionDate() != null 
                ? request.transactionDate() 
                : OffsetDateTime.now();

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

        Transaction transaction = Transaction.builder()
                .account(account)
                .category(category)
                .amount(request.amount())
                .type(request.type())
                .description(request.description())
                .transactionDate(transactionDate)
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        eventPublisher.publishEvent(new TransactionCreatedEvent(this, savedTransaction));

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
                false
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
