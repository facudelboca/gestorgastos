package com.gestorgastos.service;

import com.gestorgastos.dto.SavingsGoalAllocationRequest;
import com.gestorgastos.dto.SavingsGoalRequest;
import com.gestorgastos.dto.SavingsGoalResponse;
import com.gestorgastos.exception.BusinessException;
import com.gestorgastos.exception.ResourceNotFoundException;
import com.gestorgastos.model.Account;
import com.gestorgastos.model.SavingsGoal;
import com.gestorgastos.model.SavingsGoalStatus;
import com.gestorgastos.model.User;
import com.gestorgastos.repository.AccountRepository;
import com.gestorgastos.repository.SavingsGoalRepository;
import com.gestorgastos.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional
    public SavingsGoalResponse createGoal(Long userId, SavingsGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el usuario con ID: " + userId));

        SavingsGoal goal = SavingsGoal.builder()
                .user(user)
                .title(request.title())
                .targetAmount(request.targetAmount())
                .targetDate(request.targetDate())
                .status(SavingsGoalStatus.ACTIVE)
                .currentAmount(java.math.BigDecimal.ZERO)
                .build();

        SavingsGoal saved = savingsGoalRepository.save(goal);

        return mapToResponse(saved);
    }

    @Transactional
    public SavingsGoalResponse allocateFunds(Long userId, Long goalId, SavingsGoalAllocationRequest request) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("No se encontró el usuario con ID: " + userId);
        }

        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la meta de ahorro con ID: " + goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new BusinessException("La meta de ahorro no pertenece al usuario autenticado");
        }

        if (goal.getStatus() == SavingsGoalStatus.COMPLETED) {
            throw new BusinessException("La meta de ahorro ya se encuentra completada");
        }

        Account account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la cuenta con ID: " + request.accountId()));

        if (!account.getUser().getId().equals(userId)) {
            throw new BusinessException("La cuenta física elegida no pertenece al usuario autenticado");
        }

        if (account.getBalance().compareTo(request.amount()) < 0) {
            throw new BusinessException("Saldo insuficiente en la cuenta para destinar a la meta de ahorro");
        }

        account.setBalance(account.getBalance().subtract(request.amount()));
        accountRepository.save(account);

        goal.setCurrentAmount(goal.getCurrentAmount().add(request.amount()));

        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(SavingsGoalStatus.COMPLETED);
        }

        SavingsGoal updated = savingsGoalRepository.save(goal);

        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<SavingsGoalResponse> getGoals(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("No se encontró el usuario con ID: " + userId);
        }
        return savingsGoalRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private SavingsGoalResponse mapToResponse(SavingsGoal goal) {
        return new SavingsGoalResponse(
                goal.getId(),
                goal.getTitle(),
                goal.getTargetAmount(),
                goal.getCurrentAmount(),
                goal.getTargetDate(),
                goal.getStatus(),
                goal.getCreatedAt()
        );
    }
}
