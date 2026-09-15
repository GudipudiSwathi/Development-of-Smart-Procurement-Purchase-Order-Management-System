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
  AdminDepartmentsService,
  Department,
  DepartmentRequest
} from '../../services/admin-departments';

import {
  AdminSidebar
} from '../../components/admin-sidebar/admin-sidebar';


@Component({
  selector: 'app-admin-departments',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],

  templateUrl: './admin-departments.html',

  styleUrl: './admin-departments.css'
})
export class AdminDepartments implements OnInit {


  // =====================================================
  // DEPARTMENTS
  // =====================================================

  departments: Department[] = [];

  filteredDepartments: Department[] = [];


  // =====================================================
  // SEARCH
  // =====================================================

  searchText: string = '';


  // =====================================================
  // LOADING
  // =====================================================

  isLoading: boolean = true;


  // =====================================================
  // ERROR / SUCCESS
  // =====================================================

  errorMessage: string = '';

  successMessage: string = '';


  // =====================================================
  // MODAL
  // =====================================================

  showDepartmentModal: boolean = false;

  isEditMode: boolean = false;

  editingDepartmentId: number | null = null;


  // =====================================================
  // SAVE STATE
  // =====================================================

  isSavingDepartment: boolean = false;

  modalError: string = '';

  modalSuccess: string = '';


  // =====================================================
  // DELETE STATE
  // =====================================================

  deletingDepartmentId: number | null = null;


  // =====================================================
  // FORM
  // =====================================================

  departmentForm: DepartmentRequest = {

    departmentName: ''

  };


  // =====================================================
  // ADMIN INFORMATION
  // =====================================================

  adminName: string =
    localStorage.getItem('username') ||
    'Administrator';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private adminDepartmentsService:
    AdminDepartmentsService,

    private router: Router,

