package com.gestorgastos.listener;

import com.gestorgastos.event.TransactionCreatedEvent;
import com.gestorgastos.model.*;
import com.gestorgastos.repository.BudgetRepository;
import com.gestorgastos.repository.TransactionRepository;
import com.gestorgastos.service.SseNotificationService;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BudgetListener {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final SseNotificationService sseNotificationService;

    @EventListener
    public void handleTransactionCreated(TransactionCreatedEvent event) {
        Transaction transaction = event.getTransaction();
        
        if (transaction.getType() != TransactionType.EXPENSE) {
            return;
        }

        try {
            Account account = transaction.getAccount();
            User user = account.getUser();
            Category category = transaction.getCategory();
            OffsetDateTime date = transaction.getTransactionDate();

            int monthPeriod = date.getYear() * 100 + date.getMonthValue();

            budgetRepository.findByUserIdAndCategoryIdAndMonthPeriod(user.getId(), category.getId(), monthPeriod)
                .ifPresent(budget -> {
                    OffsetDateTime start = date.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                    OffsetDateTime end = date.withDayOfMonth(date.toLocalDate().lengthOfMonth())
                            .withHour(23).withMinute(59).withSecond(59).withNano(999999999);

                    BigDecimal totalExpenses = transactionRepository.sumAmountByUserIdAndCategoryIdAndTypeAndDateRange(
                            user.getId(),
                            category.getId(),
                            TransactionType.EXPENSE,
                            start,
                            end
                    );

                    if (totalExpenses.compareTo(budget.getLimitAmount()) > 0) {
                        String warningMessage = String.format(
                                "¡Alerta de Presupuesto! Has excedido el límite mensual configurado de $%s para la categoría %s %s. Consumo acumulado actual: $%s",
                                budget.getLimitAmount(),
                                category.getIcon() != null ? category.getIcon() : "",
                                category.getName(),
                                totalExpenses
                        );
                        log.info("Presupuesto excedido para el usuario {}. Enviando alerta en tiempo real...", user.getId());
                        sseNotificationService.sendNotification(user.getId(), warningMessage);
                    }
                });
        } catch (Exception e) {
            log.error("Error al procesar la auditoría de presupuestos para la transacción {}", transaction.getId(), e);
        }
    }
}
