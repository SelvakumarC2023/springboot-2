package com.budgettracker.service;

import com.budgettracker.dto.TransactionDto;
import com.budgettracker.entity.Transaction;
import com.budgettracker.entity.User;
import com.budgettracker.exception.ResourceNotFoundException;
import com.budgettracker.repository.CategoryRepository;
import com.budgettracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public List<TransactionDto> getAllTransactions() {
        User user = getCurrentUser();
        return transactionRepository.findByUserOrderByDateDesc(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TransactionDto> getTransactionsByMonth(int year, int month) {
        User user = getCurrentUser();
        return transactionRepository.findByUserAndYearAndMonth(user, year, month).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public TransactionDto getTransactionById(Long id) {
        return mapToDto(getTransactionEntity(id));
    }

    public TransactionDto createTransaction(TransactionDto transactionDto) {
        User user = getCurrentUser();
        Transaction transaction = new Transaction();
        mapToEntity(transactionDto, transaction, user);
        return mapToDto(transactionRepository.save(transaction));
    }

    public TransactionDto updateTransaction(Long id, TransactionDto transactionDto) {
        Transaction transaction = getTransactionEntity(id);
        User user = getCurrentUser();
        if (!transaction.getUser().equals(user)) {
            throw new ResourceNotFoundException("Transaction not found");
        }
        mapToEntity(transactionDto, transaction, user);
        return mapToDto(transactionRepository.save(transaction));
    }

    public void deleteTransaction(Long id) {
        Transaction transaction = getTransactionEntity(id);
        User user = getCurrentUser();
        if (!transaction.getUser().equals(user)) {
            throw new ResourceNotFoundException("Transaction not found");
        }
        transactionRepository.delete(transaction);
    }

    private Transaction getTransactionEntity(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
    }

    private void mapToEntity(TransactionDto dto, Transaction entity, User user) {
        entity.setDescription(dto.getDescription());
        entity.setAmount(dto.getAmount());
        entity.setDate(dto.getDate());
        entity.setType(dto.getType());
        entity.setUser(user);
        
        if (dto.getCategoryId() != null) {
            categoryRepository.findById(dto.getCategoryId())
                    .ifPresent(entity::setCategory);
        } else {
            entity.setCategory(null);
        }
    }

    private TransactionDto mapToDto(Transaction transaction) {
        return TransactionDto.builder()
                .id(transaction.getId())
                .description(transaction.getDescription())
                .amount(transaction.getAmount())
                .date(transaction.getDate())
                .type(transaction.getType())
                .categoryId(transaction.getCategory() != null ? transaction.getCategory().getId() : null)
                .categoryName(transaction.getCategory() != null ? transaction.getCategory().getName() : null)
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userService.findByEmail(email);
    }
}
