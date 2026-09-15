import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService,
  UserRegistration
} from '../../services/auth';

import {
  AdminDepartmentsService,
  Department
} from '../../services/admin-departments';


@Component({
  selector: 'app-register',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {

  registerForm: FormGroup;

  departments: Department[] = [];

  departmentsLoading = true;

  departmentError = '';

  submitted = false;

  isLoading = false;

  isSubmitting = false;

  successMessage = '';

  errorMessage = '';

  showPassword = false;


  // =====================================================
  // ACCOUNT TYPE
  // =====================================================

  userType: 'EMPLOYEE' | 'BUSINESS' = 'EMPLOYEE';


  constructor(
    private formBuilder: FormBuilder,

    private authService: AuthService,

    private adminDepartmentsService:
    AdminDepartmentsService,

    private router: Router,

    private route: ActivatedRoute
  ) {

    // ===================================================
    // READ ACCOUNT TYPE FROM URL
    // ===================================================

    const type =
      this.route.snapshot.queryParamMap.get('type');

    if (
      type?.toUpperCase() === 'BUSINESS'
    ) {

      this.userType = 'BUSINESS';

    } else {

      this.userType = 'EMPLOYEE';

    }


    // ===================================================
    // FORM
    // ===================================================

    this.registerForm =
      this.formBuilder.group({

        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3)
          ]
        ],

        email: [
          '',
          [
            Validators.email
          ]
        ],

        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6)
          ]
        ],

        phoneNumber: [
          '',
          [
            Validators.required
          ]
        ],

        designation: [
          '',
          [
            Validators.required
          ]
        ],

        role: [
          this.getBackendRole(),
          [
            Validators.required
          ]
        ],

        departmentId: [
          null
        ]

      });

  }


  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.updateFormForAccountType();

    this.loadDepartments();

  }


  // =====================================================
  // ACCOUNT TYPE LABEL
  // =====================================================

  get accountTypeLabel(): string {

    return this.userType === 'BUSINESS'
      ? 'Business'
      : 'Employee';

  }


  // =====================================================
  // BACKEND ROLE
  // =====================================================

  private getBackendRole(): string {

    return this.userType === 'BUSINESS'
      ? 'SUPPLIER'
      : 'EMPLOYEE';

  }


  // =====================================================
  // CHANGE ACCOUNT TYPE
  // =====================================================

  changeAccountType(
    type: 'EMPLOYEE' | 'BUSINESS'
  ): void {

    this.userType = type;

    this.submitted = false;

    this.successMessage = '';

    this.errorMessage = '';

    this.registerForm.reset({

      username: '',

      email: '',

      password: '',

      phoneNumber: '',

      designation: '',

      role: this.getBackendRole(),

      departmentId: null

    });

    this.updateFormForAccountType();

  }


  // =====================================================
  // UPDATE FORM
  // =====================================================

  private updateFormForAccountType(): void {

    const departmentControl =
      this.registerForm.get('departmentId');


    if (
      this.userType === 'EMPLOYEE'
    ) {

      departmentControl?.setValidators([
        Validators.required
      ]);

    } else {

      departmentControl?.clearValidators();

      departmentControl?.setValue(null);

    }


    departmentControl?.updateValueAndValidity();


    this.registerForm
      .get('role')
      ?.setValue(
        this.getBackendRole()
      );

  }


  // =====================================================
  // LOAD DEPARTMENTS
  // =====================================================

  loadDepartments(): void {

    this.departmentsLoading = true;

    this.departmentError = '';

    this.adminDepartmentsService
      .getAllDepartments()
      .subscribe({

        next: (data: Department[]) => {

          this.departments =
            Array.isArray(data)
              ? data
              : [];

          this.departmentsLoading =
            false;


          if (
            this.departments.length === 0
          ) {

            this.departmentError =
              'No departments are currently available.';

          }

        },

        error: (error: unknown) => {

          console.error(
            'Failed to load departments:',
            error
          );

          this.departments = [];

          this.departmentsLoading =
            false;

          this.departmentError =
            'Unable to load departments. Please try again.';

        }

      });

  }


  // =====================================================
  // FORM CONTROLS
  // =====================================================

  get f() {

    return this.registerForm.controls;

  }


  // =====================================================
  // PASSWORD
  // =====================================================

  togglePassword(): void {

    this.showPassword =
      !this.showPassword;

  }


  // =====================================================
  // SUBMIT
  // =====================================================

  onSubmit(): void {

    this.submitted = true;

    this.successMessage = '';

    this.errorMessage = '';


    // ===================================================
    // VALIDATE FORM
    // ===================================================

    if (
      this.registerForm.invalid
    ) {

      this.registerForm.markAllAsTouched();

      return;

    }


    const formValue =
      this.registerForm.value;


    // ===================================================
    // DEPARTMENT
    // ===================================================

    let departmentId: number | null = null;


    if (
      this.userType === 'EMPLOYEE'
    ) {

      departmentId =
        Number(
          formValue.departmentId
        );


      if (
        !departmentId ||
        departmentId <= 0
      ) {

        this.errorMessage =
          'Please select a department.';

        this.registerForm
          .get('departmentId')
          ?.markAsTouched();

        return;

      }

    }


    // ===================================================
    // START LOADING
    // ===================================================

    this.isSubmitting = true;

    this.isLoading = true;


    // ===================================================
    // COMMON DATA
    // ===================================================

    const registrationData: any = {

      username:
        formValue.username
          .trim(),

      email:
        formValue.email
          ? formValue.email.trim()
          : '',

      password:
      formValue.password,

      phoneNumber:
        formValue.phoneNumber
          .trim(),

      designation:
        formValue.designation
          .trim(),

      role:
        this.getBackendRole()

    };


    // ===================================================
    // EMPLOYEE ONLY
    // ===================================================

    if (
      this.userType === 'EMPLOYEE'
    ) {

      registrationData.departmentId =
        departmentId;

    }


    console.log(
      'REGISTRATION ACCOUNT TYPE:',
      this.userType
    );

    console.log(
      'BACKEND ROLE:',
      registrationData.role
    );

    console.log(
      'REGISTRATION DATA:',
      registrationData
    );


    // ===================================================
    // BACKEND
    // ===================================================

    this.authService
      .registerUser(
        registrationData as UserRegistration
      )
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: () => {

          this.isSubmitting = false;

          this.isLoading = false;


          this.successMessage =
            `${this.accountTypeLabel} registration successful. Redirecting to login...`;

          this.errorMessage = '';


          // =============================================
          // RESET
          // =============================================

          this.registerForm.reset({

            username: '',

            email: '',

            password: '',

            phoneNumber: '',

            designation: '',

            role: this.getBackendRole(),

            departmentId: null

          });


          this.submitted = false;


          // =============================================
          // LOGIN
          // =============================================

          setTimeout(() => {

            this.router.navigate(
              ['/login'],
              {
                queryParams: {
                  type: this.userType
                }
              }
            );

          }, 1500);

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (error: unknown) => {

          console.error(
            'REGISTRATION ERROR:',
            error
          );

          this.isSubmitting = false;

          this.isLoading = false;

          this.errorMessage =
            this.getErrorMessage(error);

        }

      });

  }


  // =====================================================
  // ERROR MESSAGE
  // =====================================================

  private getErrorMessage(
    error: unknown
  ): string {

    if (
      typeof error === 'object' &&
      error !== null
    ) {

      const response =
        error as {

          error?: {

            message?: string;

            error?: string;

          };

          message?: string;

        };


      if (
        response.error?.message
      ) {

        return response.error.message;

      }


      if (
        response.error?.error
      ) {

        return response.error.error;

      }


      if (
        response.message
      ) {

        return response.message;

      }

    }


    return 'Registration failed. Please try again.';

  }


  // =====================================================
  // FIELD ERROR
  // =====================================================

  hasError(
    fieldName: string
  ): boolean {

    const field =
      this.registerForm.get(fieldName);


    return !!(
      field &&
      field.invalid &&
      (
        field.touched ||
        this.submitted
      )
    );

  }


  // =====================================================
  // FIELD ERROR MESSAGE
  // =====================================================

  getFieldError(
    fieldName: string
  ): string {

    const field =
      this.registerForm.get(fieldName);


    if (
      !field ||
      !field.errors ||
      !(
        field.touched ||
        this.submitted
      )
    ) {

      return '';

    }


    if (
      field.errors['required']
    ) {

      return 'This field is required.';

    }


    if (
      field.errors['email']
    ) {

      return 'Enter a valid email address.';

    }


    if (
      field.errors['minlength']
    ) {

      return `Minimum ${field.errors['minlength'].requiredLength} characters required.`;

    }


    return 'Invalid value.';

  }

}
