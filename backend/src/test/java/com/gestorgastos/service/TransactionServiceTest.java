package com.gestorgastos.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

@ExtendWith(MockitoExtension.class)
public class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private TransactionService transactionService;

    @Test
    public void testCreateTransaction_amountIsZero_shouldThrowBusinessException() {
        CreateTransactionRequest request = new CreateTransactionRequest(
                1L, 1L, BigDecimal.ZERO, TransactionType.INCOME, "Test", OffsetDateTime.now()
        );

        assertThrows(BusinessException.class, () -> transactionService.createTransaction(1L, request));
    }

    @Test
    public void testCreateTransaction_accountNotFound_shouldThrowResourceNotFoundException() {
        CreateTransactionRequest request = new CreateTransactionRequest(
                99L, 1L, BigDecimal.TEN, TransactionType.INCOME, "Test", OffsetDateTime.now()
        );
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> transactionService.createTransaction(1L, request));
    }

    @Test
    public void testCreateTransaction_accountDoesNotBelongToUser_shouldThrowBusinessException() {
        CreateTransactionRequest request = new CreateTransactionRequest(
                1L, 1L, BigDecimal.TEN, TransactionType.INCOME, "Test", OffsetDateTime.now()
        );
        User owner = User.builder().id(2L).email("owner@test.com").build();
        Account account = Account.builder().id(1L).user(owner).balance(BigDecimal.ZERO).build();

        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));

        assertThrows(BusinessException.class, () -> transactionService.createTransaction(1L, request));
    }

    @Test
    public void testCreateTransaction_successIncome_shouldIncreaseBalanceAndPublishEvent() {
        CreateTransactionRequest request = new CreateTransactionRequest(
                1L, 1L, BigDecimal.valueOf(100), TransactionType.INCOME, "Sueldo", OffsetDateTime.now()
        );

        User user = User.builder().id(1L).email("user@test.com").build();
        Account account = Account.builder().id(1L).user(user).name("Banco").balance(BigDecimal.valueOf(500)).currency("ARS").build();
        Category category = Category.builder().id(1L).name("Trabajo").build();

        Transaction savedTransaction = Transaction.builder()
                .id(10L)
                .account(account)
                .category(category)
                .amount(BigDecimal.valueOf(100))
                .type(TransactionType.INCOME)
                .description("Sueldo")
                .transactionDate(request.transactionDate())
                .build();

        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);

        TransactionResponse response = transactionService.createTransaction(1L, request);

        assertNotNull(response);
        assertEquals(10L, response.id());
        assertEquals(BigDecimal.valueOf(100), response.amount());
        assertEquals(BigDecimal.valueOf(600), account.getBalance()); // 500 + 100
        assertFalse(response.budgetExceeded());

        verify(accountRepository, times(1)).save(account);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
        verify(eventPublisher, times(1)).publishEvent(any(TransactionCreatedEvent.class));
    }

    @Test
    public void testCreateTransaction_successExpense_shouldDecreaseBalanceAndPublishEvent() {
        CreateTransactionRequest request = new CreateTransactionRequest(
                1L, 1L, BigDecimal.valueOf(150), TransactionType.EXPENSE, "Cena", OffsetDateTime.now()
        );

        User user = User.builder().id(1L).email("user@test.com").build();
        Account account = Account.builder().id(1L).user(user).name("Banco").balance(BigDecimal.valueOf(500)).currency("ARS").build();
        Category category = Category.builder().id(1L).name("Comida").build();

        Transaction savedTransaction = Transaction.builder()
                .id(10L)
                .account(account)
                .category(category)
                .amount(BigDecimal.valueOf(150))
                .type(TransactionType.EXPENSE)
                .description("Cena")
                .transactionDate(request.transactionDate())
                .build();

        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);

        TransactionResponse response = transactionService.createTransaction(1L, request);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(350), account.getBalance()); // 500 - 150
        assertFalse(response.budgetExceeded());

        verify(accountRepository, times(1)).save(account);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
        verify(eventPublisher, times(1)).publishEvent(any(TransactionCreatedEvent.class));
    }
}