    private cdr: ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.loadDepartments();

  }


  // =====================================================
  // LOAD DEPARTMENTS
  // =====================================================

  loadDepartments(): void {

    this.isLoading = true;

    this.errorMessage = '';

    /*
     * Make the loading state render immediately.
     */
    this.cdr.detectChanges();


    this.adminDepartmentsService
      .getAllDepartments()
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (data: Department[]) => {

          console.log(
            'DEPARTMENTS API SUCCESS:',
            data
          );


          this.departments =
            Array.isArray(data)
              ? data
              : [];


          this.filteredDepartments =
            [...this.departments];


          this.isLoading = false;


          /*
           * IMPORTANT FIX:
           *
           * Force Angular to update the view immediately
           * after the API response.
           *
           * This prevents the page from showing the values
           * only after clicking/double-clicking somewhere.
           */
          this.cdr.detectChanges();

        },


        // =================================================
        // ERROR
        // =================================================

        error: (error: any) => {

          console.error(
            'Failed to load departments:',
            error
          );


          this.isLoading = false;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to load departments.'
            );


          /*
           * Refresh the UI immediately after an error.
           */
          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // SEARCH DEPARTMENTS
  // =====================================================

  filterDepartments(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    if (!search) {

      this.filteredDepartments =
        [...this.departments];


      this.cdr.detectChanges();

      return;

    }


    this.filteredDepartments =
      this.departments.filter(
        (department: Department) =>

          department.departmentName
            ?.toLowerCase()
            .includes(search)

      );


    this.cdr.detectChanges();

  }


  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  openAddDepartmentModal(): void {

    this.isEditMode = false;

    this.editingDepartmentId = null;

    this.modalError = '';

    this.modalSuccess = '';

    this.resetDepartmentForm();

    this.showDepartmentModal = true;

    this.cdr.detectChanges();

  }


  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  openEditDepartmentModal(
    department: Department
  ): void {

    this.isEditMode = true;

    this.editingDepartmentId =
      department.departmentId;

    this.modalError = '';

    this.modalSuccess = '';


    this.departmentForm = {

      departmentName:
      department.departmentName

    };


    this.showDepartmentModal = true;

    this.cdr.detectChanges();

  }


  // =====================================================
  // SAVE DEPARTMENT
  // CREATE / UPDATE
  // =====================================================

  saveDepartment(): void {

    this.modalError = '';

    this.modalSuccess = '';

    this.successMessage = '';


    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    const departmentName =
      this.departmentForm.departmentName
        ?.trim();


    if (!departmentName) {

      this.modalError =
        'Department name is required.';

      this.cdr.detectChanges();

      return;

    }


    if (departmentName.length < 2) {

      this.modalError =
        'Department name must contain at least 2 characters.';

      this.cdr.detectChanges();

      return;

    }


    if (departmentName.length > 100) {

      this.modalError =
        'Department name cannot exceed 100 characters.';

      this.cdr.detectChanges();

      return;

    }


    // ---------------------------------------------------
    // REQUEST
    // ---------------------------------------------------

    const request: DepartmentRequest = {

      departmentName:
      departmentName

    };


    this.isSavingDepartment = true;

    this.cdr.detectChanges();


    // ===================================================
    // UPDATE
    // ===================================================

    if (
      this.isEditMode &&
      this.editingDepartmentId !== null
    ) {

      this.adminDepartmentsService
        .updateDepartment(
          this.editingDepartmentId,
          request
        )
        .subscribe({

          next: (
            updatedDepartment: Department
          ) => {

            const index =
              this.departments.findIndex(
                department =>
                  department.departmentId ===
                  updatedDepartment.departmentId
              );


            if (index !== -1) {

              this.departments[index] =
                updatedDepartment;

            }


            this.filteredDepartments =
              [...this.departments];


            this.isSavingDepartment = false;

            this.modalSuccess =
              'Department updated successfully.';

            this.successMessage =
              'Department updated successfully.';


            this.cdr.detectChanges();


            setTimeout(() => {

              this.closeDepartmentModal();

              this.cdr.detectChanges();

            }, 700);

          },


          error: (error: any) => {

            console.error(
              'Update department failed:',
              error
            );


            this.isSavingDepartment = false;

            this.modalError =
              this.getErrorMessage(
                error,
                'Unable to update department.'
              );


            this.cdr.detectChanges();

          }

        });


      return;

    }


    // ===================================================
    // CREATE
    // ===================================================

    this.adminDepartmentsService
      .createDepartment(request)
      .subscribe({

        next: (
          createdDepartment: Department
        ) => {

          this.departments = [

            createdDepartment,

            ...this.departments

          ];


          this.filteredDepartments =
            [...this.departments];


          this.isSavingDepartment = false;

          this.modalSuccess =
            'Department created successfully.';

          this.successMessage =
            'Department created successfully.';


          this.resetDepartmentForm();


          this.cdr.detectChanges();


          setTimeout(() => {

            this.closeDepartmentModal();

            this.cdr.detectChanges();

          }, 700);

        },


        error: (error: any) => {

          console.error(
            'Create department failed:',
            error
          );


          this.isSavingDepartment = false;

          this.modalError =
            this.getErrorMessage(
              error,
              'Unable to create department.'
            );


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // DELETE DEPARTMENT
  // =====================================================

  deleteDepartment(
    department: Department
  ): void {

    if (
      !department ||
      department.departmentId === undefined ||
      department.departmentId === null
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete the department "${department.departmentName}"?`
      );


    if (!confirmed) {

      return;

    }


    this.deletingDepartmentId =
      department.departmentId;

    this.errorMessage = '';

    this.successMessage = '';


    this.cdr.detectChanges();


    this.adminDepartmentsService
      .deleteDepartment(
        department.departmentId
      )
      .subscribe({

        next: () => {

          this.departments =
            this.departments.filter(
              item =>
                item.departmentId !==
                department.departmentId
            );


          this.filteredDepartments =
            this.filteredDepartments.filter(
              item =>
                item.departmentId !==
                department.departmentId
            );


          this.deletingDepartmentId = null;

          this.successMessage =
            'Department deleted successfully.';


          this.cdr.detectChanges();


          setTimeout(() => {

            this.successMessage = '';

            this.cdr.detectChanges();

          }, 3000);

        },


        error: (error: any) => {

          console.error(
            'Delete department failed:',
            error
          );


          this.deletingDepartmentId = null;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to delete department.'
            );


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // RESET FORM
  // =====================================================

  resetDepartmentForm(): void {

    this.departmentForm = {

      departmentName: ''

    };

  }


  // =====================================================
  // CLOSE MODAL
  // =====================================================

  closeDepartmentModal(): void {

    this.showDepartmentModal = false;

    this.isEditMode = false;

    this.editingDepartmentId = null;

    this.isSavingDepartment = false;

    this.modalError = '';

    this.modalSuccess = '';

    this.resetDepartmentForm();

    this.cdr.detectChanges();

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refreshDepartments(): void {

    this.searchText = '';

    this.loadDepartments();

  }


  // =====================================================
  // TOTAL DEPARTMENTS
  // =====================================================

  get totalDepartments(): number {

    return this.departments.length;

  }


  // =====================================================
  // ERROR MESSAGE HANDLER
  // =====================================================

  private getErrorMessage(
    error: any,
    defaultMessage: string
  ): string {

    if (
      error?.error?.message
    ) {

      return error.error.message;

    }


    if (
      typeof error?.error === 'string' &&
      error.error.trim()
    ) {

      return error.error;

    }


    if (
      error?.message
    ) {

      return error.message;

    }


    if (
      error?.status === 403
    ) {

      return 'You do not have permission to perform this action.';

    }


    if (
      error?.status === 401
    ) {

      return 'Unauthorized. Please login again.';

    }


    return defaultMessage;

  }


  // =====================================================
  // NAVIGATION
  // =====================================================

  goToDashboard(): void {

    this.router.navigate([
      '/admin-dashboard'
    ]);

  }


  goToUsers(): void {

    this.router.navigate([
      '/admin/users'
    ]);

  }


  goToDepartments(): void {

    this.router.navigate([
      '/admin/departments'
    ]);

  }


  goToCategories(): void {

    this.router.navigate([
      '/admin/categories'
    ]);

  }


  goToProducts(): void {

    this.router.navigate([
      '/admin/products'
    ]);

  }


  goToSuppliers(): void {

    this.router.navigate([
      '/admin/suppliers'
    ]);

  }


  goToPurchaseRequests(): void {

    this.router.navigate([
      '/admin/purchase-requests'
    ]);

  }


  goToAccounts(): void {

    this.router.navigate([
      '/admin/accounts'
    ]);

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    localStorage.removeItem('token');

    localStorage.removeItem('userId');

    localStorage.removeItem('username');

    localStorage.removeItem('role');

    this.router.navigate([
      '/login'
    ]);

  }

}
