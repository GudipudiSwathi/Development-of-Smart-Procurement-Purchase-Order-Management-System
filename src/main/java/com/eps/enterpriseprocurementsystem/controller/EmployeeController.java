package com.eps.enterpriseprocurementsystem.controller;

import com.eps.enterpriseprocurementsystem.dto.EmployeeDTO;
import com.eps.enterpriseprocurementsystem.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @PostMapping
    public EmployeeDTO saveEmployee(@Valid @RequestBody EmployeeDTO dto) {

        return employeeService.saveEmployee(dto);
    }

    @GetMapping
    public List<EmployeeDTO> getAllEmployees() {

        return employeeService.getAllEmployees();
    }

    @GetMapping("/{id}")
    public EmployeeDTO getEmployeeById(@PathVariable Long id) {

        return employeeService.getEmployeeById(id);
    }

    @PutMapping("/{id}")
    public EmployeeDTO updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeDTO dto) {

        return employeeService.updateEmployee(id, dto);
    }

    @DeleteMapping("/{id}")
    public String deleteEmployee(@PathVariable Long id) {

        return employeeService.deleteEmployee(id);
    }
}