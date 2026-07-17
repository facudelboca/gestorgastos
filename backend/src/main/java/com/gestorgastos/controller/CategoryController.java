package com.gestorgastos.controller;

import com.gestorgastos.dto.CategoryRequest;
import com.gestorgastos.dto.CategoryResponse;
import com.gestorgastos.model.User;
import com.gestorgastos.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

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
}
