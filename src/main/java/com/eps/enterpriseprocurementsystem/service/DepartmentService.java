package com.eps.enterpriseprocurementsystem.service;

import java.util.List;
import java.util.Optional;

import com.eps.enterpriseprocurementsystem.entity.Department;
import com.eps.enterpriseprocurementsystem.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.eps.enterpriseprocurementsystem.exception.DepartmentNotFoundException;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    // Save a new department
    public Department saveDepartment(Department department) {
        return departmentRepository.save(department);
    }

    // Get all departments
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    // Get a department by ID
    public Department getDepartmentById(Long id) {

        Optional<Department> department = departmentRepository.findById(id);

        if (department.isPresent()) {
            return department.get();
        }

        throw new DepartmentNotFoundException(
                "Department not found with ID : " + id
        );
    }
    public Department updateDepartment(Long id, Department updatedDepartment) {

        Department existingDepartment = getDepartmentById(id);

        existingDepartment.setDepartmentName(updatedDepartment.getDepartmentName());

        existingDepartment.setManagerDepartment(updatedDepartment.getManagerDepartment());

        return departmentRepository.save(existingDepartment);
    }

    public String deleteDepartment(Long id) {

        Department department = getDepartmentById(id);

        departmentRepository.delete(department);

        return "Department deleted successfully.";
    }
}