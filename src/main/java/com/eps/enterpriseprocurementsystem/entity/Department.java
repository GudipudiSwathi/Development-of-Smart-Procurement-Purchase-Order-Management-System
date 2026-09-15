package com.eps.enterpriseprocurementsystem.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "department")
@Data
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long departmentId;

    @NotBlank(message = "Department name cannot be blank")
    @Size(
            min = 2,
            max = 50,
            message = "Department name must be between 2 and 50 characters"
    )
    @Column(name = "department_name")
    private String departmentName;

    /*
     * Manager information is optional here.
     *
     * Department-level approval managers are handled separately
     * through the ApprovalHierarchy entity.
     */
    @Size(
            min = 2,
            max = 50,
            message = "Manager name must be between 2 and 50 characters"
    )
    @Column(name = "manager_department")
    private String managerDepartment;

    @OneToMany(
            mappedBy = "department",
            cascade = CascadeType.ALL
    )
    @JsonManagedReference
    private List<Employee> employees;

    @OneToMany(
            mappedBy = "department",
            cascade = CascadeType.ALL
    )
    @JsonManagedReference
    private List<Category> categories;

    @OneToMany(
            mappedBy = "department",
            cascade = CascadeType.ALL
    )
    private List<Product> products;
}