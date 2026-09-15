package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.CategoryDTO;
import com.eps.enterpriseprocurementsystem.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // Save Category
    @PostMapping
    public CategoryDTO saveCategory(@Valid @RequestBody CategoryDTO dto) {

        return categoryService.saveCategory(dto);
    }

    // Get All Categories
    @GetMapping
    public List<CategoryDTO> getAllCategories() {

        return categoryService.getAllCategories();
    }

    // Get Category By ID
    @GetMapping("/{id}")
    public CategoryDTO getCategoryById(@PathVariable Long id) {

        return categoryService.getCategoryById(id);
    }

    // Update Category
    @PutMapping("/{id}")
    public CategoryDTO updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryDTO dto) {

        return categoryService.updateCategory(id, dto);
    }

    // Delete Category
    @DeleteMapping("/{id}")
    public String deleteCategory(@PathVariable Long id) {

        return categoryService.deleteCategory(id);
    }

}