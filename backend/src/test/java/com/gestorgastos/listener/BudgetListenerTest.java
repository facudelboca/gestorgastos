package com.gestorgastos.listener;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.gestorgastos.event.TransactionCreatedEvent;
import com.gestorgastos.model.*;
import com.gestorgastos.repository.BudgetRepository;
import com.gestorgastos.repository.TransactionRepository;
import com.gestorgastos.service.SseNotificationService;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class BudgetListenerTest {

    @Mock
    private BudgetRepository budgetRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private SseNotificationService sseNotificationService;

    @InjectMocks
    private BudgetListener budgetListener;

    @Test
    public void testHandleTransactionCreated_income_shouldDoNothing() {
        Transaction transaction = Transaction.builder()
                .type(TransactionType.INCOME)
                .build();
        TransactionCreatedEvent event = new TransactionCreatedEvent(this, transaction);

        budgetListener.handleTransactionCreated(event);

        verifyNoInteractions(budgetRepository, transactionRepository, sseNotificationService);
    }

    @Test
    public void testHandleTransactionCreated_expenseExceedsBudget_shouldSendNotification() {
        User user = User.builder().id(1L).email("test@user.com").build();
        Account account = Account.builder().id(2L).user(user).build();
        Category category = Category.builder().id(3L).name("Ocio").icon("🍿").build();
        
        Transaction transaction = Transaction.builder()
                .id(10L)
                .account(account)
                .category(category)
                .amount(BigDecimal.valueOf(150))
                .type(TransactionType.EXPENSE)
                .transactionDate(OffsetDateTime.now())
                .build();

        Budget budget = Budget.builder()
                .limitAmount(BigDecimal.valueOf(200))
                .build();

        TransactionCreatedEvent event = new TransactionCreatedEvent(this, transaction);

        when(budgetRepository.findByUserIdAndCategoryIdAndMonthPeriod(eq(1L), eq(3L), anyInt()))
                .thenReturn(Optional.of(budget));
        when(transactionRepository.sumAmountByUserIdAndCategoryIdAndTypeAndDateRange(eq(1L), eq(3L), eq(TransactionType.EXPENSE), any(), any()))
                .thenReturn(BigDecimal.valueOf(250)); // Excede los 200 de límite

        budgetListener.handleTransactionCreated(event);

        verify(sseNotificationService, times(1)).sendNotification(eq(1L), anyString());
    }

    @Test
    public void testHandleTransactionCreated_expenseDoesNotExceedBudget_shouldNotSendNotification() {
        User user = User.builder().id(1L).email("test@user.com").build();
        Account account = Account.builder().id(2L).user(user).build();
        Category category = Category.builder().id(3L).name("Ocio").icon("🍿").build();
        
        Transaction transaction = Transaction.builder()
                .id(10L)
                .account(account)
                .category(category)
                .amount(BigDecimal.valueOf(50))
                .type(TransactionType.EXPENSE)
                .transactionDate(OffsetDateTime.now())
                .build();

        Budget budget = Budget.builder()
                .limitAmount(BigDecimal.valueOf(200))
                .build();

        TransactionCreatedEvent event = new TransactionCreatedEvent(this, transaction);

        when(budgetRepository.findByUserIdAndCategoryIdAndMonthPeriod(eq(1L), eq(3L), anyInt()))
                .thenReturn(Optional.of(budget));
        when(transactionRepository.sumAmountByUserIdAndCategoryIdAndTypeAndDateRange(eq(1L), eq(3L), eq(TransactionType.EXPENSE), any(), any()))
                .thenReturn(BigDecimal.valueOf(100)); // No excede los 200 de límite

        budgetListener.handleTransactionCreated(event);

        verify(sseNotificationService, never()).sendNotification(anyLong(), anyString());
    }
}
