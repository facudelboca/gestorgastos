package com.gestorgastos.controller;

import com.gestorgastos.dto.RecurringExpenseRequest;
import com.gestorgastos.dto.RecurringExpenseResponse;
import com.gestorgastos.model.User;
import com.gestorgastos.service.RecurringExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring-expenses")
@RequiredArgsConstructor
public class RecurringExpenseController {

    private final RecurringExpenseService recurringExpenseService;

    @PostMapping
    public ResponseEntity<RecurringExpenseResponse> createRecurringExpense(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody RecurringExpenseRequest request) {
        RecurringExpenseResponse response = recurringExpenseService.createRecurringExpense(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<RecurringExpenseResponse>> getRecurringExpenses(@AuthenticationPrincipal User user) {
        List<RecurringExpenseResponse> response = recurringExpenseService.getRecurringExpenses(user.getId());
        return ResponseEntity.ok(response);
    }
}
