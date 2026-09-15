import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AdminSuppliersService,
  Supplier,
  SupplierRequest,
  Category
} from '../../services/admin-suppliers';

import {
  AdminSidebar
} from '../../components/admin-sidebar/admin-sidebar';


@Component({
  selector: 'app-admin-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './admin-suppliers.html',
  styleUrl: './admin-suppliers.css'
})
export class AdminSuppliers implements OnInit {

  // =========================================================
  // DATA
  // =========================================================

  suppliers: Supplier[] = [];

  filteredSuppliers: Supplier[] = [];

  categories: Category[] = [];


  // =========================================================
  // FILTERS
  // =========================================================

  searchText = '';

  selectedStatus = 'ALL';

  selectedCategory = 'ALL';


  // =========================================================
  // LOADING
  // =========================================================

  isLoading = true;

  isSaving = false;

  isDeleting = false;


  // =========================================================
  // MESSAGES
  // =========================================================

  errorMessage = '';

  successMessage = '';

  modalError = '';

  modalSuccess = '';


  // =========================================================
  // MODALS
  // =========================================================

  showSupplierModal = false;

  showDeleteModal = false;

  isEditMode = false;

  editingSupplierId: number | null = null;

  supplierToDelete: Supplier | null = null;


  // =========================================================
  // FORM
  // =========================================================

  supplierForm: SupplierRequest =
    this.createEmptyForm();


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private supplierService: AdminSuppliersService,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    this.loadCategories();

