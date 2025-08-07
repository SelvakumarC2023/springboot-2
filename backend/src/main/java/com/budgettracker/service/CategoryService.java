package com.budgettracker.service;

import com.budgettracker.dto.CategoryDto;
import com.budgettracker.entity.Category;
import com.budgettracker.entity.User;
import com.budgettracker.exception.ResourceNotFoundException;
import com.budgettracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public List<CategoryDto> getAllCategories() {
        User user = getCurrentUser();
        return categoryRepository.findByUserOrUserIsNull(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CategoryDto getCategoryById(Long id) {
        return mapToDto(getCategoryEntity(id));
    }

    public CategoryDto createCategory(CategoryDto categoryDto) {
        User user = getCurrentUser();
        Category category = new Category();
        mapToEntity(categoryDto, category, user);
        return mapToDto(categoryRepository.save(category));
    }

    public CategoryDto updateCategory(Long id, CategoryDto categoryDto) {
        Category category = getCategoryEntity(id);
        User user = getCurrentUser();
        if (category.getUser() != null && !category.getUser().equals(user)) {
            throw new ResourceNotFoundException("Category not found");
        }
        mapToEntity(categoryDto, category, user);
        return mapToDto(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {
        Category category = getCategoryEntity(id);
        User user = getCurrentUser();
        if (category.getUser() != null && !category.getUser().equals(user)) {
            throw new ResourceNotFoundException("Category not found");
        }
        // Check if category is being used by any transactions
        if (!category.getTransactions().isEmpty()) {
            throw new IllegalStateException("Cannot delete category with existing transactions");
        }
        categoryRepository.delete(category);
    }

    private Category getCategoryEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private void mapToEntity(CategoryDto dto, Category entity, User user) {
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setType(dto.getType());
        if (dto.getUserId() != null) {
            entity.setUser(user);
        }
    }

    private CategoryDto mapToDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .type(category.getType())
                .userId(category.getUser() != null ? category.getUser().getId() : null)
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userService.findByEmail(email);
    }
}
