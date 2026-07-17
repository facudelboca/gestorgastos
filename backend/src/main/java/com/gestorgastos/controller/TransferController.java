package com.gestorgastos.controller;

import com.gestorgastos.dto.TransferRequest;
import com.gestorgastos.dto.TransferResponse;
import com.gestorgastos.model.User;
import com.gestorgastos.service.TransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    @PostMapping
    public ResponseEntity<TransferResponse> executeTransfer(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TransferRequest request) {
        TransferResponse response = transferService.executeTransfer(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
