import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  designation: string;
  role: string;
  departmentId: number;
}

export interface UserResponse {
  userId: number;
  username: string;
  email: string;
  phoneNumber: string;
  designation: string;
  role: string;
  departmentId: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  userId: number;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/users';

  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // REGISTER
  // ==========================================

  registerUser(
    user: UserRegistration
  ): Observable<UserResponse> {

    return this.http.post<UserResponse>(
      `${this.apiUrl}/register`,
      user
    );
  }


  // ==========================================
  // LOGIN
  // ==========================================

  loginUser(
    loginData: LoginRequest
  ): Observable<JwtResponse> {

    return this.http.post<JwtResponse>(
      `${this.apiUrl}/login`,
      loginData
    ).pipe(
      timeout(5000)
    );
  }


  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    console.log(
      'AUTH SERVICE: Logging out'
    );

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    console.log(
      'AUTH SERVICE: Login information removed'
    );
  }


  // ==========================================
  // CHECK LOGIN STATUS
  // ==========================================

  isLoggedIn(): boolean {

    const token =
      localStorage.getItem('token');

    return !!token;
  }


  // ==========================================
  // GET JWT TOKEN
  // ==========================================

  getToken(): string | null {

    return localStorage.getItem('token');
  }


  // ==========================================
  // GET USER ID
  // ==========================================

  getUserId(): number | null {

    const userId =
      localStorage.getItem('userId');

    if (!userId) {
      return null;
    }

    return Number(userId);
  }


  // ==========================================
  // GET USERNAME
  // ==========================================

  getUsername(): string | null {

    return localStorage.getItem('username');
  }


  // ==========================================
  // GET ROLE
  // ==========================================

  getRole(): string | null {

    return localStorage.getItem('role');
  }
}
