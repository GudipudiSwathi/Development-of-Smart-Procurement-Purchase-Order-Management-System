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
  AdminSidebar
} from '../../components/admin-sidebar/admin-sidebar';

import {
  AdminUsersService,
  AdminUser,
  UserRequest
} from '../../services/admin-users';


@Component({
  selector: 'app-admin-users',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],

  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css'
})
export class AdminUsers implements OnInit {


  // =====================================================
  // USERS
  // =====================================================

  users: AdminUser[] = [];

  filteredUsers: AdminUser[] = [];


  // =====================================================
  // SEARCH
  // =====================================================

  searchText = '';


  // =====================================================
  // ROLE FILTER
  // =====================================================

  selectedRole = 'ALL';


  // =====================================================
  // LOADING
  // =====================================================

  isLoading = true;


  // =====================================================
  // PAGE MESSAGES
  // =====================================================

  errorMessage = '';

  successMessage = '';


  // =====================================================
  // ADMIN INFORMATION
  // =====================================================

  adminName =
    localStorage.getItem('username') ||
    'Administrator';


  // =====================================================
  // ADD / EDIT MODAL
  // =====================================================

  showAddUserModal = false;

  isEditMode = false;

  editingUserId: number | null = null;


  // =====================================================
  // SAVE STATE
  // =====================================================

  isSavingUser = false;

  addUserSuccess = '';

  addUserError = '';

  modalSuccess = '';

  modalError = '';


  // =====================================================
  // DELETE MODAL
  // =====================================================

  showDeleteModal = false;

  userToDelete: AdminUser | null = null;

  isDeletingUser = false;

  deletingUserId: number | null = null;

  deleteSuccessMessage = '';

  deleteErrorMessage = '';


  // =====================================================
  // EXISTING HTML COMPATIBILITY
  // =====================================================

  get showUserModal(): boolean {

    return this.showAddUserModal;

  }


  set showUserModal(
    value: boolean
  ) {

    this.showAddUserModal = value;

  }


  // =====================================================
  // USER FORM
  // =====================================================

