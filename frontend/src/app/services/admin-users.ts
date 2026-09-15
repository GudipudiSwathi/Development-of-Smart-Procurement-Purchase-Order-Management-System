import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


// =====================================================
// USER MODEL
// =====================================================

export interface AdminUser {

  userId: number;

  username: string;

  email: string;

  phoneNumber: string;

  designation: string;

  role: string;

  departmentId: number | null;

}


// =====================================================
// CREATE / UPDATE USER REQUEST
// =====================================================

export interface UserRequest {

  username: string;

  email: string;

  password?: string;

  phoneNumber: string;

  designation: string;

  role: string;

  departmentId: number;

}


@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {


  // =====================================================
  // API URL
  // =====================================================

  private usersUrl =
    'http://localhost:8080/users';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // GET ALL USERS
  // =====================================================

  getAllUsers(): Observable<AdminUser[]> {

    return this.http.get<AdminUser[]>(
      this.usersUrl
    );

  }


  // =====================================================
  // GET USER BY ID
  // =====================================================

  getUserById(
    userId: number
  ): Observable<AdminUser> {

    return this.http.get<AdminUser>(
      `${this.usersUrl}/${userId}`
    );

  }


  // =====================================================
  // CREATE USER
  // =====================================================

  registerUser(
    user: UserRequest
  ): Observable<AdminUser> {

    return this.http.post<AdminUser>(
      `${this.usersUrl}/register`,
      user
    );

  }


  // =====================================================
  // UPDATE USER
  // =====================================================

  updateUser(
    userId: number,
    user: UserRequest
  ): Observable<AdminUser> {

    return this.http.put<AdminUser>(
      `${this.usersUrl}/${userId}`,
      user
    );

  }


  // =====================================================
  // DELETE USER
  // =====================================================

  deleteUser(
    userId: number
  ): Observable<string> {

    return this.http.delete(
      `${this.usersUrl}/${userId}`,
      {
        responseType: 'text'
      }
    );

  }

}
