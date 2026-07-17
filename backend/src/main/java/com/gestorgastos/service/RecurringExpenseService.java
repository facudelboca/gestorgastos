package com.gestorgastos.service;

import com.gestorgastos.dto.RecurringExpenseRequest;
import com.gestorgastos.dto.RecurringExpenseResponse;
import com.gestorgastos.exception.ResourceNotFoundException;
import com.gestorgastos.model.Account;
import com.gestorgastos.model.Category;
import com.gestorgastos.model.RecurringExpense;
import com.gestorgastos.model.User;
import com.gestorgastos.repository.AccountRepository;
import com.gestorgastos.repository.CategoryRepository;
import com.gestorgastos.repository.RecurringExpenseRepository;
import com.gestorgastos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecurringExpenseService {

    private final RecurringExpenseRepository recurringExpenseRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public RecurringExpenseResponse createRecurringExpense(Long userId, RecurringExpenseRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el usuario con ID: " + userId));

        Account account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la cuenta con ID: " + request.accountId()));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la categoría con ID: " + request.categoryId()));

        RecurringExpense recurringExpense = RecurringExpense.builder()
                .user(user)
                .account(account)
                .category(category)
                .amount(request.amount())
                .description(request.description())
                .nextExecutionDate(request.nextExecutionDate())
                .active(true)
                .build();

        RecurringExpense saved = recurringExpenseRepository.save(recurringExpense);

        return new RecurringExpenseResponse(
                saved.getId(),
                account.getId(),
                account.getName(),
                category.getId(),
                category.getName(),
                saved.getAmount(),
                saved.getDescription(),
                saved.getNextExecutionDate(),
                saved.isActive(),
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<RecurringExpenseResponse> getRecurringExpenses(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("No se encontró el usuario con ID: " + userId);
        }
        return recurringExpenseRepository.findByUserId(userId).stream()
                .map(re -> new RecurringExpenseResponse(
                        re.getId(),
                        re.getAccount().getId(),
                        re.getAccount().getName(),
                        re.getCategory().getId(),
                        re.getCategory().getName(),
                        re.getAmount(),
                        re.getDescription(),
                        re.getNextExecutionDate(),
                        re.isActive(),
                        re.getCreatedAt()
                ))
                .toList();
    }
}
