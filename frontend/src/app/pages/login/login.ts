import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  AuthService,
  LoginRequest
} from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  loginForm: FormGroup;

  submitted = false;

  successMessage = '';

  errorMessage = '';

  isLoading = false;

  // ==========================================
  // SELECTED USER TYPE
  // ==========================================

  userType: 'EMPLOYEE' | 'BUSINESS' = 'EMPLOYEE';

  get userTypeLabel(): string {
    return this.userType === 'BUSINESS'
      ? 'Business'
      : 'Employee';
  }


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {

    // ==========================================
    // GET USER TYPE FROM URL
    // ==========================================

    const type =
      this.route.snapshot.queryParamMap.get('type');

    if (type?.toUpperCase() === 'BUSINESS') {

      this.userType = 'BUSINESS';

    } else {

      this.userType = 'EMPLOYEE';

    }


    // ==========================================
    // LOGIN FORM
    // ==========================================

    this.loginForm = this.fb.group({

      username: [
        '',
        Validators.required
      ],

      password: [
        '',
        Validators.required
      ]

    });

  }


  // ==========================================
  // FORM CONTROLS
  // ==========================================

  get f() {
    return this.loginForm.controls;
  }


  // ==========================================
  // CHANGE USER TYPE
  // ==========================================

  changeUserType(
    type: 'EMPLOYEE' | 'BUSINESS'
  ): void {

    this.userType = type;

    this.errorMessage = '';

    this.successMessage = '';

    this.submitted = false;

    this.loginForm.reset();

  }


  // ==========================================
  // REGISTER
  // ==========================================

  goToRegister(): void {

    this.router.navigate(
      ['/register'],
      {
        queryParams: {
          type: this.userType
        }
      }
    );

  }


  // ==========================================
  // LOGIN
  // ==========================================

  onSubmit(): void {

    console.log(
      'LOGIN BUTTON CLICKED'
    );

    this.submitted = true;

    this.successMessage = '';

    this.errorMessage = '';


    // ==========================================
    // VALIDATION
    // ==========================================

    if (this.loginForm.invalid) {

      console.log(
        'LOGIN FORM IS INVALID'
      );

      this.loginForm.markAllAsTouched();

      this.errorMessage =
        'Please enter your username and password.';

      return;

    }


    console.log(
      'LOGIN FORM IS VALID'
    );

    this.isLoading = true;


    // ==========================================
    // LOGIN DATA
    // ==========================================

    const loginData: LoginRequest = {

      username:
      this.loginForm.value.username,

      password:
      this.loginForm.value.password

    };


    console.log(
      'LOGIN TYPE:',
      this.userType
    );

    console.log(
      'SENDING LOGIN TO BACKEND:',
      {
        username: loginData.username,
        accountType: this.userType
      }
    );


    // ==========================================
    // BACKEND LOGIN
    // ==========================================

    this.authService
      .loginUser(loginData)
      .subscribe({

        // ======================================
        // SUCCESS
        // ======================================

        next: (response) => {

          console.log(
            'LOGIN SUCCESSFUL'
          );

          console.log(
            'JWT RECEIVED:',
            response
          );


          this.isLoading = false;


          // ==========================================
          // STRICT LOGIN MODE VALIDATION
          // ==========================================
          // Employee mode allows ADMIN + EMPLOYEE.
          // Supplier mode allows SUPPLIER only.
          // ==========================================

          const backendRole =
            response.role?.toUpperCase();

          const employeeModeAllowed =
            backendRole === 'ADMIN' ||
            backendRole === 'EMPLOYEE';

          const supplierModeAllowed =
            backendRole === 'SUPPLIER';

          const loginModeMatchesRole =
            (
              this.userType === 'EMPLOYEE' &&
              employeeModeAllowed
            ) ||
            (
              this.userType === 'BUSINESS' &&
              supplierModeAllowed
            );


          if (!loginModeMatchesRole) {

            console.warn(
              'LOGIN MODE / ACCOUNT ROLE MISMATCH',
              {
                selectedMode: this.userType,
                backendRole: backendRole
              }
            );

            // Never keep credentials from a mismatched mode.
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            localStorage.removeItem('role');

            this.isLoading = false;
            this.successMessage = '';

            if (backendRole === 'SUPPLIER') {

              this.errorMessage =
                'Supplier accounts must login using Supplier mode.';

            } else {

              this.errorMessage =
                'Employee and Admin accounts must login using Employee mode.';

            }

            // Immediately update the screen so the error
            // is visible without requiring a click/change of tab.
            this.cdr.detectChanges();

            return;
          }


          // ====================================
          // STORE JWT
          // ====================================

          localStorage.setItem(
            'token',
            response.token
          );


          // ====================================
          // STORE USER INFORMATION
          // ====================================

          localStorage.setItem(
            'userId',
            response.userId.toString()
          );

          localStorage.setItem(
            'username',
            response.username
          );

          localStorage.setItem(
            'role',
            response.role
          );


          // ====================================
          // NORMALIZE BACKEND ROLE
          // ====================================

          console.log(
            'BACKEND ROLE:',
            backendRole
          );


          // ====================================
          // ADMIN
          // ====================================

          if (
            backendRole === 'ADMIN'
          ) {

            console.log(
              'ADMIN LOGIN → ADMIN DASHBOARD'
            );

            this.successMessage =
              'Admin login successful!';

            this.router.navigate([
              '/admin-dashboard'
            ]);

            return;

          }


          // ====================================
          // BUSINESS / SUPPLIER
          // ====================================

          if (
            backendRole === 'SUPPLIER'
          ) {

            console.log(
              'SUPPLIER LOGIN → SUPPLIER DASHBOARD'
            );

            this.successMessage =
              'Supplier login successful!';

            this.router.navigate([
              '/supplier-dashboard'
            ]);

            return;

          }


          // ====================================
          // EMPLOYEE
          // ====================================

          if (
            backendRole === 'EMPLOYEE'
          ) {

            console.log(
              'EMPLOYEE LOGIN → EMPLOYEE DASHBOARD'
            );

            this.successMessage =
              'Employee login successful!';

            this.router.navigate([
              '/dashboard'
            ]);

            return;

          }


          // ====================================
          // UNKNOWN ROLE
          // ====================================

          console.error(
            'UNKNOWN USER ROLE:',
            response.role
          );

          this.errorMessage =
            'Your account type is not configured correctly.';

        },


        // ======================================
        // LOGIN ERROR
        // ======================================

        error: (error) => {

          console.error(
            'LOGIN FAILED:',
            error
          );


          // ====================================
          // STOP LOADING IMMEDIATELY
          // ====================================

          this.isLoading = false;
          this.successMessage = '';

          // ====================================
          // SHOW LOGIN ERROR
          // ====================================

          if (error?.status === 401) {

            // Backend returns 401 for invalid
            // username or invalid password.
            if (
              typeof error.error === 'string' &&
              error.error.trim()
            ) {

              this.errorMessage =
                error.error;

            } else if (
              error.error?.message
            ) {

              this.errorMessage =
                error.error.message;

            } else {

              this.errorMessage =
                'Invalid username or password.';

            }

          }

          else if (error?.error) {

            if (
              typeof error.error === 'string'
            ) {

              this.errorMessage =
                error.error;

            }

            else if (
              error.error?.message
            ) {

              this.errorMessage =
                error.error.message;

            }

            else {

              this.errorMessage =
                'Invalid username or password.';

            }

          }

          else {

            this.errorMessage =
              'Unable to connect to the server. Please try again.';

          }

          // ====================================
          // FORCE IMMEDIATE UI UPDATE
          // ====================================
          // Ensures "Logging in..." disappears
          // and the error appears after the FIRST
          // failed login attempt.

          this.cdr.detectChanges();

        }

      });

  }

}
