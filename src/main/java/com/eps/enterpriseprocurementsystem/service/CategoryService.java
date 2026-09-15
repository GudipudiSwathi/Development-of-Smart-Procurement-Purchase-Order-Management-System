package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.CategoryDTO;
import com.eps.enterpriseprocurementsystem.entity.Category;
import com.eps.enterpriseprocurementsystem.entity.Department;
import com.eps.enterpriseprocurementsystem.exception.CategoryAlreadyExistsException;
import com.eps.enterpriseprocurementsystem.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private DepartmentService departmentService;

    // Save Category
    public CategoryDTO saveCategory(CategoryDTO dto) {

        if (categoryRepository.findByCategoryName(dto.getCategoryName()).isPresent()) {
            throw new CategoryAlreadyExistsException("Category already exists.");
        }

        Category category = convertToEntity(dto);

        Category savedCategory = categoryRepository.save(category);

        return convertToDTO(savedCategory);
    }

    // Get All Categories
    public List<CategoryDTO> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // Get Category By ID
    public CategoryDTO getCategoryById(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        return convertToDTO(category);
    }

    // Get Category Entity By ID
    public Category getCategoryEntityById(Long id) {

        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));
    }

    // Update Category
    public CategoryDTO updateCategory(Long id, CategoryDTO dto) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        category.setCategoryName(dto.getCategoryName());

        Department department =
                departmentService.getDepartmentEntityById(dto.getDepartmentId());

        category.setDepartment(department);

        Category updatedCategory = categoryRepository.save(category);

        return convertToDTO(updatedCategory);
    }

    // Delete Category
    public String deleteCategory(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        categoryRepository.delete(category);

        return "Category deleted successfully.";
    }

    // Get Categories By Department ID
    public List<CategoryDTO> getCategoriesByDepartmentId(Long departmentId) {

        return categoryRepository.findByDepartmentDepartmentId(departmentId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // DTO -> Entity
    private Category convertToEntity(CategoryDTO dto) {

        Category category = new Category();

        category.setCategoryId(dto.getCategoryId());
        category.setCategoryName(dto.getCategoryName());

        Department department =
                departmentService.getDepartmentEntityById(dto.getDepartmentId());

        category.setDepartment(department);

        return category;
    }

    // Entity -> DTO
    private CategoryDTO convertToDTO(Category category) {

        CategoryDTO dto = new CategoryDTO();

        dto.setCategoryId(category.getCategoryId());
        dto.setCategoryName(category.getCategoryName());
        dto.setDepartmentId(category.getDepartment().getDepartmentId());

        return dto;
    }
}