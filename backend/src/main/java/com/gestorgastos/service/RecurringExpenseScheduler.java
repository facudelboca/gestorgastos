package com.gestorgastos.service;

import com.gestorgastos.dto.CreateTransactionRequest;
import com.gestorgastos.model.RecurringExpense;
import com.gestorgastos.model.TransactionType;
import com.gestorgastos.repository.RecurringExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecurringExpenseScheduler {

    private final RecurringExpenseRepository recurringExpenseRepository;
    private final TransactionService transactionService;

    /**
     * Se ejecuta todas las madrugadas a las 04:00 AM.
     * Procesa todos los cobros recurrentes que estén vencidos a la fecha de hoy.
     */
    @Scheduled(cron = "*/10 * * * * *")
    public void processRecurringExpenses() {
        log.info("Iniciando ejecución del motor de cobros recurrentes...");
        LocalDate today = LocalDate.now();
        List<RecurringExpense> overdueExpenses = recurringExpenseRepository
                .findAllByActiveTrueAndNextExecutionDateLessThanEqual(today);

        log.info("Se encontraron {} cobros recurrentes para procesar.", overdueExpenses.size());

        for (RecurringExpense expense : overdueExpenses) {
            try {
                // Procesamos cada cobro en una transacción aislada llamando al método helper del scheduler
                // para que un fallo individual no impida la ejecución de los demás cobros.
                executeSingleRecurringExpense(expense);
            } catch (Exception e) {
                // MANEJO DE EXCEPCIONES DE DEBITO (ej: Cuenta sin saldo, cuenta eliminada, etc.)
                log.error("FALLO en débito automático de Suscripción ID: {} - Cuenta ID: {} - Motivo: {}", 
                        expense.getId(), expense.getAccount().getId(), e.getMessage(), e);
                
                // DECISIÓN DE DISEÑO ARQUITECTÓNICO:
                // Para suscripciones fijas mensuales (Netflix, Spotify, Alquiler), si falla el pago
                // no debemos reintentar indefinidamente todos los días en bucle (ya que incrementaría la carga y
                // podría duplicar cobros no deseados si se recarga saldo tarde). Por lo tanto:
                // 1. Movemos la fecha de próxima ejecución al mes siguiente.
                // 2. Opcionalmente se podría desactivar la suscripción, pero aquí optamos por registrar el fallo y
                //    postergar el cobro hasta el mes entrante (o bien hasta que el usuario reintente manualmente).
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

    /**
     * Ejecuta un cobro individual de forma transaccional.
     * Si la cuenta no posee fondos suficientes o la categoría no existe, la transacción
     * de este cobro se revierte completamente (rollback) sin afectar a los demás.
     */
    @Transactional
    public void executeSingleRecurringExpense(RecurringExpense expense) {
        log.info("Procesando débito automático para la suscripción ID: {} - Monto: {}", 
                expense.getId(), expense.getAmount());

        // Adaptamos el RecurringExpense al DTO de creación de transacciones
        CreateTransactionRequest request = new CreateTransactionRequest(
                expense.getAccount().getId(),
                expense.getCategory().getId(),
                expense.getAmount(),
                TransactionType.EXPENSE,
                "[Débito Automático] " + expense.getDescription(),
                OffsetDateTime.now() // fecha de cobro actual
        );

        // Se invoca al TransactionService (que ya corre bajo su propio @Transactional)
        transactionService.createTransaction(expense.getUser().getId(), request);

        // Si se debitó correctamente, actualizamos la fecha de próxima ejecución (+1 mes)
        expense.setNextExecutionDate(expense.getNextExecutionDate().plusMonths(1));
        recurringExpenseRepository.save(expense);

        log.info("Débito automático exitoso para la suscripción ID: {}. Próxima ejecución: {}", 
                expense.getId(), expense.getNextExecutionDate());
    }
}
