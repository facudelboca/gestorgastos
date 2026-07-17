package com.gestorgastos.controller;

import com.gestorgastos.dto.SavingsGoalAllocationRequest;
import com.gestorgastos.dto.SavingsGoalRequest;
import com.gestorgastos.dto.SavingsGoalResponse;
import com.gestorgastos.model.User;
import com.gestorgastos.service.SavingsGoalService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/savings-goals")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    @PostMapping
    public ResponseEntity<SavingsGoalResponse> createGoal(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody SavingsGoalRequest request) {
        SavingsGoalResponse response = savingsGoalService.createGoal(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/allocate")
    public ResponseEntity<SavingsGoalResponse> allocateFunds(
            @AuthenticationPrincipal User user,
            @PathVariable("id") Long goalId,
            @Valid @RequestBody SavingsGoalAllocationRequest request) {
        SavingsGoalResponse response = savingsGoalService.allocateFunds(user.getId(), goalId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<SavingsGoalResponse>> getGoals(@AuthenticationPrincipal User user) {
        List<SavingsGoalResponse> response = savingsGoalService.getGoals(user.getId());
        return ResponseEntity.ok(response);
    }
}
