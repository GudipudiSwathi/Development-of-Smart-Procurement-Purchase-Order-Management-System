package com.eps.enterpriseprocurementsystem.repository;

import com.eps.enterpriseprocurementsystem.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

}