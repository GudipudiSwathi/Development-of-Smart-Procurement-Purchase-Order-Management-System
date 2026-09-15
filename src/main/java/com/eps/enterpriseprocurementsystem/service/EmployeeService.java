package com.eps.enterpriseprocurementsystem.service;

import com.eps.enterpriseprocurementsystem.dto.EmployeeDTO;
import com.eps.enterpriseprocurementsystem.entity.Department;
import com.eps.enterpriseprocurementsystem.entity.Employee;
import com.eps.enterpriseprocurementsystem.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentService departmentService;

    public EmployeeDTO saveEmployee(EmployeeDTO dto) {

        Employee employee = convertToEntity(dto);

        Employee savedEmployee = employeeRepository.save(employee);

        return convertToDTO(savedEmployee);
    }

    public List<EmployeeDTO> getAllEmployees() {

        return employeeRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    public EmployeeDTO getEmployeeById(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        return convertToDTO(employee);
    }

    public EmployeeDTO updateEmployee(Long id, EmployeeDTO dto) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setEmployeeName(dto.getEmployeeName());
        employee.setEmail(dto.getEmail());
        employee.setSalary(dto.getSalary());
        employee.setDesignation(dto.getDesignation());

        Department department =
                departmentService.getDepartmentEntityById(dto.getDepartmentId());

        employee.setDepartment(department);

        return convertToDTO(employeeRepository.save(employee));
    }

    public String deleteEmployee(Long id) {

        employeeRepository.deleteById(id);

        return "Employee deleted successfully.";
    }

    private Employee convertToEntity(EmployeeDTO dto) {

        Employee employee = new Employee();

        employee.setEmployeeId(dto.getEmployeeId());
        employee.setEmployeeName(dto.getEmployeeName());
        employee.setEmail(dto.getEmail());
        employee.setSalary(dto.getSalary());
        employee.setDesignation(dto.getDesignation());

        Department department =
                departmentService.getDepartmentEntityById(dto.getDepartmentId());

        employee.setDepartment(department);

        return employee;
    }

    private EmployeeDTO convertToDTO(Employee employee) {

        EmployeeDTO dto = new EmployeeDTO();

        dto.setEmployeeId(employee.getEmployeeId());
        dto.setEmployeeName(employee.getEmployeeName());
        dto.setEmail(employee.getEmail());
        dto.setSalary(employee.getSalary());
        dto.setDesignation(employee.getDesignation());

        dto.setDepartmentId(employee.getDepartment().getDepartmentId());

        return dto;
    }
}