    this.loadSuppliers();

  }


  // =========================================================
  // EMPTY FORM
  // =========================================================

  private createEmptyForm(): SupplierRequest {

    return {

      supplierName: '',

      phoneNumber: '',

      email: '',

      address: '',

      gstNumber: '',

      rating: null,

      feedback: '',

      status: 'ACTIVE',

      categoryId: null

    };

  }


  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  loadCategories(): void {

    this.supplierService
      .getAllCategories()
      .subscribe({

        next: (data: Category[]) => {

          this.categories =
            Array.isArray(data)
              ? data
              : [];


          this.attachCategoryNames();


          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'Failed to load categories:',
            error
          );


          this.categories = [];


          this.errorMessage =
            error?.status === 401
              ? 'Your session has expired. Please login again.'
              : 'Unable to load categories.';


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // LOAD SUPPLIERS
  // =========================================================

  loadSuppliers(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.cdr.detectChanges();


    this.supplierService
      .getAllSuppliers()
      .subscribe({

        next: (data: Supplier[]) => {

          console.log(
            'SUPPLIERS API SUCCESS:',
            data
          );


          this.suppliers =
            Array.isArray(data)
              ? data
              : [];


          this.attachCategoryNames();

          this.filterSuppliers();


          this.isLoading = false;


          /*
           * IMPORTANT:
           * Force Angular to render the newly
           * received supplier data immediately.
           */

          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'Failed to load suppliers:',
            error
          );


          this.suppliers = [];

          this.filteredSuppliers = [];

          this.isLoading = false;


          if (error?.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          } else if (error?.status === 403) {

            this.errorMessage =
              'You do not have permission to manage suppliers.';

          } else {

            this.errorMessage =
              'Unable to load suppliers. Please try again.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // ATTACH CATEGORY NAMES
  // =========================================================

  private attachCategoryNames(): void {

    this.suppliers =
      this.suppliers.map(
        (supplier: Supplier) => ({

          ...supplier,

          categoryName:
            this.getCategoryName(
              supplier.categoryId
            )

        })
      );

  }


  // =========================================================
  // GET CATEGORY NAME
  // =========================================================

  getCategoryName(
    categoryId: number | null | undefined
  ): string {

    if (
      categoryId === null ||
      categoryId === undefined
    ) {

      return 'Unassigned';

    }


    const category =
      this.categories.find(
        item =>
          Number(item.categoryId) ===
          Number(categoryId)
      );


    return category?.categoryName ||
      `Category #${categoryId}`;

  }


  // =========================================================
  // FILTER SUPPLIERS
  // =========================================================

  filterSuppliers(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredSuppliers =
      this.suppliers.filter(
        (supplier: Supplier) => {

          const matchesSearch =
            !search ||

            supplier.supplierName
              ?.toLowerCase()
              .includes(search) ||

            supplier.phoneNumber
              ?.toLowerCase()
              .includes(search) ||

            supplier.email
              ?.toLowerCase()
              .includes(search) ||

            supplier.gstNumber
              ?.toLowerCase()
              .includes(search) ||

            supplier.address
              ?.toLowerCase()
              .includes(search) ||

            supplier.categoryName
              ?.toLowerCase()
              .includes(search);


          const matchesStatus =
            this.selectedStatus === 'ALL' ||
            supplier.status ===
            this.selectedStatus;


          const matchesCategory =
            this.selectedCategory === 'ALL' ||
            Number(supplier.categoryId) ===
            Number(this.selectedCategory);


          return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory
          );

        }
      );


    this.cdr.detectChanges();

  }


  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  clearFilters(): void {

    this.searchText = '';

    this.selectedStatus = 'ALL';

    this.selectedCategory = 'ALL';

    this.filterSuppliers();

    this.cdr.detectChanges();

  }


  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  openAddSupplierModal(): void {

    this.isEditMode = false;

    this.editingSupplierId = null;

    this.supplierForm =
      this.createEmptyForm();

    this.modalError = '';

    this.modalSuccess = '';

    this.showSupplierModal = true;


    this.cdr.detectChanges();

  }


  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  openEditSupplierModal(
    supplier: Supplier
  ): void {

    this.isEditMode = true;

    this.editingSupplierId =
      supplier.supplierId ?? null;


    this.supplierForm = {

      supplierName:
        supplier.supplierName || '',

      phoneNumber:
        supplier.phoneNumber || '',

      email:
        supplier.email || '',

      address:
        supplier.address || '',

      gstNumber:
        supplier.gstNumber || '',

      rating:
        supplier.rating === null ||
        supplier.rating === undefined
          ? null
          : Number(supplier.rating),

      feedback:
        supplier.feedback || '',

      status:
        supplier.status || 'ACTIVE',

      categoryId:
        supplier.categoryId === null ||
        supplier.categoryId === undefined
          ? null
          : Number(supplier.categoryId)

    };


    this.modalError = '';

    this.modalSuccess = '';

    this.showSupplierModal = true;


    this.cdr.detectChanges();

  }


  // =========================================================
  // CLOSE SUPPLIER MODAL
  // =========================================================

  closeSupplierModal(): void {

    if (this.isSaving) {

      return;

    }


    this.showSupplierModal = false;

    this.modalError = '';

    this.modalSuccess = '';


    this.cdr.detectChanges();

  }


  // =========================================================
  // SAVE SUPPLIER
  // =========================================================

  saveSupplier(): void {

    this.modalError = '';

    this.modalSuccess = '';


    if (!this.validateForm()) {

      this.cdr.detectChanges();

      return;

    }


    this.isSaving = true;


    const request: SupplierRequest = {

      supplierName:
        this.supplierForm
          .supplierName
          .trim(),

      phoneNumber:
        this.supplierForm
          .phoneNumber
          .trim(),

      email:
        this.supplierForm
          .email
          .trim(),

      address:
        this.supplierForm
          .address
          .trim(),

      gstNumber:
        this.supplierForm
          .gstNumber
          .trim()
          .toUpperCase(),

      rating:
        this.supplierForm.rating === null ||
        this.supplierForm.rating === undefined ||
        this.supplierForm.rating === ('' as any)
          ? null
          : Number(
            this.supplierForm.rating
          ),

      feedback:
        this.supplierForm.feedback
          ?.trim() || '',

      status: 'ACTIVE',

      categoryId:
        Number(
          this.supplierForm.categoryId
        )

    };


    this.cdr.detectChanges();


    const request$ =
      this.isEditMode &&
      this.editingSupplierId !== null

        ? this.supplierService.updateSupplier(
          this.editingSupplierId,
          request
        )

        : this.supplierService.createSupplier(
          request
        );


    request$.subscribe({

      next: () => {

        this.isSaving = false;


        this.successMessage =
          this.isEditMode
            ? 'Supplier updated successfully.'
            : 'Supplier added successfully.';


        this.showSupplierModal = false;


        this.loadSuppliers();


        this.cdr.detectChanges();


        setTimeout(() => {

          this.successMessage = '';

          this.cdr.detectChanges();

        }, 3500);

      },


      error: (error: any) => {

        console.error(
          'Failed to save supplier:',
          error
        );


        this.isSaving = false;


        this.modalError =
          this.extractErrorMessage(
            error,
            this.isEditMode
              ? 'Unable to update supplier.'
              : 'Unable to add supplier.'
          );


        this.cdr.detectChanges();

      }

    });

  }


  // =========================================================
  // VALIDATE FORM
  // =========================================================

  private validateForm(): boolean {

    if (
      !this.supplierForm
        .supplierName
        .trim()
    ) {

      this.modalError =
        'Supplier name is required.';

      return false;

    }


    if (
      !this.supplierForm
        .phoneNumber
        .trim()
    ) {

      this.modalError =
        'Phone number is required.';

      return false;

    }


    if (
      !/^[0-9+\-\s()]{7,20}$/.test(
        this.supplierForm
          .phoneNumber
          .trim()
      )
    ) {

      this.modalError =
        'Enter a valid phone number.';

      return false;

    }


    if (
      this.supplierForm.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        this.supplierForm.email.trim()
      )
    ) {

      this.modalError =
        'Enter a valid email address.';

      return false;

    }


    if (
      !this.supplierForm
        .address
        .trim()
    ) {

      this.modalError =
        'Address is required.';

      return false;

    }


    if (
      !this.supplierForm
        .gstNumber
        .trim()
    ) {

      this.modalError =
        'GST number is required.';

      return false;

    }


    if (
      this.supplierForm.rating !== null &&
      this.supplierForm.rating !== undefined
    ) {

      const rating =
        Number(
          this.supplierForm.rating
        );


      if (
        Number.isNaN(rating) ||
        rating < 0 ||
        rating > 5
      ) {

        this.modalError =
          'Rating must be between 0 and 5.';

        return false;

      }

    }


    if (
      this.supplierForm.categoryId ===
      null ||
      this.supplierForm.categoryId ===
      undefined
    ) {

      this.modalError =
        'Please select a category.';

      return false;

    }


    return true;

  }


  // =========================================================
  // OPEN DELETE MODAL
  // =========================================================

  openDeleteModal(
    supplier: Supplier
  ): void {

    this.supplierToDelete =
      supplier;

    this.showDeleteModal = true;

    this.modalError = '';


    this.cdr.detectChanges();

  }


  // =========================================================
  // CLOSE DELETE MODAL
  // =========================================================

  closeDeleteModal(): void {

    if (this.isDeleting) {

      return;

    }


    this.showDeleteModal = false;

    this.supplierToDelete = null;


    this.cdr.detectChanges();

  }


  // =========================================================
  // DELETE SUPPLIER
  // =========================================================

  deleteSupplier(): void {

    if (
      !this.supplierToDelete ||
      this.supplierToDelete.supplierId ===
      undefined
    ) {

      return;

    }


    this.isDeleting = true;


    this.cdr.detectChanges();


    this.supplierService
      .deleteSupplier(
        this.supplierToDelete
          .supplierId
      )
      .subscribe({

        next: () => {

          this.isDeleting = false;

          this.showDeleteModal = false;

          this.successMessage =
            'Supplier deleted successfully.';

          this.supplierToDelete = null;


          this.loadSuppliers();


          this.cdr.detectChanges();


          setTimeout(() => {

            this.successMessage = '';

            this.cdr.detectChanges();

          }, 3500);

        },


        error: (error: any) => {

          console.error(
            'Failed to delete supplier:',
            error
          );


          this.isDeleting = false;


          this.errorMessage =
            this.extractErrorMessage(
              error,
              'Unable to delete supplier.'
            );


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // STATISTICS
  // =========================================================

  get totalSuppliers(): number {

    return this.suppliers.length;

  }


  get activeSuppliers(): number {

    return this.suppliers.filter(
      supplier =>
        supplier.status === 'ACTIVE'
    ).length;

  }


  get inactiveSuppliers(): number {

    return this.suppliers.filter(
      supplier =>
        supplier.status === 'INACTIVE'
    ).length;

  }


  get categoriesCovered(): number {

    return new Set(

      this.suppliers

        .map(
          supplier =>
            supplier.categoryId
        )

        .filter(
          id =>
            id !== null &&
            id !== undefined
        )

    ).size;

  }


  // =========================================================
  // AVERAGE RATING
  // =========================================================

  getAverageRating(): number {

    const ratings =
      this.suppliers

        .map(
          supplier =>
            Number(
              supplier.rating
            )
        )

        .filter(
          rating =>
            !Number.isNaN(rating) &&
            rating > 0
        );


    if (!ratings.length) {

      return 0;

    }


    const total =
      ratings.reduce(
        (sum, rating) =>
          sum + rating,
        0
      );


    return total / ratings.length;

  }


  // =========================================================
  // RATING STARS
  // =========================================================

  getRatingStars(
    rating: number | null | undefined
  ): string {

    const value =
      Number(rating);


    if (
      !value ||
      Number.isNaN(value)
    ) {

      return '☆☆☆☆☆';

    }


    const rounded =
      Math.round(value);


    return '★'.repeat(
        Math.min(5, rounded)
      ) +

      '☆'.repeat(
        Math.max(
          0,
          5 - rounded
        )
      );

  }


  // =========================================================
  // TRACK BY
  // =========================================================

  trackBySupplierId(
    index: number,
    supplier: Supplier
  ): number | string {

    return supplier.supplierId ??
      index;

  }


  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  private extractErrorMessage(
    error: any,
    fallback: string
  ): string {

    if (
      typeof error?.error === 'string' &&
      error.error.trim()
    ) {

      return error.error;

    }


    if (
      typeof error?.error?.message ===
      'string' &&
      error.error.message.trim()
    ) {

      return error.error.message;

    }


    if (
      typeof error?.error?.error ===
      'string' &&
      error.error.error.trim()
    ) {

      return error.error.error;

    }


    if (
      typeof error?.message === 'string' &&
      error.message.trim()
    ) {

      return error.message;

    }


    return fallback;

  }

}
