package com.gestorgastos.service;

import com.gestorgastos.dto.TransferRequest;
import com.gestorgastos.dto.TransferResponse;
import com.gestorgastos.exception.BusinessException;
import com.gestorgastos.exception.ResourceNotFoundException;
import com.gestorgastos.model.Account;
import com.gestorgastos.model.Transfer;
import com.gestorgastos.model.User;
import com.gestorgastos.repository.AccountRepository;
import com.gestorgastos.repository.TransferRepository;
import com.gestorgastos.repository.UserRepository;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final TransferRepository transferRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final ExchangeRateService exchangeRateService;

    @Transactional
    public TransferResponse executeTransfer(Long userId, TransferRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el usuario con ID: " + userId));

        if (request.sourceAccountId().equals(request.destinationAccountId())) {
            throw new BusinessException("La cuenta origen y destino deben ser diferentes");
        }

        Account sourceAccount = accountRepository.findById(request.sourceAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la cuenta origen con ID: " + request.sourceAccountId()));

        Account destinationAccount = accountRepository.findById(request.destinationAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la cuenta destino con ID: " + request.destinationAccountId()));

        // Validar que las cuentas pertenezcan al usuario
        if (!sourceAccount.getUser().getId().equals(userId)) {
            throw new BusinessException("La cuenta origen no pertenece al usuario autenticado");
        }
        if (!destinationAccount.getUser().getId().equals(userId)) {
            throw new BusinessException("La cuenta destino no pertenece al usuario autenticado");
        }

        // Validar que la cuenta origen tenga fondos suficientes
        if (sourceAccount.getBalance().compareTo(request.amount()) < 0) {
            throw new BusinessException("Saldo insuficiente en la cuenta origen para realizar la transferencia");
        }

        // Realizar traspaso de fondos con conversión dinámica si difieren de moneda
        BigDecimal creditAmount = request.amount();
        if (!sourceAccount.getCurrency().equalsIgnoreCase(destinationAccount.getCurrency())) {
            creditAmount = exchangeRateService.convert(
                    request.amount(),
                    sourceAccount.getCurrency(),
                    destinationAccount.getCurrency()
            );
        }

        sourceAccount.setBalance(sourceAccount.getBalance().subtract(request.amount()));
        destinationAccount.setBalance(destinationAccount.getBalance().add(creditAmount));

        accountRepository.save(sourceAccount);
        accountRepository.save(destinationAccount);

        Transfer transfer = Transfer.builder()
                .user(user)
                .sourceAccount(sourceAccount)
                .destinationAccount(destinationAccount)
                .amount(request.amount())
                .description(request.description() + 
                             (sourceAccount.getCurrency().equalsIgnoreCase(destinationAccount.getCurrency()) ? "" : 
                              " [Convertido de " + sourceAccount.getCurrency() + " a " + destinationAccount.getCurrency() + "]"))
                .build();

        Transfer saved = transferRepository.save(transfer);

        return new TransferResponse(
                saved.getId(),
                sourceAccount.getId(),
                sourceAccount.getName(),
                destinationAccount.getId(),
                destinationAccount.getName(),
                saved.getAmount(),
                saved.getDescription(),
                saved.getTransferDate()
        );
    }
}
