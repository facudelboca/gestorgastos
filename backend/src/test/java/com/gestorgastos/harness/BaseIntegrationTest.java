package com.gestorgastos.harness;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gestorgastos.repository.AccountRepository;
import com.gestorgastos.repository.BudgetRepository;
import com.gestorgastos.repository.CategoryRepository;
import com.gestorgastos.repository.RecurringExpenseRepository;
import com.gestorgastos.repository.SavingsGoalRepository;
import com.gestorgastos.repository.TransactionRepository;
import com.gestorgastos.repository.TransferRepository;
import com.gestorgastos.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(classes = com.gestorgastos.GestorgastosApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    protected ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected AccountRepository accountRepository;

    @Autowired
    protected CategoryRepository categoryRepository;

    @Autowired
    protected TransactionRepository transactionRepository;

    @Autowired
    protected BudgetRepository budgetRepository;

    @Autowired
    protected SavingsGoalRepository savingsGoalRepository;

    @Autowired
    protected RecurringExpenseRepository recurringExpenseRepository;

    @Autowired
    protected TransferRepository transferRepository;

    @Autowired
    protected TestDataFixtures fixtures;

    @Autowired
    protected TestAuthHelper authHelper;
}
