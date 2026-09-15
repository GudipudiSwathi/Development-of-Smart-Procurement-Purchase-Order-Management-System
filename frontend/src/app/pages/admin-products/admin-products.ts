import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  AdminProductsService,
  Product,
  ProductRequest
} from '../../services/admin-products';

import {
  AdminDepartmentsService,
  Department
} from '../../services/admin-departments';

import {
  AdminCategoriesService,
  Category
} from '../../services/admin-categories';

import {
  AdminSidebar
} from '../../components/admin-sidebar/admin-sidebar';


@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css'
})
export class AdminProducts implements OnInit {

  // =========================================================
  // DATA
  // =========================================================

  products: Product[] = [];

  filteredProducts: Product[] = [];

  departments: Department[] = [];

  categories: Category[] = [];


  // =========================================================
  // SEARCH
  // =========================================================

  searchText = '';


  // =========================================================
  // LOADING
  // =========================================================

  isLoading = true;

  isLoadingDepartments = false;

  isLoadingCategories = false;


  // =========================================================
  // MESSAGES
  // =========================================================

  errorMessage = '';

  successMessage = '';

  modalError = '';

  modalSuccess = '';


  // =========================================================
  // MODAL
  // =========================================================

  showProductModal = false;

  isEditMode = false;

  editingProductId: number | null = null;

  isSavingProduct = false;

  deletingProductId: number | null = null;


  // =========================================================
  // CSV
  // =========================================================

  isDownloading = false;


  // =========================================================
  // PRODUCT FORM
  // =========================================================

  productForm: ProductRequest = {

    name: '',

    price: 0,

    numberOfQuantities: 1,

    totalPrice: 0,

    description: '',

    status: 'ACTIVE',

    departmentId: 0,

    categoryId: 0,

    userId: 0

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

    private adminProductsService:
    AdminProductsService,

    private adminDepartmentsService:
    AdminDepartmentsService,

    private adminCategoriesService:
    AdminCategoriesService,

    private router: Router,

    private cdr: ChangeDetectorRef

  ) {}


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    this.loadProducts();

    this.loadDepartments();

