import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


// =========================================================
// APPROVAL HIERARCHY INTERFACES
// =========================================================

export interface ApprovalHierarchy {
  approvalHierarchyId?: number;
  departmentId: number | null;
  approverUserId: number | null;
  level: number | null;
  approverRole: string;
  status: 'ACTIVE' | 'INACTIVE' | string;

  // Frontend display fields
  departmentName?: string;
  approverName?: string;
  approverEmail?: string;
}


export interface ApprovalHierarchyRequest {
  departmentId: number | null;
  approverUserId: number | null;
  level: number | null;
  approverRole: string;
  status?: string;
}


// =========================================================
// USER
// =========================================================

export interface ApprovalUser {
  userId: number;
  username: string;
  email?: string;
  phoneNumber?: string;
  designation?: string;
  role?: string;
  departmentId?: number | null;
}


// =========================================================
// DEPARTMENT
// =========================================================

export interface ApprovalDepartment {
  departmentId: number;
  departmentName: string;
}


// =========================================================
// SERVICE
// =========================================================

@Injectable({
  providedIn: 'root'
})
export class AdminApprovalsService {

  private readonly approvalApiUrl =
    'http://localhost:8080/approval-hierarchy';

  private readonly usersApiUrl =
    'http://localhost:8080/users';

  private readonly departmentsApiUrl =
    'http://localhost:8080/departments';


  constructor(
    private http: HttpClient
  ) {}


  // =======================================================
  // APPROVAL HIERARCHY
  // =======================================================

  getAllApprovalHierarchies(): Observable<ApprovalHierarchy[]> {
    return this.http.get<ApprovalHierarchy[]>(
      this.approvalApiUrl
    );
  }


  getApprovalHierarchyById(
    id: number
  ): Observable<ApprovalHierarchy> {

    return this.http.get<ApprovalHierarchy>(
      `${this.approvalApiUrl}/${id}`
    );
  }


  createApprovalHierarchy(
    request: ApprovalHierarchyRequest
  ): Observable<ApprovalHierarchy> {

    return this.http.post<ApprovalHierarchy>(
      this.approvalApiUrl,
      request
    );
  }


  updateApprovalHierarchy(
    id: number,
    request: ApprovalHierarchyRequest
  ): Observable<ApprovalHierarchy> {

    return this.http.put<ApprovalHierarchy>(
      `${this.approvalApiUrl}/${id}`,
      request
    );
  }


  deleteApprovalHierarchy(
    id: number
  ): Observable<string> {

    return this.http.delete(
      `${this.approvalApiUrl}/${id}`,
      {
        responseType: 'text'
      }
    );
  }


  // =======================================================
  // USERS
  // Used to select the approver
  // =======================================================

  getUsers(): Observable<ApprovalUser[]> {
    return this.http.get<ApprovalUser[]>(
      this.usersApiUrl
    );
  }


  // =======================================================
  // DEPARTMENTS
  // Used for Level 1 department mapping
  // =======================================================

  getDepartments(): Observable<ApprovalDepartment[]> {
    return this.http.get<ApprovalDepartment[]>(
      this.departmentsApiUrl
    );
  }

}
