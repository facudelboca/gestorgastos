package com.gestorgastos.harness;

import com.gestorgastos.model.*;
import com.gestorgastos.repository.AccountRepository;
import com.gestorgastos.repository.CategoryRepository;
import com.gestorgastos.repository.TransactionRepository;
import com.gestorgastos.repository.UserRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TestDataFixtures {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(String email, String firstName) {
        User user = User.builder()
                .email(email)
                .firstName(firstName)
                .passwordHash(passwordEncoder.encode("Password123!"))
                .build();
        return userRepository.save(user);
    }

    public User createRandomUser() {
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        return createUser("user_" + randomSuffix + "@test.com", "Test User " + randomSuffix);
    }

    public Account createAccount(User user, String name, BigDecimal initialBalance, String currency) {
        Account account = Account.builder()
                .user(user)
                .name(name)
                .balance(initialBalance)
                .currency(currency)
                .build();
        return accountRepository.save(account);
    }

    public Account createDefaultAccount(User user) {
        return createAccount(user, "Cuenta Principal", new BigDecimal("150000.00"), "ARS");
    }

    public Category createCategory(User user, String name, String icon) {
        Category category = Category.builder()
                .user(user)
                .name(name)
                .icon(icon)
                .build();
        return categoryRepository.save(category);
    }

    public Category createGlobalCategory(String name, String icon) {
        Category category = Category.builder()
                .user(null)
                .name(name)
                .icon(icon)
                .build();
        return categoryRepository.save(category);
    }

    public Transaction createTransaction(Account account, Category category, BigDecimal amount, TransactionType type, String description, OffsetDateTime date) {
        Transaction transaction = Transaction.builder()
                .account(account)
                .category(category)
                .amount(amount)
                .type(type)
                .description(description)
                .transactionDate(date != null ? date : OffsetDateTime.now())
                .build();
        return transactionRepository.save(transaction);
    }
}