    this.setCurrentUser();

  }


  // =========================================================
  // SET CURRENT USER
  // =========================================================

  setCurrentUser(): void {

    const storedUserId =
      localStorage.getItem('userId');


    if (storedUserId) {

      this.productForm.userId =
        Number(storedUserId);

    }

  }


  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  loadProducts(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();


    this.adminProductsService
      .getAllProducts()
      .subscribe({

        next: (data: Product[]) => {

          console.log(
            'PRODUCTS API SUCCESS:',
            data
          );


          this.products =
            Array.isArray(data)
              ? data
              : [];


          this.filteredProducts =
            [...this.products];


          this.isLoading = false;


          /*
           * IMPORTANT FIX:
           * Immediately refresh the page after
           * receiving products from the backend.
           */
          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'Failed to load products:',
            error
          );


          this.isLoading = false;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to load products.'
            );


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // LOAD DEPARTMENTS
  // =========================================================

  loadDepartments(): void {

    this.isLoadingDepartments = true;

    this.cdr.detectChanges();


    this.adminDepartmentsService
      .getAllDepartments()
      .subscribe({

        next: (data: Department[]) => {

          console.log(
            'PRODUCT DEPARTMENTS API SUCCESS:',
            data
          );


          this.departments =
            Array.isArray(data)
              ? data
              : [];


          this.isLoadingDepartments = false;


          /*
           * Departments are displayed in the
           * product page and product form.
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
  // LOAD CATEGORIES
  // =========================================================

  loadCategories(): void {

    const departmentId =
      Number(
        this.productForm.departmentId
      );


    if (
      !departmentId ||
      departmentId <= 0
    ) {

      this.categories = [];

      this.productForm.categoryId = 0;

      this.cdr.detectChanges();

      return;

    }


    this.isLoadingCategories = true;

    this.cdr.detectChanges();


    this.adminCategoriesService
      .getCategoriesByDepartment(
        departmentId
      )
      .subscribe({

        next: (data: Category[]) => {

          console.log(
            'PRODUCT CATEGORIES API SUCCESS:',
            data
          );


          this.categories =
            Array.isArray(data)
              ? data
              : [];


          this.isLoadingCategories = false;


          /*
           * If the currently selected category
           * does not belong to this department,
           * reset it.
           */

          const categoryExists =
            this.categories.some(
              category =>
                Number(category.categoryId) ===
                Number(
                  this.productForm.categoryId
                )
            );


          if (!categoryExists) {

            this.productForm.categoryId = 0;

          }


          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'Failed to load categories:',
            error
          );


          this.categories = [];

          this.isLoadingCategories = false;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to load categories.'
            );


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // DEPARTMENT CHANGE
  // =========================================================

  onDepartmentChange(): void {

    this.productForm.categoryId = 0;

    this.loadCategories();

    this.cdr.detectChanges();

  }


  // =========================================================
  // CATEGORY CHANGE
  // =========================================================

  onCategoryChange(): void {

    // Reserved for future category-related logic.

    this.cdr.detectChanges();

  }


  // =========================================================
  // SEARCH PRODUCTS
  // =========================================================

  filterProducts(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    if (!search) {

      this.filteredProducts =
        [...this.products];

      this.cdr.detectChanges();

      return;

    }


    this.filteredProducts =
      this.products.filter(
        (product: Product) => {

          const name =
            product.name
              ?.toLowerCase() || '';


          const description =
            product.description
              ?.toLowerCase() || '';


          const status =
            product.status
              ?.toLowerCase() || '';


          const department =
            this.getDepartmentName(
              product.departmentId
            )
              .toLowerCase();


          const category =
            this.getCategoryName(
              product.categoryId
            )
              .toLowerCase();


          return (

            name.includes(search) ||

            description.includes(search) ||

            status.includes(search) ||

            department.includes(search) ||

            category.includes(search)

          );

        }

      );


    this.cdr.detectChanges();

  }


  // =========================================================
  // OPEN ADD PRODUCT MODAL
  // =========================================================

  openAddProductModal(): void {

    this.isEditMode = false;

    this.editingProductId = null;

    this.modalError = '';

    this.modalSuccess = '';

    this.resetProductForm();

    this.setCurrentUser();

    this.categories = [];

    this.showProductModal = true;

    this.cdr.detectChanges();

  }


  // =========================================================
  // OPEN EDIT PRODUCT MODAL
  // =========================================================

  openEditProductModal(
    product: Product
  ): void {

    this.isEditMode = true;

    this.editingProductId =
      product.productId;

    this.modalError = '';

    this.modalSuccess = '';


    this.productForm = {

      name:
        product.name || '',

      price:
        Number(product.price) || 0,

      numberOfQuantities:
        Number(
          product.numberOfQuantities
        ) || 1,

      totalPrice:
        Number(product.totalPrice) || 0,

      description:
        product.description || '',

      status:
        product.status || 'ACTIVE',

      departmentId:
        Number(product.departmentId) || 0,

      categoryId:
        Number(product.categoryId) || 0,

      userId:
        Number(product.userId) ||
        Number(
          localStorage.getItem('userId')
        ) ||
        0

    };


    this.showProductModal = true;


    /*
     * Load categories belonging to
     * the selected department.
     */
    this.loadCategories();


    this.cdr.detectChanges();

  }


  // =========================================================
  // CALCULATE TOTAL PRICE
  // =========================================================

  calculateTotalPrice(): void {

    const price =
      Number(
        this.productForm.price
      ) || 0;


    const quantity =
      Number(
        this.productForm.numberOfQuantities
      ) || 0;


    this.productForm.totalPrice =
      Number(
        (price * quantity).toFixed(2)
      );


    this.cdr.detectChanges();

  }


  // =========================================================
  // SAVE PRODUCT
  // =========================================================

  saveProduct(): void {

    this.modalError = '';

    this.modalSuccess = '';

    this.successMessage = '';


    // -------------------------------------------------------
    // FORM VALUES
    // -------------------------------------------------------

    const name =
      this.productForm.name
        ?.trim();


    const price =
      Number(
        this.productForm.price
      );


    const quantity =
      Number(
        this.productForm.numberOfQuantities
      );


    const departmentId =
      Number(
        this.productForm.departmentId
      );


    const categoryId =
      Number(
        this.productForm.categoryId
      );


    const userId =
      Number(
        this.productForm.userId
      );


    const description =
      this.productForm.description
        ?.trim();


    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!name) {

      this.modalError =
        'Product name is required.';

      this.cdr.detectChanges();

      return;

    }


    if (name.length < 2) {

      this.modalError =
        'Product name must contain at least 2 characters.';

      this.cdr.detectChanges();

      return;

    }


    if (name.length > 150) {

      this.modalError =
        'Product name cannot exceed 150 characters.';

      this.cdr.detectChanges();

      return;

    }


    if (
      !price ||
      price <= 0
    ) {

      this.modalError =
        'Price must be greater than zero.';

      this.cdr.detectChanges();

      return;

    }


    if (
      !quantity ||
      quantity <= 0
    ) {

      this.modalError =
        'Quantity must be greater than zero.';

      this.cdr.detectChanges();

      return;

    }


    if (!description) {

      this.modalError =
        'Product description is required.';

      this.cdr.detectChanges();

      return;

    }


    if (
      !departmentId ||
      departmentId <= 0
    ) {

      this.modalError =
        'Please select a department.';

      this.cdr.detectChanges();

      return;

    }


    if (
      !categoryId ||
      categoryId <= 0
    ) {

      this.modalError =
        'Please select a category.';

      this.cdr.detectChanges();

      return;

    }


    if (
      !userId ||
      userId <= 0
    ) {

      this.modalError =
        'Unable to determine the current user. Please login again.';

      this.cdr.detectChanges();

      return;

    }


    // -------------------------------------------------------
    // CALCULATE TOTAL
    // -------------------------------------------------------

    const totalPrice =
      Number(
        (price * quantity).toFixed(2)
      );


    // -------------------------------------------------------
    // REQUEST
    // -------------------------------------------------------

    const request: ProductRequest = {

      name:

      name,

      price:

      price,

      numberOfQuantities:

      quantity,

      totalPrice:

      totalPrice,

      description:

      description,

      status:

        this.productForm.status ||
        'ACTIVE',

      departmentId:

      departmentId,

      categoryId:

      categoryId,

      userId:

      userId

    };


    this.isSavingProduct = true;

    this.cdr.detectChanges();


    // =======================================================
    // UPDATE
    // =======================================================

    if (
      this.isEditMode &&
      this.editingProductId !== null
    ) {

      this.adminProductsService
        .updateProduct(
          this.editingProductId,
          request
        )
        .subscribe({

          next: (
            updatedProduct: Product
          ) => {

            const index =
              this.products.findIndex(
                product =>
                  product.productId ===
                  updatedProduct.productId
              );


            if (index !== -1) {

              this.products[index] =
                updatedProduct;

            }


            this.filteredProducts =
              [...this.products];


            this.isSavingProduct = false;


            this.modalSuccess =
              'Product updated successfully.';


            this.successMessage =
              'Product updated successfully.';


            this.cdr.detectChanges();


            setTimeout(() => {

              this.closeProductModal();

              this.cdr.detectChanges();

            }, 700);

          },


          error: (error: any) => {

            console.error(
              'Update product failed:',
              error
            );


            this.isSavingProduct = false;


            this.modalError =
              this.getErrorMessage(
                error,
                'Unable to update product.'
              );


            this.cdr.detectChanges();

          }

        });


      return;

    }


    // =======================================================
    // CREATE
    // =======================================================

    this.adminProductsService
      .createProduct(request)
      .subscribe({

        next: (
          createdProduct: Product
        ) => {

          this.products = [

            createdProduct,

            ...this.products

          ];


          this.filteredProducts =
            [...this.products];


          this.isSavingProduct = false;


          this.modalSuccess =
            'Product created successfully.';


          this.successMessage =
            'Product created successfully.';


          this.resetProductForm();

          this.setCurrentUser();

          this.categories = [];


          this.cdr.detectChanges();


          setTimeout(() => {

            this.closeProductModal();

            this.cdr.detectChanges();

          }, 700);

        },


        error: (error: any) => {

          console.error(
            'Create product failed:',
            error
          );


          this.isSavingProduct = false;


          this.modalError =
            this.getErrorMessage(
              error,
              'Unable to create product.'
            );


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  deleteProduct(
    product: Product
  ): void {

    if (
      !product ||
      product.productId === undefined ||
      product.productId === null
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete the product "${product.name}"?`
      );


    if (!confirmed) {

      return;

    }


    this.deletingProductId =
      product.productId;

    this.errorMessage = '';

    this.successMessage = '';


    this.cdr.detectChanges();


    this.adminProductsService
      .deleteProduct(
        product.productId
      )
      .subscribe({

        next: () => {

          this.products =
            this.products.filter(
              item =>
                item.productId !==
                product.productId
            );


          this.filteredProducts =
            this.filteredProducts.filter(
              item =>
                item.productId !==
                product.productId
            );


          this.deletingProductId = null;


          this.successMessage =
            'Product deleted successfully.';


          this.cdr.detectChanges();


          setTimeout(() => {

            this.successMessage = '';

            this.cdr.detectChanges();

          }, 3000);

        },


        error: (error: any) => {

          console.error(
            'Delete product failed:',
            error
          );


          this.deletingProductId = null;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to delete product.'
            );


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // DOWNLOAD CSV
  // =========================================================

  downloadProductsCsv(): void {

    this.isDownloading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();


    this.adminProductsService
      .downloadProductsCsv()
      .subscribe({

        next: (blob: Blob) => {

          const url =
            window.URL.createObjectURL(
              blob
            );


          const anchor =
            document.createElement('a');


          anchor.href = url;

          anchor.download =
            'products.csv';


          document.body.appendChild(
            anchor
          );


          anchor.click();


          anchor.remove();


          window.URL.revokeObjectURL(
            url
          );


          this.isDownloading = false;


          this.successMessage =
            'Products CSV downloaded successfully.';


          this.cdr.detectChanges();


          setTimeout(() => {

            this.successMessage = '';

            this.cdr.detectChanges();

          }, 3000);

        },


        error: (error: any) => {

          console.error(
            'Product CSV download failed:',
            error
          );


          this.isDownloading = false;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to download products CSV.'
            );


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // RESET FORM
  // =========================================================

  resetProductForm(): void {

    this.productForm = {

      name: '',

      price: 0,

      numberOfQuantities: 1,

      totalPrice: 0,

      description: '',

      status: 'ACTIVE',

      departmentId: 0,

      categoryId: 0,

      userId:
        Number(
          localStorage.getItem('userId')
        ) || 0

    };

  }


  // =========================================================
  // CLOSE MODAL
  // =========================================================

  closeProductModal(): void {

    this.showProductModal = false;

    this.isEditMode = false;

    this.editingProductId = null;

    this.isSavingProduct = false;

    this.modalError = '';

    this.modalSuccess = '';

    this.categories = [];

    this.resetProductForm();

    this.cdr.detectChanges();

  }


  // =========================================================
  // REFRESH
  // =========================================================

  refreshProducts(): void {

    this.searchText = '';

    this.loadProducts();

    this.loadDepartments();

  }


  // =========================================================
  // GET DEPARTMENT NAME
  // =========================================================

  getDepartmentName(
    departmentId: number | null
  ): string {

    if (
      departmentId === null ||
      departmentId === undefined
    ) {

      return 'Unknown Department';

    }


    const department =
      this.departments.find(
        item =>
          Number(item.departmentId) ===
          Number(departmentId)
      );


    return department
      ? department.departmentName
      : 'Unknown Department';

  }


  // =========================================================
  // GET CATEGORY NAME
  // =========================================================

  getCategoryName(
    categoryId: number | null
  ): string {

    if (
      categoryId === null ||
      categoryId === undefined
    ) {

      return 'Unknown Category';

    }


    const category =
      this.categories.find(
        item =>
          Number(item.categoryId) ===
          Number(categoryId)
      );


    /*
     * The current categories array can be
     * department-filtered. Therefore, if the
     * category isn't currently loaded, return
     * the ID rather than showing misleading data.
     */

    return category
      ? category.categoryName
      : `Category #${categoryId}`;

  }


  // =========================================================
  // TOTAL PRODUCTS
  // =========================================================

  get totalProducts(): number {

    return this.products.length;

  }


  // =========================================================
  // ACTIVE PRODUCTS
  // =========================================================

  get activeProducts(): number {

    return this.products.filter(
      product =>
        product.status?.toUpperCase() ===
        'ACTIVE'
    ).length;

  }


  // =========================================================
  // TOTAL INVENTORY QUANTITY
  // =========================================================

  get totalInventoryQuantity(): number {

    return this.products.reduce(
      (total, product) =>
        total +
        (
          Number(
            product.numberOfQuantities
          ) || 0
        ),
      0
    );

  }


  // =========================================================
  // TOTAL INVENTORY VALUE
  // =========================================================

  get totalInventoryValue(): number {

    return this.products.reduce(
      (total, product) =>
        total +
        (
          Number(
            product.totalPrice
          ) || 0
        ),
      0
    );

  }


  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  formatCurrency(
    value: number | null | undefined
  ): string {

    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    ).format(
      Number(value) || 0
    );

  }


  // =========================================================
  // ERROR MESSAGE
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


  // =========================================================
  // NAVIGATION
  // =========================================================

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


  // =========================================================
  // LOGOUT
  // =========================================================

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
