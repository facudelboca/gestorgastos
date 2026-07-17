package com.gestorgastos.controller;

import com.gestorgastos.dto.AccountRequest;
import com.gestorgastos.dto.AccountResponse;
import com.gestorgastos.model.User;
import com.gestorgastos.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AccountRequest request) {
        AccountResponse response = accountService.createAccount(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAccounts(@AuthenticationPrincipal User user) {
        List<AccountResponse> response = accountService.getAccounts(user.getId());
        return ResponseEntity.ok(response);
    }
}
