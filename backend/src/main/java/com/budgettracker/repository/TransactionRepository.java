package com.budgettracker.repository;

import com.budgettracker.entity.Transaction;
import com.budgettracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserOrderByDateDesc(User user);
    
    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND YEAR(t.date) = :year AND MONTH(t.date) = :month ORDER BY t.date DESC")
    List<Transaction> findByUserAndYearAndMonth(
        @Param("user") User user, 
        @Param("year") int year, 
        @Param("month") int month
    );
    
    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.date BETWEEN :startDate AND :endDate ORDER BY t.date DESC")
    List<Transaction> findByUserAndDateBetween(
        @Param("user") User user,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
