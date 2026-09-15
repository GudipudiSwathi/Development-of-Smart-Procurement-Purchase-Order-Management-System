import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AdminCategoriesService,
  Category,
  CategoryRequest
} from '../../services/admin-categories';

import { AdminSidebar } from '../../components/admin-sidebar/admin-sidebar';

import {
  AdminDepartmentsService,
  Department
} from '../../services/admin-departments';


@Component({
  selector: 'app-admin-categories',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],

  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css'
})
export class AdminCategories implements OnInit {

  // =========================================================
  // DATA
  // =========================================================

  categories: Category[] = [];

  filteredCategories: Category[] = [];

  departments: Department[] = [];


  // =========================================================
  // SEARCH
  // =========================================================

  searchText = '';


  // =========================================================
  // LOADING / ERROR / SUCCESS
  // =========================================================

  isLoading = true;

  isLoadingDepartments = false;

  errorMessage = '';

  successMessage = '';


  // =========================================================
  // CATEGORY MODAL
  // =========================================================

  showCategoryModal = false;

  isEditMode = false;

  editingCategoryId: number | null = null;

  isSavingCategory = false;

  deletingCategoryId: number | null = null;


  // =========================================================
  // MODAL MESSAGES
  // =========================================================

  modalError = '';

  modalSuccess = '';


  // =========================================================
  // CATEGORY FORM
  // =========================================================

  categoryForm: CategoryRequest = {
    categoryName: '',
    departmentId: 0
  };


  // =========================================================
  // ADMIN INFORMATION
  // =========================================================

  adminName: string =
    localStorage.getItem('username') ||
    'Administrator';


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private adminCategoriesService: AdminCategoriesService,

    private adminDepartmentsService: AdminDepartmentsService,

