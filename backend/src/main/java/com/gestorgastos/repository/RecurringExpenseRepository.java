package com.gestorgastos.repository;

import com.gestorgastos.model.RecurringExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, Long> {

    List<RecurringExpense> findAllByActiveTrueAndNextExecutionDateLessThanEqual(LocalDate date);

    List<RecurringExpense> findByUserId(Long userId);
}
