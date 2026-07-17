package com.gestorgastos.repository;

import com.gestorgastos.model.Budget;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    Optional<Budget> findByUserIdAndCategoryIdAndMonthPeriod(Long userId, Long categoryId, Integer monthPeriod);

    List<Budget> findByUserId(Long userId);
}
