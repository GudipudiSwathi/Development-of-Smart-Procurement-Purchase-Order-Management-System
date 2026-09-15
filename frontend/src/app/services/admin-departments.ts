import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


// =====================================================
// DEPARTMENT MODEL
// =====================================================

export interface Department {

  departmentId: number;

  departmentName: string;

}


// =====================================================
// DEPARTMENT REQUEST
// =====================================================

export interface DepartmentRequest {

  departmentName: string;

}


// =====================================================
// ADMIN DEPARTMENTS SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class AdminDepartmentsService {


  // ===================================================
  // API URL
  // ===================================================

  private departmentsUrl =
    'http://localhost:8080/departments';


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(
    private http: HttpClient
  ) {}


  // ===================================================
  // GET ALL DEPARTMENTS
  // ===================================================

  getAllDepartments():
    Observable<Department[]> {

    return this.http.get<Department[]>(
      this.departmentsUrl
    );

  }


  // ===================================================
  // GET DEPARTMENT BY ID
  // ===================================================

  getDepartmentById(
    departmentId: number
  ): Observable<Department> {

    return this.http.get<Department>(
      `${this.departmentsUrl}/${departmentId}`
    );

  }


  // ===================================================
  // CREATE DEPARTMENT
  // ===================================================

  createDepartment(
    department: DepartmentRequest
  ): Observable<Department> {

    return this.http.post<Department>(
      this.departmentsUrl,
      department
    );

  }


  // ===================================================
  // UPDATE DEPARTMENT
  // ===================================================

  updateDepartment(
    departmentId: number,
    department: DepartmentRequest
  ): Observable<Department> {

    return this.http.put<Department>(
      `${this.departmentsUrl}/${departmentId}`,
      department
    );

  }


  // ===================================================
  // DELETE DEPARTMENT
  // ===================================================

  deleteDepartment(
    departmentId: number
  ): Observable<string> {

    return this.http.delete(
      `${this.departmentsUrl}/${departmentId}`,
      {
        responseType: 'text'
      }
    );

  }


  // ===================================================
  // GET CATEGORIES BY DEPARTMENT
  // ===================================================

  getCategoriesByDepartment(
    departmentId: number
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.departmentsUrl}/${departmentId}/categories`
    );

  }

}
