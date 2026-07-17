package com.gestorgastos.service;

import com.gestorgastos.dto.CategoryRequest;
import com.gestorgastos.dto.CategoryResponse;
import com.gestorgastos.exception.ResourceNotFoundException;
import com.gestorgastos.model.Category;
import com.gestorgastos.model.User;
import com.gestorgastos.repository.CategoryRepository;
import com.gestorgastos.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("No se encontró el usuario con ID: " + userId);
        }
        return categoryRepository.findByUserId(userId).stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getIcon()))
                .toList();
    }

    @Transactional
    public CategoryResponse createCategory(Long userId, CategoryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el usuario con ID: " + userId));

        Category category = Category.builder()
                .name(request.name().trim())
                .icon(request.icon().trim())
                .user(user)
                .build();

        Category saved = categoryRepository.save(category);

        return new CategoryResponse(saved.getId(), saved.getName(), saved.getIcon());
    }
}
