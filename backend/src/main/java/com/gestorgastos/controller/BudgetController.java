package com.gestorgastos.controller;

import com.gestorgastos.dto.BudgetRequest;
import com.gestorgastos.dto.BudgetResponse;
import com.gestorgastos.model.User;
import com.gestorgastos.service.BudgetService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BudgetRequest request) {
        BudgetResponse response = budgetService.createBudget(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets(@AuthenticationPrincipal User user) {
        List<BudgetResponse> response = budgetService.getBudgets(user.getId());
        return ResponseEntity.ok(response);
    }
}
