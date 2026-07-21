package com.gestorgastos.service;

import com.gestorgastos.dto.BudgetRequest;
import com.gestorgastos.dto.BudgetResponse;
import com.gestorgastos.exception.ResourceNotFoundException;
import com.gestorgastos.model.Budget;
import com.gestorgastos.model.Category;
import com.gestorgastos.model.User;
import com.gestorgastos.repository.BudgetRepository;
import com.gestorgastos.repository.CategoryRepository;
import com.gestorgastos.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public BudgetResponse createBudget(Long userId, BudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el usuario con ID: " + userId));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la categoría con ID: " + request.categoryId()));

        Budget budget = budgetRepository.findByUserIdAndCategoryIdAndMonthPeriod(userId, request.categoryId(), request.monthPeriod())
                .orElse(null);

        if (budget == null) {
            budget = Budget.builder()
                    .user(user)
                    .category(category)
                    .limitAmount(request.limitAmount())
                    .monthPeriod(request.monthPeriod())
                    .build();
        } else {
            budget.setLimitAmount(request.limitAmount());
        }

        Budget saved = budgetRepository.save(budget);

        return new BudgetResponse(
                saved.getId(),
                saved.getCategory().getId(),
                saved.getCategory().getName(),
                saved.getLimitAmount(),
                saved.getMonthPeriod(),
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("No se encontró el usuario con ID: " + userId);
        }
        return budgetRepository.findByUserId(userId).stream()
                .map(b -> new BudgetResponse(
                        b.getId(),
                        b.getCategory().getId(),
                        b.getCategory().getName(),
                        b.getLimitAmount(),
                        b.getMonthPeriod(),
                        b.getCreatedAt()
                ))
                .toList();
    }
}
