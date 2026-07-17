package com.gestorgastos.service;

import com.gestorgastos.dto.AccountRequest;
import com.gestorgastos.dto.AccountResponse;
import com.gestorgastos.exception.ResourceNotFoundException;
import com.gestorgastos.model.Account;
import com.gestorgastos.model.User;
import com.gestorgastos.repository.AccountRepository;
import com.gestorgastos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional
    public AccountResponse createAccount(Long userId, AccountRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el usuario con ID: " + userId));

        Account account = Account.builder()
                .user(user)
                .name(request.name())
                .balance(request.balance())
                .currency(request.currency())
                .build();

        Account saved = accountRepository.save(account);

        return new AccountResponse(
                saved.getId(),
                saved.getName(),
                saved.getBalance(),
                saved.getCurrency(),
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getAccounts(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("No se encontró el usuario con ID: " + userId);
        }
        return accountRepository.findByUserId(userId).stream()
                .map(acc -> new AccountResponse(
                        acc.getId(),
                        acc.getName(),
                        acc.getBalance(),
                        acc.getCurrency(),
                        acc.getCreatedAt()
                ))
                .toList();
    }
}