    private cdr: ChangeDetectorRef
  ) {}


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    this.loadCategories();

    this.loadDepartments();
  }


  // =========================================================
  // LOAD ALL CATEGORIES
  // =========================================================

  loadCategories(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();


    this.adminCategoriesService
      .getAllCategories()
      .subscribe({

        next: (data: Category[]) => {

          this.categories =
            Array.isArray(data)
              ? data
              : [];


          this.filteredCategories =
            [...this.categories];


          this.isLoading = false;

          /*
           * IMPORTANT:
           * Force Angular to refresh the page immediately
           * after the API response.
           */
          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'Failed to load categories:',
            error
          );


          this.isLoading = false;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to load categories.'
            );


          /*
           * Refresh the UI immediately after an API error.
           */
          this.cdr.detectChanges();

        }

      });
  }


  // =========================================================
  // LOAD ALL DEPARTMENTS
  // =========================================================

  loadDepartments(): void {

    this.isLoadingDepartments = true;

    this.cdr.detectChanges();


    this.adminDepartmentsService
      .getAllDepartments()
      .subscribe({

        next: (data: Department[]) => {

          this.departments =
            Array.isArray(data)
              ? data
              : [];


          this.isLoadingDepartments = false;


          /*
           * IMPORTANT:
           * Department names are used by the category page.
           * Refresh immediately when department data arrives.
           */
          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'Failed to load departments:',
            error
          );


          this.isLoadingDepartments = false;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to load departments.'
            );


          this.cdr.detectChanges();

        }

      });
  }


  // =========================================================
  // SEARCH / FILTER CATEGORIES
  // =========================================================

  filterCategories(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    if (!search) {

      this.filteredCategories =
        [...this.categories];

      this.cdr.detectChanges();

      return;
    }


    this.filteredCategories =
      this.categories.filter(
        (category: Category) => {

          const categoryName =
            category.categoryName
              ?.toLowerCase() || '';


          const departmentName =
            this.getDepartmentName(
              category.departmentId,
              category.departmentName
            )
              .toLowerCase();


          return (
            categoryName.includes(search) ||
            departmentName.includes(search)
          );

        }
      );


    this.cdr.detectChanges();
  }


  // =========================================================
  // OPEN ADD CATEGORY MODAL
  // =========================================================

  openAddCategoryModal(): void {

    this.isEditMode = false;

    this.editingCategoryId = null;

    this.modalError = '';

    this.modalSuccess = '';

    this.resetCategoryForm();

    this.showCategoryModal = true;

    this.cdr.detectChanges();
  }


  // =========================================================
  // OPEN EDIT CATEGORY MODAL
  // =========================================================

  openEditCategoryModal(
    category: Category
  ): void {

    this.isEditMode = true;

    this.editingCategoryId =
      category.categoryId;


    this.modalError = '';

    this.modalSuccess = '';


    this.categoryForm = {

      categoryName:
      category.categoryName,

      departmentId:
        Number(category.departmentId)

    };


    this.showCategoryModal = true;

    this.cdr.detectChanges();
  }


  // =========================================================
  // SAVE CATEGORY
  // =========================================================

  saveCategory(): void {

    this.modalError = '';

    this.modalSuccess = '';

    this.successMessage = '';


    // -------------------------------------------------------
    // READ FORM VALUES
    // -------------------------------------------------------

    const categoryName =
      this.categoryForm.categoryName
        ?.trim();


    const departmentId =
      Number(
        this.categoryForm.departmentId
      );


    // -------------------------------------------------------
    // VALIDATE CATEGORY NAME
    // -------------------------------------------------------

    if (!categoryName) {

      this.modalError =
        'Category name is required.';

      this.cdr.detectChanges();

      return;
    }


    if (categoryName.length < 2) {

      this.modalError =
        'Category name must contain at least 2 characters.';

      this.cdr.detectChanges();

      return;
    }


    if (categoryName.length > 100) {

      this.modalError =
        'Category name cannot exceed 100 characters.';

      this.cdr.detectChanges();

      return;
    }


    // -------------------------------------------------------
    // VALIDATE DEPARTMENT
    // -------------------------------------------------------

    if (
      !departmentId ||
      departmentId <= 0
    ) {

      this.modalError =
        'Please select a department.';

      this.cdr.detectChanges();

      return;
    }


    // -------------------------------------------------------
    // REQUEST OBJECT
    // -------------------------------------------------------

    const request: CategoryRequest = {

      categoryName:
      categoryName,

      departmentId:
      departmentId

    };


    this.isSavingCategory = true;

    this.cdr.detectChanges();


    // =======================================================
    // UPDATE EXISTING CATEGORY
    // =======================================================

    if (
      this.isEditMode &&
      this.editingCategoryId !== null
    ) {

      this.adminCategoriesService
        .updateCategory(
          this.editingCategoryId,
          request
        )
        .subscribe({

          next: (
            updatedCategory: Category
          ) => {

            const index =
              this.categories.findIndex(
                category =>
                  category.categoryId ===
                  updatedCategory.categoryId
              );


            if (index !== -1) {

              this.categories[index] =
                updatedCategory;

            }


            this.filteredCategories =
              [...this.categories];


            this.isSavingCategory = false;


            this.modalSuccess =
              'Category updated successfully.';


            this.successMessage =
              'Category updated successfully.';


            this.cdr.detectChanges();


            setTimeout(() => {

              this.closeCategoryModal();

              this.cdr.detectChanges();

            }, 700);

          },


          error: (error: any) => {

            console.error(
              'Update category failed:',
              error
            );


            this.isSavingCategory = false;


            this.modalError =
              this.getErrorMessage(
                error,
                'Unable to update category.'
              );


            this.cdr.detectChanges();

          }

        });


      return;
    }


    // =======================================================
    // CREATE NEW CATEGORY
    // =======================================================

    this.adminCategoriesService
      .createCategory(request)
      .subscribe({

        next: (
          createdCategory: Category
        ) => {

          this.categories = [

            createdCategory,

            ...this.categories

          ];


          this.filteredCategories =
            [...this.categories];


          this.isSavingCategory = false;


          this.modalSuccess =
            'Category created successfully.';


          this.successMessage =
            'Category created successfully.';


          this.resetCategoryForm();


          this.cdr.detectChanges();


          setTimeout(() => {

            this.closeCategoryModal();

            this.cdr.detectChanges();

          }, 700);

        },


        error: (error: any) => {

          console.error(
            'Create category failed:',
            error
          );


          this.isSavingCategory = false;


          this.modalError =
            this.getErrorMessage(
              error,
              'Unable to create category.'
            );


          this.cdr.detectChanges();

        }

      });
  }


  // =========================================================
  // DELETE CATEGORY
  // =========================================================

  deleteCategory(
    category: Category
  ): void {

    if (
      !category ||
      category.categoryId === undefined ||
      category.categoryId === null
    ) {

      return;
    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete the category "${category.categoryName}"?`
      );


    if (!confirmed) {

      return;
    }


    this.deletingCategoryId =
      category.categoryId;


    this.errorMessage = '';

    this.successMessage = '';


    this.cdr.detectChanges();


    this.adminCategoriesService
      .deleteCategory(
        category.categoryId
      )
      .subscribe({

        next: () => {

          // Remove from main list
          this.categories =
            this.categories.filter(
              item =>
                item.categoryId !==
                category.categoryId
            );


          // Remove from filtered list
          this.filteredCategories =
            this.filteredCategories.filter(
              item =>
                item.categoryId !==
                category.categoryId
            );


          this.deletingCategoryId = null;


          this.successMessage =
            'Category deleted successfully.';


          this.cdr.detectChanges();


          setTimeout(() => {

            this.successMessage = '';

            this.cdr.detectChanges();

          }, 3000);

        },


        error: (error: any) => {

          console.error(
            'Delete category failed:',
            error
          );


          this.deletingCategoryId = null;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to delete category.'
            );


          this.cdr.detectChanges();

        }

      });
  }


  // =========================================================
  // RESET CATEGORY FORM
  // =========================================================

  resetCategoryForm(): void {

    this.categoryForm = {

      categoryName: '',

      departmentId: 0

    };
  }


  // =========================================================
  // CLOSE CATEGORY MODAL
  // =========================================================

  closeCategoryModal(): void {

    this.showCategoryModal = false;

    this.isEditMode = false;

    this.editingCategoryId = null;

    this.isSavingCategory = false;

    this.modalError = '';

    this.modalSuccess = '';

    this.resetCategoryForm();

    this.cdr.detectChanges();
  }


  // =========================================================
  // REFRESH CATEGORIES
  // =========================================================

  refreshCategories(): void {

    this.searchText = '';

    this.loadCategories();

    this.loadDepartments();

  }


  // =========================================================
  // GET DEPARTMENT NAME
  // =========================================================

  getDepartmentName(
    departmentId: number,
    departmentName?: string
  ): string {

    // If backend already provides
    // departmentName, use it.
    if (departmentName) {

      return departmentName;
    }


    const department =
      this.departments.find(
        item =>
          item.departmentId ===
          Number(departmentId)
      );


    if (department) {

      return department.departmentName;
    }


    return 'Unknown Department';
  }


  // =========================================================
  // TOTAL CATEGORIES
  // =========================================================

  get totalCategories(): number {

    return this.categories.length;
  }


  // =========================================================
  // DEPARTMENTS WITH CATEGORIES
  // =========================================================

  get departmentsWithCategories(): number {

    const departmentIds =
      this.categories

        .map(
          category =>
            Number(
              category.departmentId
            )
        )

        .filter(
          id =>
            id > 0
        );


    return new Set(
      departmentIds
    ).size;
  }


  // =========================================================
  // ERROR MESSAGE HANDLER
  // =========================================================

  private getErrorMessage(
    error: any,
    defaultMessage: string
  ): string {

    if (error?.error?.message) {

      return error.error.message;
    }


    if (
      typeof error?.error === 'string' &&
      error.error.trim()
    ) {

      return error.error;
    }


    if (error?.message) {

      return error.message;
    }


    if (error?.status === 403) {

      return 'You do not have permission to perform this action.';
    }


    if (error?.status === 401) {

      return 'Unauthorized. Please login again.';
    }


    return defaultMessage;
  }

}
