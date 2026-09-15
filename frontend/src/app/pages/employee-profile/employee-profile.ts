import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  EmployeeProfile,
  EmployeeProfileService,
  EmployeeProfileUpdate
} from '../../services/employee-profile';

import {
  AuthService
} from '../../services/auth';


@Component({
  selector: 'app-employee-profile',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './employee-profile.html',
  styleUrl: './employee-profile.css'
})
export class EmployeeProfileComponent
  implements OnInit {


  // =====================================================
  // PROFILE DATA
  // =====================================================

  profile: EmployeeProfile | null = null;


  // =====================================================
  // EDITABLE DATA
  // =====================================================

  username = '';

  email = '';

  phoneNumber = '';

  designation = '';


  // =====================================================
  // PASSWORD
  // =====================================================

  newPassword = '';

  confirmPassword = '';

  showNewPassword = false;

  showConfirmPassword = false;


  // =====================================================
  // UI STATE
  // =====================================================

  loading = true;

  saving = false;

  errorMessage = '';

  successMessage = '';

  editMode = false;

  showLogoutConfirmation = false;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private profileService: EmployeeProfileService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadProfile();

  }


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  loadProfile(): void {

    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';


    this.profileService
      .getMyProfile()
      .subscribe({

        next: (profile) => {

          this.profile = profile;

          this.populateForm(profile);

          this.loading = false;

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Failed to load profile:',
            error
          );

          this.loading = false;

          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to load your profile.'
            );

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // POPULATE FORM
  // =====================================================

  private populateForm(
    profile: EmployeeProfile
  ): void {

    this.username =
      profile.username || '';

    this.email =
      profile.email || '';

    this.phoneNumber =
      profile.phoneNumber || '';

    this.designation =
      profile.designation || '';

    this.newPassword = '';

    this.confirmPassword = '';

  }


  // =====================================================
  // ENABLE EDIT MODE
  // =====================================================

  enableEdit(): void {

    if (!this.profile) {
      return;
    }

    this.editMode = true;

    this.errorMessage = '';

    this.successMessage = '';

  }


  // =====================================================
  // CANCEL EDIT
  // =====================================================

  cancelEdit(): void {

    if (this.profile) {

      this.populateForm(
        this.profile
      );

    }

    this.editMode = false;

    this.errorMessage = '';

    this.successMessage = '';

  }


  // =====================================================
  // SAVE PROFILE
  // =====================================================

  saveProfile(): void {

    if (this.saving) {
      return;
    }


    this.errorMessage = '';

    this.successMessage = '';


    // -------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------

    if (!this.username.trim()) {

      this.errorMessage =
        'Username is required.';

      return;
    }


    if (!this.email.trim()) {

      this.errorMessage =
        'Email is required.';

      return;
    }


    if (!this.isValidEmail(
      this.email.trim()
    )) {

      this.errorMessage =
        'Please enter a valid email address.';

      return;
    }


    if (!this.phoneNumber.trim()) {

      this.errorMessage =
        'Phone number is required.';

      return;
    }


    if (!this.designation.trim()) {

      this.errorMessage =
        'Designation is required.';

      return;
    }


    // -------------------------------------------------
    // PASSWORD VALIDATION
    // -------------------------------------------------

    if (
      this.newPassword.trim() ||
      this.confirmPassword.trim()
    ) {

      if (
        this.newPassword.length < 6
      ) {

        this.errorMessage =
          'New password must contain at least 6 characters.';

        return;
      }


      if (
        this.newPassword !==
        this.confirmPassword
      ) {

        this.errorMessage =
          'New password and confirmation password do not match.';

        return;
      }

    }


    // -------------------------------------------------
    // CREATE REQUEST
    // -------------------------------------------------

    const updateData:
      EmployeeProfileUpdate = {

      username:
        this.username.trim(),

      email:
        this.email.trim(),

      phoneNumber:
        this.phoneNumber.trim(),

      designation:
        this.designation.trim()

    };


    // -------------------------------------------------
    // ONLY SEND PASSWORD WHEN PROVIDED
    // -------------------------------------------------

    if (
      this.newPassword.trim()
    ) {

      updateData.password =
        this.newPassword;

    }


    // -------------------------------------------------
    // SAVE
    // -------------------------------------------------

    this.saving = true;


    this.profileService
      .updateMyProfile(updateData)
      .subscribe({

        next: (updatedProfile) => {

          this.profile =
            updatedProfile;

          this.populateForm(
            updatedProfile
          );


          // Update dashboard/header username
          this.profileService
            .updateStoredUsername(
              updatedProfile.username
            );


          this.editMode = false;

          this.saving = false;

          this.successMessage =
            'Your profile has been updated successfully.';


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'Profile update failed:',
            error
          );

          this.saving = false;

          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to update your profile.'
            );

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // EMAIL VALIDATION
  // =====================================================

  private isValidEmail(
    email: string
  ): boolean {

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);

  }


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  private getErrorMessage(
    error: any,
    fallback: string
  ): string {

    if (
      error?.error?.message
    ) {

      return error.error.message;

    }


    if (
      typeof error?.error === 'string'
    ) {

      return error.error;

    }


    if (
      error?.message
    ) {

      return error.message;

    }


    return fallback;

  }


  // =====================================================
  // PASSWORD VISIBILITY
  // =====================================================

  toggleNewPassword(): void {

    this.showNewPassword =
      !this.showNewPassword;

  }


  toggleConfirmPassword(): void {

    this.showConfirmPassword =
      !this.showConfirmPassword;

  }


  // =====================================================
  // USER INITIAL
  // =====================================================

  get userInitial(): string {

    const name =
      this.profile?.username ||
      this.profileService.getStoredUsername();

    return name
      ? name.charAt(0).toUpperCase()
      : 'U';

  }


  // =====================================================
  // DISPLAY ROLE
  // =====================================================

  get displayRole(): string {

    const role =
      this.profile?.role ||
      this.profileService.getStoredRole();

    if (!role) {
      return 'Employee';
    }

    return role
      .toLowerCase()
      .replace(
        /\b\w/g,
        letter => letter.toUpperCase()
      );

  }


  // =====================================================
  // DEPARTMENT DISPLAY
  // =====================================================

  get departmentDisplay(): string {

    if (
      !this.profile?.departmentId
    ) {

      return 'Not assigned';

    }

    return `Department #${this.profile.departmentId}`;

  }


  // =====================================================
  // PASSWORD STRENGTH
  // =====================================================

  get passwordStrength(): string {

    const password =
      this.newPassword;

    if (!password) {
      return '';
    }


    let score = 0;


    if (password.length >= 6) {
      score++;
    }

    if (password.length >= 10) {
      score++;
    }

    if (/[A-Z]/.test(password)) {
      score++;
    }

    if (/[0-9]/.test(password)) {
      score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    }


    if (score <= 1) {
      return 'Weak';
    }

    if (score <= 3) {
      return 'Medium';
    }

    return 'Strong';

  }


  // =====================================================
  // PASSWORD MATCH
  // =====================================================

  get passwordsMatch(): boolean {

    if (
      !this.newPassword &&
      !this.confirmPassword
    ) {

      return true;

    }

    return (
      this.newPassword ===
      this.confirmPassword
    );

  }


  // =====================================================
  // BACK TO DASHBOARD
  // =====================================================

  goToDashboard(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }


  // =====================================================
  // PURCHASE REQUESTS
  // =====================================================

  goToPurchaseRequests(): void {

    this.router.navigate([
      '/purchase-requests'
    ]);

  }


  // =====================================================
  // TRACKING
  // =====================================================

  goToTracking(): void {

    this.router.navigate([
      '/tracking'
    ]);

  }


  // =====================================================
  // PAYMENTS
  // =====================================================

  goToPayments(): void {

    this.router.navigate([
      '/payments'
    ]);

  }


  // =====================================================
  // LOGOUT CONFIRMATION
  // =====================================================

  openLogoutConfirmation(): void {

    this.showLogoutConfirmation =
      true;

  }


  // =====================================================
  // CANCEL LOGOUT
  // =====================================================

  cancelLogout(): void {

    this.showLogoutConfirmation =
      false;

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    this.showLogoutConfirmation =
      false;

    this.profileService
      .clearSession();

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);

  }

}
