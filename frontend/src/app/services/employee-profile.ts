import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


// =====================================================
// USER PROFILE MODEL
// =====================================================

export interface EmployeeProfile {

  userId: number;

  username: string;

  email: string;

  phoneNumber: string;

  designation: string;

  role: string;

  departmentId: number | null;
}


// =====================================================
// PROFILE UPDATE MODEL
// =====================================================

export interface EmployeeProfileUpdate {

  username: string;

  email: string;

  phoneNumber: string;

  designation: string;

  password?: string;
}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class EmployeeProfileService {


  // ===================================================
  // API URL
  // ===================================================

  private readonly apiUrl =
    'http://localhost:8080/users';


  // ===================================================
  // CONSTRUCTOR
  // ===================================================

  constructor(
    private http: HttpClient
  ) {}


  // ===================================================
  // GET CURRENT USER PROFILE
  // ===================================================

  getMyProfile(): Observable<EmployeeProfile> {

    return this.http.get<EmployeeProfile>(
      `${this.apiUrl}/me`
    );
  }


  // ===================================================
  // UPDATE CURRENT USER PROFILE
  // ===================================================

  updateMyProfile(
    profile: EmployeeProfileUpdate
  ): Observable<EmployeeProfile> {

    return this.http.put<EmployeeProfile>(
      `${this.apiUrl}/me`,
      profile
    );
  }


  // ===================================================
  // GET SAVED USERNAME
  // ===================================================

  getStoredUsername(): string {

    return localStorage.getItem('username')
      || 'Employee';
  }


  // ===================================================
  // GET SAVED USER ID
  // ===================================================

  getStoredUserId(): number | null {

    const userId =
      localStorage.getItem('userId');

    if (!userId) {
      return null;
    }

    const parsedUserId =
      Number(userId);

    return Number.isNaN(parsedUserId)
      ? null
      : parsedUserId;
  }


  // ===================================================
  // GET SAVED ROLE
  // ===================================================

  getStoredRole(): string {

    return localStorage.getItem('role')
      || 'EMPLOYEE';
  }


  // ===================================================
  // UPDATE LOCAL STORAGE AFTER PROFILE UPDATE
  // ===================================================

  updateStoredUsername(
    username: string
  ): void {

    localStorage.setItem(
      'username',
      username
    );
  }


  // ===================================================
  // CLEAR USER SESSION
  // ===================================================

  clearSession(): void {

    localStorage.removeItem('token');

    localStorage.removeItem('userId');

    localStorage.removeItem('username');

    localStorage.removeItem('role');
  }
}
