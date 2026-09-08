package com.gestorgastos.repository;

import com.gestorgastos.model.Transaction;
import com.gestorgastos.model.TransactionType;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t WHERE " +
           "(:accountId IS NULL OR t.account.id = :accountId) AND " +
           "(:categoryId IS NULL OR t.category.id = :categoryId) AND " +
           "(:startDate IS NULL OR t.transactionDate >= :startDate) AND " +
           "(:endDate IS NULL OR t.transactionDate <= :endDate)")
    Page<Transaction> findFiltered(
            @Param("accountId") Long accountId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate,
            Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.account.user.id = :userId " +
           "AND t.category.id = :categoryId " +
           "AND t.type = :type " +
           "AND t.transactionDate >= :startDate " +
           "AND t.transactionDate <= :endDate")
    BigDecimal sumAmountByUserIdAndCategoryIdAndTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("type") TransactionType type,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate
    );

    @Query("SELECT t.category.id, t.category.name, SUM(t.amount) " +
           "FROM Transaction t " +
           "WHERE t.account.user.id = :userId " +
           "AND t.type = :type " +
           "AND t.transactionDate >= :startDate " +
           "AND t.transactionDate <= :endDate " +
           "GROUP BY t.category.id, t.category.name")
    List<Object[]> sumAmountGroupedByCategory(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate
    );

    List<Transaction> findByAccountUserIdAndTypeAndTransactionDateBetween(
            Long userId,
            TransactionType type,
            OffsetDateTime startDate,
            OffsetDateTime endDate
    );

    List<Transaction> findByAccountUserIdOrderByTransactionDateDesc(Long userId);

    @Query("SELECT t FROM Transaction t WHERE " +
           "t.account.user.id = :userId AND " +
           "(:accountId IS NULL OR t.account.id = :accountId) AND " +
           "(:categoryId IS NULL OR t.category.id = :categoryId) AND " +
           "(:type IS NULL OR t.type = :type) AND " +
           "(:startDate IS NULL OR t.transactionDate >= :startDate) AND " +
           "(:endDate IS NULL OR t.transactionDate <= :endDate) " +
           "ORDER BY t.transactionDate DESC")
    List<Transaction> findUserTransactionsFiltered(
            @Param("userId") Long userId,
            @Param("accountId") Long accountId,
            @Param("categoryId") Long categoryId,
            @Param("type") TransactionType type,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate
    );
}
