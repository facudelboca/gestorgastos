package com.gestorgastos.service;

import com.gestorgastos.dto.CreateTransactionRequest;
import com.gestorgastos.model.RecurringExpense;
import com.gestorgastos.model.TransactionType;
import com.gestorgastos.repository.RecurringExpenseRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecurringExpenseScheduler {

    private final RecurringExpenseRepository recurringExpenseRepository;
    private final TransactionService transactionService;
    private final SseNotificationService sseNotificationService;

    @Scheduled(cron = "0 0 4 * * *")
    public void processRecurringExpenses() {
        log.info("Iniciando ejecución del motor de cobros recurrentes...");
        LocalDate today = LocalDate.now();
        List<RecurringExpense> overdueExpenses = recurringExpenseRepository
                .findAllByActiveTrueAndNextExecutionDateLessThanEqual(today);

        log.info("Se encontraron {} cobros recurrentes para procesar.", overdueExpenses.size());

        for (RecurringExpense expense : overdueExpenses) {
            try {
                executeSingleRecurringExpense(expense);
            } catch (Exception e) {
                log.error("FALLO en débito automático de Suscripción ID: {} - Cuenta ID: {} - Motivo: {}", 
                        expense.getId(), expense.getAccount().getId(), e.getMessage(), e);
                
                try {
                    String msg = "El débito automático de '" + expense.getDescription() + "' (" + expense.getAmount() + " " + expense.getAccount().getCurrency() + ") falló en la cuenta '" + expense.getAccount().getName() + "'. Motivo: " + e.getMessage();
                    sseNotificationService.sendNotification(expense.getUser().getId(), msg);
                } catch (Exception notifyEx) {
                    log.error("Error al enviar notificación SSE por fallo de cobro", notifyEx);
                }

                try {
                    expense.setNextExecutionDate(expense.getNextExecutionDate().plusMonths(1));
                    recurringExpenseRepository.save(expense);
                    log.info("Suscripción ID: {} reprogramada para el próximo mes ({}).", 
                            expense.getId(), expense.getNextExecutionDate());
                } catch (Exception updateEx) {
                    log.error("No se pudo reprogramar la suscripción ID: {}", expense.getId(), updateEx);
                }
            }
        }
        log.info("Finalizó la ejecución del motor de cobros recurrentes.");
    }

    @Transactional
    public void executeSingleRecurringExpense(RecurringExpense expense) {
        log.info("Procesando débito automático para la suscripción ID: {} - Monto: {}", 
                expense.getId(), expense.getAmount());

        CreateTransactionRequest request = new CreateTransactionRequest(
                expense.getAccount().getId(),
                expense.getCategory().getId(),
                expense.getAmount(),
                TransactionType.EXPENSE,
                "[Débito Automático] " + expense.getDescription(),
                OffsetDateTime.now()
        );

        transactionService.createTransaction(expense.getUser().getId(), request);

        expense.setNextExecutionDate(expense.getNextExecutionDate().plusMonths(1));
        recurringExpenseRepository.save(expense);

        log.info("Débito automático exitoso para la suscripción ID: {}. Próxima ejecución: {}", 
                expense.getId(), expense.getNextExecutionDate());
    }
}
