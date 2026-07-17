package com.gestorgastos.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.gestorgastos.dto.TransferRequest;
import com.gestorgastos.dto.TransferResponse;
import com.gestorgastos.exception.BusinessException;
import com.gestorgastos.model.Account;
import com.gestorgastos.model.Transfer;
import com.gestorgastos.model.User;
import com.gestorgastos.repository.AccountRepository;
import com.gestorgastos.repository.TransferRepository;
import com.gestorgastos.repository.UserRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class TransferServiceTest {

    @Mock
    private TransferRepository transferRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ExchangeRateService exchangeRateService;

    @InjectMocks
    private TransferService transferService;

    @Test
    public void testExecuteTransfer_sameAccount_shouldThrowBusinessException() {
        TransferRequest request = new TransferRequest(1L, 1L, BigDecimal.TEN, "Test");
        User user = User.builder().id(1L).email("user@test.com").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(BusinessException.class, () -> transferService.executeTransfer(1L, request));
    }

    @Test
    public void testExecuteTransfer_accountDoesNotBelongToUser_shouldThrowBusinessException() {
        TransferRequest request = new TransferRequest(1L, 2L, BigDecimal.TEN, "Test");
        User user = User.builder().id(1L).email("user@test.com").build();
        User maliciousUser = User.builder().id(3L).email("hacker@test.com").build();

        Account source = Account.builder().id(1L).user(user).balance(BigDecimal.valueOf(100)).currency("USD").build();
        Account dest = Account.builder().id(2L).user(maliciousUser).balance(BigDecimal.valueOf(10)).currency("USD").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(source));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(dest));

        assertThrows(BusinessException.class, () -> transferService.executeTransfer(1L, request));
    }

    @Test
    public void testExecuteTransfer_insufficientFunds_shouldThrowBusinessException() {
        TransferRequest request = new TransferRequest(1L, 2L, BigDecimal.valueOf(150), "Test");
        User user = User.builder().id(1L).email("user@test.com").build();

        Account source = Account.builder().id(1L).user(user).balance(BigDecimal.valueOf(100)).currency("USD").build();
        Account dest = Account.builder().id(2L).user(user).balance(BigDecimal.valueOf(10)).currency("USD").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(source));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(dest));

        assertThrows(BusinessException.class, () -> transferService.executeTransfer(1L, request));
    }

    @Test
    public void testExecuteTransfer_successSameCurrency() {
        TransferRequest request = new TransferRequest(1L, 2L, BigDecimal.valueOf(40), "Traspaso");
        User user = User.builder().id(1L).email("user@test.com").build();

        Account source = Account.builder().id(1L).user(user).balance(BigDecimal.valueOf(100)).currency("USD").build();
        Account dest = Account.builder().id(2L).user(user).balance(BigDecimal.valueOf(10)).currency("USD").build();

        Transfer savedTransfer = Transfer.builder()
                .id(100L)
                .user(user)
                .sourceAccount(source)
                .destinationAccount(dest)
                .amount(BigDecimal.valueOf(40))
                .description("Traspaso")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(source));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(dest));
        when(transferRepository.save(any(Transfer.class))).thenReturn(savedTransfer);

        TransferResponse response = transferService.executeTransfer(1L, request);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(60), source.getBalance()); // 100 - 40
        assertEquals(BigDecimal.valueOf(50), dest.getBalance());   // 10 + 40

        verify(accountRepository, times(1)).save(source);
        verify(accountRepository, times(1)).save(dest);
        verify(transferRepository, times(1)).save(any(Transfer.class));
    }

    @Test
    public void testExecuteTransfer_successCrossCurrency_shouldApplyExchangeRate() {
        TransferRequest request = new TransferRequest(1L, 2L, BigDecimal.valueOf(50), "Traspaso a pesos");
        User user = User.builder().id(1L).email("user@test.com").build();

        Account source = Account.builder().id(1L).user(user).balance(BigDecimal.valueOf(100)).currency("USD").build();
        Account dest = Account.builder().id(2L).user(user).balance(BigDecimal.valueOf(1000)).currency("ARS").build();

        Transfer savedTransfer = Transfer.builder()
                .id(100L)
                .user(user)
                .sourceAccount(source)
                .destinationAccount(dest)
                .amount(BigDecimal.valueOf(50))
                .description("Traspaso a pesos [Convertido de USD a ARS]")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(source));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(dest));
        when(exchangeRateService.convert(BigDecimal.valueOf(50), "USD", "ARS"))
                .thenReturn(BigDecimal.valueOf(45000));
        when(transferRepository.save(any(Transfer.class))).thenReturn(savedTransfer);

        TransferResponse response = transferService.executeTransfer(1L, request);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(50), source.getBalance());     // 100 - 50
        assertEquals(BigDecimal.valueOf(46000), dest.getBalance());   // 1000 + 45000 (cotización)

        verify(exchangeRateService, times(1)).convert(BigDecimal.valueOf(50), "USD", "ARS");
        verify(accountRepository, times(1)).save(source);
        verify(accountRepository, times(1)).save(dest);
    }
}
