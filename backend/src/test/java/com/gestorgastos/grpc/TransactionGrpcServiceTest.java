package com.gestorgastos.grpc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.gestorgastos.model.*;
import com.gestorgastos.repository.AccountRepository;
import com.gestorgastos.repository.CategoryRepository;
import com.gestorgastos.repository.TransactionRepository;
import com.gestorgastos.repository.UserRepository;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class TransactionGrpcServiceTest {

    @Autowired
    private GrpcServerManager grpcServerManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private ManagedChannel channel;
    private TransactionGrpcServiceGrpc.TransactionGrpcServiceBlockingStub stub;

    private User testUser;
    private Account testAccount;
    private Category testCategory;
    private Transaction testTransaction;

    @BeforeEach
    void setUp() {
        // Clean up DB before test
        transactionRepository.deleteAll();
        accountRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        channel = ManagedChannelBuilder.forAddress("localhost", grpcServerManager.getPort())
                .usePlaintext()
                .build();
        stub = TransactionGrpcServiceGrpc.newBlockingStub(channel);

        testUser = userRepository.save(User.builder()
                .email("grpc_user@test.com")
                .passwordHash("$2a$10$hashedpassword")
                .firstName("gRPC User")
                .build());

        testAccount = accountRepository.save(Account.builder()
                .user(testUser)
                .name("gRPC Bank Account")
                .balance(new BigDecimal("5000.00"))
                .currency("ARS")
                .build());

        testCategory = categoryRepository.save(Category.builder()
                .name("Servicios Cloud")
                .icon("cloud")
                .user(testUser)
                .build());

        testTransaction = transactionRepository.save(Transaction.builder()
                .account(testAccount)
                .category(testCategory)
                .amount(new BigDecimal("150.75"))
                .type(TransactionType.EXPENSE)
                .description("Suscripción gRPC API")
                .transactionDate(OffsetDateTime.now())
                .build());
    }

    @AfterEach
    void tearDown() throws InterruptedException {
        if (channel != null && !channel.isShutdown()) {
            channel.shutdownNow().awaitTermination(5, TimeUnit.SECONDS);
        }
        transactionRepository.deleteAll();
        accountRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("gRPC: GetTransactionsByUser retorna la lista de transacciones del usuario")
    void testGetTransactionsByUser() {
        UserTransactionsRequest request = UserTransactionsRequest.newBuilder()
                .setUserId(testUser.getId())
                .build();

        TransactionListResponse response = stub.getTransactionsByUser(request);

        assertThat(response).isNotNull();
        assertThat(response.getTotalCount()).isEqualTo(1);
        assertThat(response.getTransactionsList()).hasSize(1);
        
        TransactionDetailResponse tx = response.getTransactions(0);
        assertThat(tx.getId()).isEqualTo(testTransaction.getId());
        assertThat(tx.getAmount()).isEqualTo(150.75);
        assertThat(tx.getDescription()).isEqualTo("Suscripción gRPC API");
        assertThat(tx.getType()).isEqualTo("EXPENSE");
    }

    @Test
    @DisplayName("gRPC: GetTransactionById retorna el detalle de la transacción")
    void testGetTransactionById() {
        TransactionIdRequest request = TransactionIdRequest.newBuilder()
                .setTransactionId(testTransaction.getId())
                .setUserId(testUser.getId())
                .build();

        TransactionDetailResponse response = stub.getTransactionById(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(testTransaction.getId());
        assertThat(response.getAmount()).isEqualTo(150.75);
        assertThat(response.getAccountName()).isEqualTo("gRPC Bank Account");
        assertThat(response.getCategoryName()).isEqualTo("Servicios Cloud");
    }

    @Test
    @DisplayName("gRPC: GetTransactionById lanza NOT_FOUND si la transacción no existe")
    void testGetTransactionByIdNotFound() {
        TransactionIdRequest request = TransactionIdRequest.newBuilder()
                .setTransactionId(99999L)
                .setUserId(testUser.getId())
                .build();

        assertThatThrownBy(() -> stub.getTransactionById(request))
                .isInstanceOf(StatusRuntimeException.class)
                .hasMessageContaining("NOT_FOUND");
    }

    @Test
    @DisplayName("gRPC: CreateTransaction crea una nueva transacción y actualiza el saldo")
    void testCreateTransaction() {
        CreateTransactionRequest request = CreateTransactionRequest.newBuilder()
                .setUserId(testUser.getId())
                .setAccountId(testAccount.getId())
                .setCategoryId(testCategory.getId())
                .setAmount(200.0)
                .setType("EXPENSE")
                .setDescription("Gasto creado via gRPC")
                .build();

        TransactionDetailResponse response = stub.createTransaction(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isPositive();
        assertThat(response.getAmount()).isEqualTo(200.0);
        assertThat(response.getDescription()).isEqualTo("Gasto creado via gRPC");

        Account updatedAccount = accountRepository.findById(testAccount.getId()).orElseThrow();
        assertThat(updatedAccount.getBalance()).isEqualByComparingTo(new BigDecimal("4800.00"));
    }
}
