package com.gestorgastos.controller;

import com.gestorgastos.dto.CategoryRequest;
import com.gestorgastos.dto.CategoryResponse;
import com.gestorgastos.exception.ResourceNotFoundException;
import com.gestorgastos.model.User;
import com.gestorgastos.service.CategorizationService;
import com.gestorgastos.service.CategoryService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final CategorizationService categorizationService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(@AuthenticationPrincipal User user) {
        List<CategoryResponse> categories = categoryService.getCategoriesByUserId(user.getId());
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/suggest")
    public ResponseEntity<CategoryResponse> suggestCategory(
            @AuthenticationPrincipal User user,
            @RequestParam String description) {
        CategoryResponse response = categorizationService.suggestCategory(user.getId(), description)
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getIcon()))
                .orElseThrow(() -> new ResourceNotFoundException("No se pudo sugerir categoría"));
        return ResponseEntity.ok(response);
    }
}
