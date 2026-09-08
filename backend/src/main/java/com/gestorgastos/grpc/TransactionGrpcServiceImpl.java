package com.gestorgastos.grpc;

import com.gestorgastos.dto.CreateTransactionRequest;
import com.gestorgastos.dto.TransactionResponse;
import com.gestorgastos.model.Transaction;
import com.gestorgastos.model.TransactionType;
import com.gestorgastos.repository.TransactionRepository;
import com.gestorgastos.service.TransactionService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionGrpcServiceImpl extends TransactionGrpcServiceGrpc.TransactionGrpcServiceImplBase {

    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;

    @Override
    @Transactional(readOnly = true)
    public void getTransactionsByUser(UserTransactionsRequest request, StreamObserver<TransactionListResponse> responseObserver) {
        try {
            List<Transaction> transactions = transactionRepository.findByAccountUserIdOrderByTransactionDateDesc(request.getUserId());
            
            TransactionListResponse.Builder responseBuilder = TransactionListResponse.newBuilder();
            for (Transaction t : transactions) {
                responseBuilder.addTransactions(mapToProto(t));
            }
            responseBuilder.setTotalCount(transactions.size());

            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error in getTransactionsByUser gRPC call", e);
            responseObserver.onError(Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void getTransactionById(TransactionIdRequest request, StreamObserver<TransactionDetailResponse> responseObserver) {
        try {
            Transaction transaction = transactionRepository.findById(request.getTransactionId())
                    .orElse(null);

            if (transaction == null) {
                responseObserver.onError(Status.NOT_FOUND.withDescription("Transacción no encontrada").asRuntimeException());
                return;
            }

            if (request.getUserId() > 0 && !transaction.getAccount().getUser().getId().equals(request.getUserId())) {
                responseObserver.onError(Status.PERMISSION_DENIED.withDescription("No autorizado").asRuntimeException());
                return;
            }

            responseObserver.onNext(mapToProto(transaction));
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error in getTransactionById gRPC call", e);
            responseObserver.onError(Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void createTransaction(com.gestorgastos.grpc.CreateTransactionRequest request, StreamObserver<TransactionDetailResponse> responseObserver) {
        try {
            TransactionType type = TransactionType.valueOf(request.getType());
            CreateTransactionRequest dto = new CreateTransactionRequest(
                    request.getAccountId(),
                    request.getCategoryId(),
                    BigDecimal.valueOf(request.getAmount()),
                    type,
                    request.getDescription(),
                    OffsetDateTime.now()
            );

            TransactionResponse created = transactionService.createTransaction(request.getUserId(), dto);

            TransactionDetailResponse response = TransactionDetailResponse.newBuilder()
                    .setId(created.id())
                    .setAmount(created.amount().doubleValue())
                    .setType(created.type().name())
                    .setDescription(created.description() != null ? created.description() : "")
                    .setTransactionDate(created.transactionDate().toString())
                    .setCategoryName(created.categoryName() != null ? created.categoryName() : "")
                    .setAccountName(created.accountName() != null ? created.accountName() : "")
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (IllegalArgumentException e) {
            responseObserver.onError(Status.INVALID_ARGUMENT.withDescription(e.getMessage()).asRuntimeException());
        } catch (Exception e) {
            log.error("Error in createTransaction gRPC call", e);
            responseObserver.onError(Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    private TransactionDetailResponse mapToProto(Transaction t) {
        return TransactionDetailResponse.newBuilder()
                .setId(t.getId())
                .setAmount(t.getAmount().doubleValue())
                .setType(t.getType().name())
                .setDescription(t.getDescription() != null ? t.getDescription() : "")
                .setTransactionDate(t.getTransactionDate() != null ? t.getTransactionDate().toString() : "")
                .setCategoryName(t.getCategory() != null ? t.getCategory().getName() : "")
                .setAccountName(t.getAccount() != null ? t.getAccount().getName() : "")
                .build();
    }
}
