package com.gestorgastos.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.gestorgastos.dto.SavingsGoalAllocationRequest;
import com.gestorgastos.dto.SavingsGoalRequest;
import com.gestorgastos.dto.SavingsGoalResponse;
import com.gestorgastos.exception.BusinessException;
import com.gestorgastos.model.Account;
import com.gestorgastos.model.SavingsGoal;
import com.gestorgastos.model.SavingsGoalStatus;
import com.gestorgastos.model.User;
import com.gestorgastos.repository.AccountRepository;
import com.gestorgastos.repository.SavingsGoalRepository;
import com.gestorgastos.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class SavingsGoalServiceTest {

    @Mock
    private SavingsGoalRepository savingsGoalRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SavingsGoalService savingsGoalService;

    @Test
    public void testCreateGoal_success() {
        SavingsGoalRequest request = new SavingsGoalRequest("Comprar Auto", BigDecimal.valueOf(5000), LocalDate.now().plusYears(1));
        User user = User.builder().id(1L).email("user@test.com").build();

        SavingsGoal savedGoal = SavingsGoal.builder()
                .id(1L)
                .user(user)
                .title("Comprar Auto")
                .targetAmount(BigDecimal.valueOf(5000))
                .currentAmount(BigDecimal.ZERO)
                .targetDate(request.targetDate())
                .status(SavingsGoalStatus.ACTIVE)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(savingsGoalRepository.save(any(SavingsGoal.class))).thenReturn(savedGoal);

        SavingsGoalResponse response = savingsGoalService.createGoal(1L, request);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Comprar Auto", response.title());
        assertEquals(BigDecimal.valueOf(5000), response.targetAmount());
        assertEquals(BigDecimal.ZERO, response.currentAmount());
        assertEquals(SavingsGoalStatus.ACTIVE, response.status());
    }

    @Test
    public void testAllocateFunds_insufficientBalance_shouldThrowBusinessException() {
        SavingsGoalAllocationRequest request = new SavingsGoalAllocationRequest(10L, BigDecimal.valueOf(200));
        User user = User.builder().id(1L).email("user@test.com").build();
        SavingsGoal goal = SavingsGoal.builder().id(1L).user(user).targetAmount(BigDecimal.valueOf(1000)).currentAmount(BigDecimal.ZERO).status(SavingsGoalStatus.ACTIVE).build();
        Account account = Account.builder().id(10L).user(user).balance(BigDecimal.valueOf(150)).currency("USD").build();

        when(userRepository.existsById(1L)).thenReturn(true);
        when(savingsGoalRepository.findById(1L)).thenReturn(Optional.of(goal));
        when(accountRepository.findById(10L)).thenReturn(Optional.of(account));

        assertThrows(BusinessException.class, () -> savingsGoalService.allocateFunds(1L, 1L, request));
    }

    @Test
    public void testAllocateFunds_successAndAutoCompleted() {
        SavingsGoalAllocationRequest request = new SavingsGoalAllocationRequest(10L, BigDecimal.valueOf(300));
        User user = User.builder().id(1L).email("user@test.com").build();
        // Límite de la meta es 500, acumulado actual es 250. Al sumar 300 llega a 550, completando la meta.
        SavingsGoal goal = SavingsGoal.builder()
                .id(1L)
                .user(user)
                .title("Viaje")
                .targetAmount(BigDecimal.valueOf(500))
                .currentAmount(BigDecimal.valueOf(250))
                .status(SavingsGoalStatus.ACTIVE)
                .build();
        Account account = Account.builder().id(10L).user(user).balance(BigDecimal.valueOf(1000)).currency("USD").build();

        when(userRepository.existsById(1L)).thenReturn(true);
        when(savingsGoalRepository.findById(1L)).thenReturn(Optional.of(goal));
        when(accountRepository.findById(10L)).thenReturn(Optional.of(account));
        when(savingsGoalRepository.save(any(SavingsGoal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SavingsGoalResponse response = savingsGoalService.allocateFunds(1L, 1L, request);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(700), account.getBalance());      // 1000 - 300
        assertEquals(BigDecimal.valueOf(550), response.currentAmount()); // 250 + 300
        assertEquals(SavingsGoalStatus.COMPLETED, response.status());

        verify(accountRepository, times(1)).save(account);
        verify(savingsGoalRepository, times(1)).save(goal);
    }
}