  newUser: {
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
    designation: string;
    role: string;
    departmentId: number | null;
  } = {

    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    designation: '',
    role: 'EMPLOYEE',
    departmentId: null

  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private adminUsersService:
    AdminUsersService,

    private router:
    Router,

    private cdr:
    ChangeDetectorRef

  ) {}


  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.loadUsers();

  }


  // =====================================================
  // LOAD USERS
  // =====================================================

  loadUsers(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.adminUsersService
      .getAllUsers()
      .subscribe({

        next: (
          data: AdminUser[]
        ) => {

          this.users =
            Array.isArray(data)
              ? data
              : [];


          this.filteredUsers =
            [...this.users];


          this.isLoading = false;


          console.log(
            'USERS LOADED:',
            this.users.length
          );


          this.cdr.detectChanges();

        },


        error: (
          error: any
        ) => {

          console.error(
            'LOAD USERS ERROR:',
            error
          );


          this.isLoading = false;

          this.users = [];

          this.filteredUsers = [];


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to load users.'
            );


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  filterUsers(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredUsers =
      this.users.filter(
        (user: AdminUser) => {

          const matchesSearch =

            !search ||

            user.username
              ?.toLowerCase()
              .includes(search) ||

            user.email
              ?.toLowerCase()
              .includes(search) ||

            user.phoneNumber
              ?.toLowerCase()
              .includes(search) ||

            user.designation
              ?.toLowerCase()
              .includes(search);


          const matchesRole =

            this.selectedRole === 'ALL' ||

            user.role?.toUpperCase() ===
            this.selectedRole.toUpperCase();


          return (
            matchesSearch &&
            matchesRole
          );

        }
      );

  }


  // =====================================================
  // ROLE FILTER
  // =====================================================

  onRoleChange(): void {

    this.filterUsers();

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  get totalUsers(): number {

    return this.users.length;

  }


  get totalAdmins(): number {

    return this.users.filter(
      user =>
        user.role?.toUpperCase() === 'ADMIN'
    ).length;

  }


  get totalEmployees(): number {

    return this.users.filter(
      user =>
        user.role?.toUpperCase() !== 'ADMIN'
    ).length;

  }


  // =====================================================
  // USER INITIAL
  // =====================================================

  getInitial(
    username: string
  ): string {

    if (
      !username ||
      !username.trim()
    ) {

      return '?';

    }


    return username
      .charAt(0)
      .toUpperCase();

  }


  // =====================================================
  // OPEN ADD USER
  // =====================================================

  openAddUserModal(): void {

    this.isEditMode = false;

    this.editingUserId = null;

    this.isSavingUser = false;

    this.modalSuccess = '';

    this.modalError = '';

    this.addUserSuccess = '';

    this.addUserError = '';

    this.resetUserForm();

    this.showAddUserModal = true;

    this.cdr.detectChanges();

  }


  // =====================================================
  // OPEN EDIT USER
  // =====================================================

  openEditUserModal(
    user: AdminUser
  ): void {

    this.isEditMode = true;

    this.editingUserId =
      user.userId;

    this.isSavingUser = false;

    this.modalSuccess = '';

    this.modalError = '';

    this.addUserSuccess = '';

    this.addUserError = '';


    this.newUser = {

      username:
        user.username || '',

      email:
        user.email || '',

      password: '',

      phoneNumber:
        user.phoneNumber || '',

      designation:
        user.designation || '',

      role:
        user.role || 'EMPLOYEE',

      departmentId:
        user.departmentId ?? null

    };


    this.showAddUserModal = true;

    this.cdr.detectChanges();

  }


  // =====================================================
  // RESET FORM
  // =====================================================

  private resetUserForm(): void {

    this.newUser = {

      username: '',
      email: '',
      password: '',
      phoneNumber: '',
      designation: '',
      role: 'EMPLOYEE',
      departmentId: null

    };

  }


  // =====================================================
  // CLOSE ADD / EDIT MODAL
  // =====================================================

  closeUserModal(): void {

    if (this.isSavingUser) {

      return;

    }


    this.showAddUserModal = false;

    this.isEditMode = false;

    this.editingUserId = null;

    this.modalSuccess = '';

    this.modalError = '';

    this.addUserSuccess = '';

    this.addUserError = '';

  }


  // =====================================================
  // COMPATIBILITY METHOD
  // =====================================================

  closeAddUserModal(): void {

    this.closeUserModal();

  }


  // =====================================================
  // SAVE USER
  // CREATE + UPDATE
  // =====================================================

  saveUser(): void {

    console.log(
      'SAVE USER BUTTON CLICKED'
    );


    // -------------------------------------------------
    // CLEAR OLD MESSAGES
    // -------------------------------------------------

    this.modalSuccess = '';

    this.modalError = '';

    this.addUserSuccess = '';

    this.addUserError = '';


    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (
      !this.newUser.username.trim()
    ) {

      this.showFormError(
        'Username is required.'
      );

      return;

    }


    if (
      !this.newUser.email.trim()
    ) {

      this.showFormError(
        'Email is required.'
      );

      return;

    }


    if (
      !this.isEditMode &&
      !this.newUser.password.trim()
    ) {

      this.showFormError(
        'Password is required.'
      );

      return;

    }


    if (
      !this.newUser.phoneNumber.trim()
    ) {

      this.showFormError(
        'Phone number is required.'
      );

      return;

    }


    if (
      !this.newUser.designation.trim()
    ) {

      this.showFormError(
        'Designation is required.'
      );

      return;

    }


    if (
      !this.newUser.role
    ) {

      this.showFormError(
        'Role is required.'
      );

      return;

    }


    if (
      !this.newUser.departmentId
    ) {

      this.showFormError(
        'Department is required.'
      );

      return;

    }


    // -------------------------------------------------
    // START SAVING
    // -------------------------------------------------

    this.isSavingUser = true;


    // -------------------------------------------------
    // REQUEST BODY
    // -------------------------------------------------

    const userData: UserRequest = {

      username:
        this.newUser.username.trim(),

      email:
        this.newUser.email.trim(),

      phoneNumber:
        this.newUser.phoneNumber.trim(),

      designation:
        this.newUser.designation.trim(),

      role:
        this.newUser.role.toUpperCase(),

      departmentId:
        Number(
          this.newUser.departmentId
        )

    };


    // Password only when supplied

    if (
      this.newUser.password.trim()
    ) {

      userData.password =
        this.newUser.password;

    }


    // =================================================
    // EDIT
    // =================================================

    if (
      this.isEditMode &&
      this.editingUserId !== null
    ) {

      const userId =
        this.editingUserId;


      this.adminUsersService
        .updateUser(
          userId,
          userData
        )
        .subscribe({

          next: (
            response: AdminUser
          ) => {

            console.log(
              'USER UPDATED SUCCESSFULLY:',
              response
            );


            // -----------------------------------------
            // STOP LOADING
            // -----------------------------------------

            this.isSavingUser = false;


            // -----------------------------------------
            // SUCCESS STATE
            // -----------------------------------------

            this.modalSuccess =
              'User updated successfully.';

            this.addUserSuccess =
              'User updated successfully.';

            this.modalError = '';

            this.addUserError = '';


            this.cdr.detectChanges();


            // -----------------------------------------
            // CLOSE AFTER SUCCESS
            // -----------------------------------------

            setTimeout(() => {

              this.showAddUserModal =
                false;

              this.isEditMode =
                false;

              this.editingUserId =
                null;


              this.successMessage =
                `"${userData.username}" was updated successfully.`;


              this.loadUsers();


              this.cdr.detectChanges();


              setTimeout(() => {

                this.successMessage = '';

                this.cdr.detectChanges();

              }, 3000);

            }, 1200);

          },


          error: (
            error: any
          ) => {

            console.error(
              'UPDATE USER ERROR:',
              error
            );


            this.isSavingUser = false;


            this.showFormError(
              this.getErrorMessage(
                error,
                'Unable to update user.'
              )
            );


            this.cdr.detectChanges();

          }

        });


      return;

    }


    // =================================================
    // CREATE
    // =================================================

    this.adminUsersService
      .registerUser(userData)
      .subscribe({

        next: (
          response: AdminUser
        ) => {

          console.log(
            'USER CREATED SUCCESSFULLY:',
            response
          );


          // -----------------------------------------
          // STOP LOADING
          // -----------------------------------------

          this.isSavingUser = false;


          // -----------------------------------------
          // SUCCESS STATE
          // -----------------------------------------

          this.modalSuccess =
            'User created successfully.';

          this.addUserSuccess =
            'User created successfully.';

          this.modalError = '';

          this.addUserError = '';


          this.cdr.detectChanges();


          // -----------------------------------------
          // CLOSE AFTER SUCCESS
          // -----------------------------------------

          setTimeout(() => {

            this.showAddUserModal =
              false;


            this.successMessage =
              `"${userData.username}" was created successfully.`;


            this.loadUsers();


            this.cdr.detectChanges();


            setTimeout(() => {

              this.successMessage = '';

              this.cdr.detectChanges();

            }, 3000);

          }, 1200);

        },


        error: (
          error: any
        ) => {

          console.error(
            'CREATE USER ERROR:',
            error
          );


          // -----------------------------------------
          // IMPORTANT:
          // ALWAYS STOP CREATING STATE
          // -----------------------------------------

          this.isSavingUser = false;


          this.showFormError(
            this.getErrorMessage(
              error,
              'Unable to create user.'
            )
          );


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // ADD USER COMPATIBILITY
  // =====================================================

  addUser(): void {

    this.saveUser();

  }


  // =====================================================
  // FORM ERROR
  // =====================================================

  private showFormError(
    message: string
  ): void {

    this.modalError = message;

    this.addUserError = message;

    this.modalSuccess = '';

    this.addUserSuccess = '';

    this.isSavingUser = false;

    this.cdr.detectChanges();

  }


  // =====================================================
  // DELETE USER
  // =====================================================

  deleteUser(
    user: AdminUser
  ): void {

    if (
      !user ||
      !user.userId
    ) {

      return;

    }


    console.log(
      'OPEN DELETE CONFIRMATION:',
      user
    );


    this.userToDelete =
      user;

    this.deletingUserId =
      user.userId;

    this.deleteSuccessMessage =
      '';

    this.deleteErrorMessage =
      '';

    this.isDeletingUser =
      false;

    this.showDeleteModal =
      true;


    this.cdr.detectChanges();

  }


  // =====================================================
  // CANCEL DELETE
  // =====================================================

  cancelDelete(): void {

    if (
      this.isDeletingUser
    ) {

      return;

    }


    this.showDeleteModal =
      false;

    this.userToDelete =
      null;

    this.deletingUserId =
      null;

    this.isDeletingUser =
      false;

    this.deleteSuccessMessage =
      '';

    this.deleteErrorMessage =
      '';


    this.cdr.detectChanges();

  }


  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  confirmDeleteUser(): void {

    if (
      !this.userToDelete ||
      !this.userToDelete.userId ||
      this.isDeletingUser
    ) {

      return;

    }


    const userId =
      this.userToDelete.userId;

    const username =
      this.userToDelete.username;


    console.log(
      'DELETE USER:',
      username,
      userId
    );


    // -------------------------------------------------
    // START DELETE
    // -------------------------------------------------

    this.isDeletingUser =
      true;

    this.deleteSuccessMessage =
      '';

    this.deleteErrorMessage =
      '';


    this.cdr.detectChanges();


    // -------------------------------------------------
    // DELETE API
    // -------------------------------------------------

    this.adminUsersService
      .deleteUser(userId)
      .subscribe({

        next: (
          response: string
        ) => {

          console.log(
            'DELETE API SUCCESS:',
            response
          );


          // -------------------------------------------
          // STOP LOADING
          // -------------------------------------------

          this.isDeletingUser =
            false;

          this.deletingUserId =
            null;


          // -------------------------------------------
          // REMOVE FROM TABLE
          // -------------------------------------------

          this.users =
            this.users.filter(
              user =>
                user.userId !== userId
            );


          this.filteredUsers =
            this.filteredUsers.filter(
              user =>
                user.userId !== userId
            );


          // -------------------------------------------
          // SHOW SUCCESS
          // -------------------------------------------

          this.deleteSuccessMessage =
            `"${username}" was deleted successfully.`;

          this.deleteErrorMessage = '';


          this.cdr.detectChanges();


          // -------------------------------------------
          // CLOSE MODAL
          // -------------------------------------------

          setTimeout(() => {

            this.showDeleteModal =
              false;

            this.userToDelete =
              null;

            this.deleteSuccessMessage =
              '';

            this.successMessage =
              `"${username}" was deleted successfully.`;


            this.cdr.detectChanges();


            setTimeout(() => {

              this.successMessage = '';

              this.cdr.detectChanges();

            }, 3000);

          }, 1200);

        },


        error: (
          error: any
        ) => {

          console.error(
            'DELETE USER ERROR:',
            error
          );


          this.isDeletingUser =
            false;

          this.deletingUserId =
            null;


          this.deleteErrorMessage =
            this.getErrorMessage(
              error,
              'Unable to delete user.'
            );


          this.deleteSuccessMessage =
            '';


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refreshUsers(): void {

    this.loadUsers();

  }


  // =====================================================
  // ERROR HANDLER
  // =====================================================

  private getErrorMessage(
    error: any,
    defaultMessage: string
  ): string {

    if (
      typeof error?.error === 'string' &&
      error.error.trim()
    ) {

      return error.error;

    }


    if (
      error?.error?.message
    ) {

      return error.error.message;

    }


    if (
      error?.message
    ) {

      return error.message;

    }


    switch (error?.status) {

      case 400:
        return 'Invalid user details. Please check the form.';

      case 401:
        return 'Unauthorized. Please login again.';

      case 403:
        return 'You do not have permission to perform this action.';

      case 409:
        return 'Username or email already exists.';

      default:
        return defaultMessage;

    }

  }


  // =====================================================
  // DASHBOARD
  // =====================================================

  goToDashboard(): void {

    this.router.navigate([
      '/admin-dashboard'
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
