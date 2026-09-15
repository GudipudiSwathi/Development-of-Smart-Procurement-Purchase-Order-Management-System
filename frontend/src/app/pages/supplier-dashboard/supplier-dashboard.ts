import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  SupplierProductsService,
  SupplierProduct,
  SupplierProductRequest
} from '../../services/supplier-products.service';

import { finalize } from 'rxjs';

import {
  ReviewService,
  Review
} from '../../services/review.service';

import {
  SupplierProfile,
  SupplierProfileService
} from '../../services/supplier-profile.service';

import {
  AdminDepartmentsService,
  Department
} from '../../services/admin-departments';

import {
  AdminCategoriesService,
  Category
} from '../../services/admin-categories';

import {
  SupplierDashboardService,
  SupplierDashboardSummary,
  SupplierPurchaseRequest
} from '../../services/supplier-dashboard.service';


@Component({
  selector: 'app-supplier-dashboard',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './supplier-dashboard.html',

  styleUrl: './supplier-dashboard.css'
})
export class SupplierDashboard implements OnInit {


  // =====================================================
  // USER INFORMATION
  // =====================================================

  username: string =
    localStorage.getItem('username') || 'Business';


  role: string =
    localStorage.getItem('role') || 'SUPPLIER';


  userId: number =
    Number(
      localStorage.getItem('userId')
    ) || 0;


  // =====================================================
  // DASHBOARD SUMMARY
  // =====================================================

  summary: SupplierDashboardSummary = {

    pendingRequests: 0,

    completedRequests: 0,

    successfulPayments: 0,

    totalAmountPaid: 0

  };


  // =====================================================
  // REQUEST LISTS
  // =====================================================

  pendingRequests:
    SupplierPurchaseRequest[] = [];


  completedRequests:
    SupplierPurchaseRequest[] = [];


  paymentHistory:
    SupplierPurchaseRequest[] = [];


  // =====================================================
  // CUSTOMER REVIEWS
  // =====================================================

  reviews: Review[] = [];

  isLoadingReviews = false;

  reviewsError = '';


  // =====================================================
  // DELIVERY TRACKING
  // =====================================================

  deliverySteps = [
    {
      status: 'REQUEST_RECEIVED',
      label: 'Request Receipt',
      description: 'Purchase request received from the employee.'
    },
    {
      status: 'APPROVED',
      label: 'Order Confirmed',
      description: 'Order confirmed after administrator approval.'
    },
    {
      status: 'PACKED',
      label: 'Order Packed',
      description: 'Products packed and ready for dispatch.'
    },
    {
      status: 'SHIPPED',
      label: 'Order Shipped',
      description: 'Order has been dispatched to the employee.'
    },
    {
      status: 'DELIVERED',
      label: 'Delivered',
      description: 'Order delivered to the employee.'
    }
  ];

  updatingDeliveryRequestId: number | null = null;

  deliveryError = '';

  deliverySuccess = '';


  // =====================================================
  // CUSTOM DELIVERY CONFIRMATION MODAL
  // =====================================================

  showDeliveryConfirmModal = false;

  deliveryConfirmRequest:
    SupplierPurchaseRequest | null = null;

  deliveryConfirmNextStatus: string | null = null;


  // =====================================================
  // ACTIVE TAB
  // =====================================================

  activeTab:
    'pending'
    | 'completed'
    | 'payments'
    | 'reviews'
    | 'products'
    | 'profile'
    = 'pending';


  // =====================================================
  // LOADING
  // =====================================================

  isLoadingSummary: boolean = true;

  isLoadingRequests: boolean = true;

  // Independent loading states for the Pending and Completed tabs.
  isLoadingPendingRequests: boolean = true;
  isLoadingCompletedRequests: boolean = true;

  isLoadingPayments: boolean = true;


  // =====================================================
  // ERROR
  // =====================================================

  summaryError: string = '';

  requestsError: string = '';
  pendingRequestsError: string = '';
  completedRequestsError: string = '';

  paymentsError: string = '';


  // =====================================================
  // GENERAL LOADING
  // =====================================================

  isRefreshing: boolean = false;


  // =====================================================
  // PRODUCT MANAGEMENT
  // =====================================================

  products: SupplierProduct[] = [];

  filteredProducts: SupplierProduct[] = [];

  departments: Department[] = [];

  categories: Category[] = [];

  allCategories: Category[] = [];

  productSearch = '';

  isLoadingProducts = false;

  isLoadingDepartments = false;

  isLoadingCategories = false;

  productsError = '';

  productSuccess = '';

  showProductModal = false;

  isEditProductMode = false;

  editingProductId: number | null = null;

  isSavingProduct = false;

  deletingProductId: number | null = null;

  productForm: SupplierProductRequest =
    this.createEmptyProductForm();


  // =====================================================
  // SUPPLIER PROFILE
  // =====================================================

  supplierProfile: SupplierProfile =
    this.createEmptySupplierProfile();

  isLoadingProfile = false;

  isEditingProfile = false;

  isSavingProfile = false;

  profileError = '';

  profileSuccess = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private supplierDashboardService:
    SupplierDashboardService,

    private supplierProductsService:
    SupplierProductsService,

    private adminDepartmentsService:
    AdminDepartmentsService,

    private adminCategoriesService:
    AdminCategoriesService,

    private supplierProfileService:
    SupplierProfileService,

    private router: Router,

    private cdr: ChangeDetectorRef,

    private reviewService: ReviewService

  ) {}


  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.loadDashboard();

    this.loadDepartments();

    // Load all categories once.
    // The dropdown is then filtered locally
    // when a department is selected.
    this.loadAllCategories();

  }


  // =====================================================
  // LOAD COMPLETE DASHBOARD
  // =====================================================

  loadDashboard(): void {

    this.loadSummary();

    this.loadPendingRequests();

    this.loadCompletedRequests();

    this.loadPaymentHistory();

  }


  // =====================================================
  // LOAD SUMMARY
  // =====================================================

  loadSummary(): void {

    this.isLoadingSummary = true;

    this.summaryError = '';


    this.supplierDashboardService
      .getSummary()
      .pipe(
        finalize(() => {
          this.isLoadingSummary = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (
          response: SupplierDashboardSummary
        ) => {

          this.summary = {

            pendingRequests:
              response.pendingRequests ?? 0,

            completedRequests:
              response.completedRequests ?? 0,

            successfulPayments:
              response.successfulPayments ?? 0,

            totalAmountPaid:
              response.totalAmountPaid ?? 0

          };


        },


        error: (error) => {

          console.error(
            'SUPPLIER SUMMARY FAILED:',
            error
          );


          this.summaryError =
            this.getErrorMessage(
              error,
              'Unable to load dashboard summary.'
            );

        }

      });

  }


  // =====================================================
  // LOAD PENDING REQUESTS
  // =====================================================

  loadPendingRequests(): void {

    this.isLoadingRequests = true;
    this.isLoadingPendingRequests = true;

    this.requestsError = '';
    this.pendingRequestsError = '';


    this.supplierDashboardService
      .getPendingRequests()
      .pipe(
        finalize(() => {
          // This loading flag belongs only to the Pending tab.
          this.isLoadingRequests = false;
          this.isLoadingPendingRequests = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (
          response: SupplierPurchaseRequest[]
        ) => {

          /*
           * Supplier must see a request only after payment succeeds.
           * Keep the check here as a frontend safety net as well;
           * the backend should apply the same rule.
           */
          this.pendingRequests =
            (response || []).filter(
              (request: SupplierPurchaseRequest) =>
                (request.paymentStatus || '')
                  .trim()
                  .toUpperCase() === 'SUCCESS'
            );


          // finalize() handles the loading state.

        },


        error: (error) => {

          console.error(
            'PENDING REQUESTS FAILED:',
            error
          );


          this.isLoadingRequests = false;
          this.isLoadingPendingRequests = false;

          this.pendingRequestsError =
            this.getErrorMessage(
              error,
              'Unable to load pending requests.'
            );
          this.requestsError = this.pendingRequestsError;

        }

      });

  }


  // =====================================================
  // LOAD COMPLETED REQUESTS
  // =====================================================

  loadCompletedRequests(): void {

    // Do NOT reuse isLoadingRequests here.
    // Pending and Completed requests are loaded independently.
    // Reusing the same flag can leave the Pending tab showing
    // "Loading pending requests..." while another request is still running.
    this.isLoadingCompletedRequests = true;
    this.completedRequestsError = '';

    this.supplierDashboardService
      .getCompletedRequests()
      .pipe(
        finalize(() => {
          // Completed loading must not control the Pending spinner.
          this.isLoadingCompletedRequests = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (
          response: SupplierPurchaseRequest[]
        ) => {

          this.completedRequests =
            response || [];

        },


        error: (error) => {

          console.error(
            'COMPLETED REQUESTS FAILED:',
            error
          );


          this.completedRequests = [];

          this.completedRequestsError =
            this.getErrorMessage(
              error,
              'Unable to load completed requests.'
            );

        }

      });

  }


  // =====================================================
  // LOAD PAYMENT HISTORY
  // =====================================================

  loadPaymentHistory(): void {

    this.isLoadingPayments = true;

    this.paymentsError = '';


    this.supplierDashboardService
      .getPaymentHistory()
      .pipe(
        finalize(() => {
          this.isLoadingPayments = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (
          response: SupplierPurchaseRequest[]
        ) => {

          this.paymentHistory =
            response || [];


        },


        error: (error) => {

          console.error(
            'PAYMENT HISTORY FAILED:',
            error
          );


          this.isLoadingPayments = false;


          this.paymentsError =
            this.getErrorMessage(
              error,
              'Unable to load payment history.'
            );

        }

      });

  }


  // =====================================================
  // CHANGE TAB
  // =====================================================

  selectTab(
    tab:
      | 'pending'
      | 'completed'
      | 'payments'
      | 'reviews'
      | 'products'
      | 'profile'
  ): void {

    this.activeTab = tab;

    // Always refresh summary when switching tabs so payment
    // cards show the latest Admin payment status.
    this.loadSummary();


    // Refresh completed requests when Completed tab is opened
    if (tab === 'completed') {
      this.loadCompletedRequests();
    }


    // Refresh reviews when Reviews tab is opened
    if (tab === 'reviews') {
      this.loadReviews();
    }


    // Load products when Products tab is opened
    if (tab === 'products') {

      this.loadProducts();

    }


    // Load supplier profile when Profile tab is opened
    if (tab === 'profile') {

      this.loadSupplierProfile();

    }


    console.log(
      'SUPPLIER DASHBOARD TAB:',
      tab
    );

  }


  // =====================================================
  // REFRESH DASHBOARD
  // =====================================================

  refreshDashboard(): void {

    if (this.isRefreshing) {

      return;

    }


    this.isRefreshing = true;


    this.loadSummary();


    this.supplierDashboardService
      .getPendingRequests()
      .subscribe({

        next: (
          response: SupplierPurchaseRequest[]
        ) => {

          /*
           * Keep the same payment visibility rule during refresh.
           */
          this.pendingRequests =
            (response || []).filter(
              (request: SupplierPurchaseRequest) =>
                (request.paymentStatus || '')
                  .trim()
                  .toUpperCase() === 'SUCCESS'
            );

        },


        error: (error) => {

          console.error(
            'REFRESH PENDING FAILED:',
            error
          );

        }

      });


    this.supplierDashboardService
      .getCompletedRequests()
      .subscribe({

        next: (
          response: SupplierPurchaseRequest[]
        ) => {

          this.completedRequests =
            response || [];

        },


        error: (error) => {

          console.error(
            'REFRESH COMPLETED FAILED:',
            error
          );

        }

      });


    this.supplierDashboardService
      .getPaymentHistory()
      .subscribe({

        next: (
          response: SupplierPurchaseRequest[]
        ) => {

          this.paymentHistory =
            response || [];

          this.isRefreshing = false;
          /* Angular updates the view automatically. */

        },


        error: (error) => {

          console.error(
            'REFRESH PAYMENTS FAILED:',
            error
          );

          this.isRefreshing = false;

        }

      });


    // Refresh customer reviews
    this.loadReviews();


    // Refresh supplier profile if currently viewing Profile
    if (this.activeTab === 'profile') {

      this.loadSupplierProfile();

    }


    // Refresh products if currently viewing Products
    if (this.activeTab === 'products') {

      this.loadProducts();

    }

  }


  // =====================================================
  // LOAD CUSTOMER REVIEWS
  // =====================================================

  loadReviews(): void {
    this.isLoadingReviews = true;
    this.reviewsError = '';

    this.reviewService
      .getSupplierReviews()
      .pipe(
        finalize(() => {
          this.isLoadingReviews = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (reviews: Review[]) => {
          this.reviews = Array.isArray(reviews) ? reviews : [];
        },
        error: (error) => {
          console.error('SUPPLIER REVIEWS FAILED:', error);
          this.reviews = [];
          this.reviewsError = this.getErrorMessage(
            error,
            'Unable to load customer reviews.'
          );
        }
      });
  }


  getAverageReviewRating(): number {
    if (!this.reviews.length) {
      return 0;
    }

    const total = this.reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    return Math.round((total / this.reviews.length) * 10) / 10;
  }


  getReviewStars(rating: number): string {
    const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
    return '★'.repeat(safeRating) + '☆'.repeat(5 - safeRating);
  }


  // =====================================================
  // PRODUCT MANAGEMENT METHODS
  // =====================================================

  private createEmptyProductForm():
    SupplierProductRequest {

    return {

      name: '',

      price: 0,

      numberOfQuantities: 1,

      totalPrice: 0,

      description: '',

      status: 'ACTIVE',

      departmentId: 0,

      categoryId: 0,

      userId: this.userId

    };

  }


  // =====================================================
  // LOAD DEPARTMENTS
  // =====================================================

  loadDepartments(): void {

    this.isLoadingDepartments = true;


    this.adminDepartmentsService
      .getAllDepartments()
      .subscribe({

        next: (
          data: Department[]
        ) => {

          this.departments =
            Array.isArray(data)
              ? data
              : [];

          this.refreshProductDisplayNames();

          this.isLoadingDepartments = false;

        },


        error: (error) => {

          console.error(
            'SUPPLIER DEPARTMENTS FAILED:',
            error
          );

          this.departments = [];

          this.isLoadingDepartments = false;

          this.productsError =
            this.getErrorMessage(
              error,
              'Unable to load departments.'
            );

        }

      });

  }


  // =====================================================
  // LOAD ALL CATEGORIES
  // =====================================================

  loadAllCategories(): void {

    this.isLoadingCategories = true;


    this.adminCategoriesService
      .getAllCategories()
      .subscribe({

        next: (
          data: Category[]
        ) => {

          this.allCategories =
            Array.isArray(data)
              ? data
              : [];

          this.refreshProductDisplayNames();

          this.isLoadingCategories = false;


          if (
            Number(
              this.productForm.departmentId
            ) > 0
          ) {

            this.filterCategoriesByDepartment();

          }

        },


        error: (error) => {

          console.error(
            'SUPPLIER ALL CATEGORIES FAILED:',
            error
          );

          this.allCategories = [];

          this.categories = [];

          this.isLoadingCategories = false;

          this.productsError =
            this.getErrorMessage(
              error,
              'Unable to load categories.'
            );

        }

      });

  }


  // =====================================================
  // FILTER CATEGORIES BY DEPARTMENT
  // =====================================================

  filterCategoriesByDepartment(): void {

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

      return;

    }


    this.categories =
      this.allCategories.filter(
        (category: Category) =>
          Number(category.departmentId) ===
          departmentId
      );


    const categoryExists =
      this.categories.some(
        (category: Category) =>
          Number(category.categoryId) ===
          Number(this.productForm.categoryId)
      );


    if (!categoryExists) {

      this.productForm.categoryId = 0;

    }

  }


  // =====================================================
  // COMPATIBILITY METHOD FOR TEMPLATE
  // =====================================================

  loadCategories(): void {

    this.filterCategoriesByDepartment();

  }


  // =====================================================
  // LOAD SUPPLIER PRODUCTS
  // =====================================================

  loadProducts(): void {

    console.log('SUPPLIER PRODUCTS: REQUEST START');

    this.isLoadingProducts = true;
    this.productsError = '';
    /* Angular updates the view automatically. */

    this.supplierProductsService
      .getMyProducts()
      .pipe(
        finalize(() => {
          this.isLoadingProducts = false;
          this.cdr.detectChanges();
          console.log('SUPPLIER PRODUCTS: REQUEST FINISHED');
        })
      )
      .subscribe({

        next: (response: any) => {

          console.log('SUPPLIER PRODUCTS: API RESPONSE:', response);

          try {

            let data: SupplierProduct[] = [];

            if (Array.isArray(response)) {
              data = response;
            } else if (Array.isArray(response?.products)) {
              data = response.products;
            } else if (Array.isArray(response?.data)) {
              data = response.data;
            } else if (Array.isArray(response?.content)) {
              data = response.content;
            } else if (Array.isArray(response?.items)) {
              data = response.items;
            }

            this.products = data.map(
              (product: SupplierProduct) =>
                this.mapProductDisplayNames(product)
            );

            this.filterProducts();

            console.log(
              'SUPPLIER PRODUCTS: LOADED COUNT:',
              this.products.length
            );

            /* Angular updates the view automatically. */

          } catch (error) {

            console.error(
              'SUPPLIER PRODUCTS: PROCESSING ERROR:',
              error
            );

            this.products = [];
            this.filteredProducts = [];
            this.productsError =
              'Products could not be displayed.';

            /* Angular updates the view automatically. */
          }
        },

        error: (error) => {

          console.error(
            'SUPPLIER PRODUCTS: API ERROR:',
            error
          );

          this.products = [];
          this.filteredProducts = [];
          this.productsError =
            this.getErrorMessage(
              error,
              'Unable to load your products.'
            );

          /* Angular updates the view automatically. */
        }
      });
  }

  // =====================================================
  // MAP DEPARTMENT / CATEGORY NAMES
  // FOR PRODUCT TABLE
  // =====================================================

  private mapProductDisplayNames(
    product: SupplierProduct
  ): SupplierProduct {

    const departmentId =
      Number(product.departmentId);

    const categoryId =
      Number(product.categoryId);


    const department =
      this.departments.find(
        item =>
          Number(item.departmentId) ===
          departmentId
      );


    const category =
      this.allCategories.find(
        item =>
          Number(item.categoryId) ===
          categoryId
      );


    return {

      ...product,

      departmentName:
        department?.departmentName ||
        product.departmentName ||
        '—',

      categoryName:
        category?.categoryName ||
        product.categoryName ||
        '—'

    };

  }


  // =====================================================
  // REFRESH PRODUCT DISPLAY NAMES
  // =====================================================

  private refreshProductDisplayNames(): void {

    if (!this.products.length) {

      return;

    }


    this.products =
      this.products.map(
        product =>
          this.mapProductDisplayNames(
            product
          )
      );


    this.filterProducts();

  }


  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  filterProducts(): void {

    const search =
      this.productSearch
        .trim()
        .toLowerCase();


    if (!search) {

      this.filteredProducts =
        [...this.products];

      return;

    }


    this.filteredProducts =
      this.products.filter(
        product =>

          (product.name || '')
            .toLowerCase()
            .includes(search)

          ||

          (product.description || '')
            .toLowerCase()
            .includes(search)

          ||

          (product.categoryName || '')
            .toLowerCase()
            .includes(search)

          ||

          (product.departmentName || '')
            .toLowerCase()
            .includes(search)

      );

  }


  // =====================================================
  // OPEN ADD PRODUCT MODAL
  // =====================================================

  openAddProductModal(): void {

    this.isEditProductMode = false;

    this.editingProductId = null;

    this.productSuccess = '';

    this.productsError = '';

    this.productForm =
      this.createEmptyProductForm();

    this.categories = [];

    this.showProductModal = true;

  }


  // =====================================================
  // OPEN EDIT PRODUCT MODAL
  // =====================================================

  openEditProductModal(
    product: SupplierProduct
  ): void {

    this.isEditProductMode = true;

    this.editingProductId =
      product.productId ?? null;

    this.productSuccess = '';

    this.productsError = '';


    this.productForm = {

      name:
        product.name || '',

      price:
        Number(product.price) || 0,

      numberOfQuantities:
        Number(product.numberOfQuantities) || 1,

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
      this.userId

    };


    this.showProductModal = true;

    this.loadCategories();

  }


  // =====================================================
  // CLOSE PRODUCT MODAL
  // =====================================================

  closeProductModal(): void {

    if (this.isSavingProduct) {

      return;

    }


    this.showProductModal = false;

    this.isEditProductMode = false;

    this.editingProductId = null;

  }


  // =====================================================
  // CALCULATE PRODUCT TOTAL
  // =====================================================

  calculateProductTotal(): void {

    const price =
      Number(this.productForm.price) || 0;

    const quantity =
      Number(
        this.productForm.numberOfQuantities
      ) || 0;


    this.productForm.totalPrice =
      price * quantity;

  }


  // =====================================================
  // SAVE PRODUCT
  // =====================================================

  saveProduct(): void {

    this.productSuccess = '';

    this.productsError = '';


    if (
      !this.productForm.name.trim()
    ) {

      this.productsError =
        'Product name is required.';

      return;

    }


    if (
      Number(this.productForm.price) <= 0
    ) {

      this.productsError =
        'Price must be greater than zero.';

      return;

    }


    if (
      Number(
        this.productForm.numberOfQuantities
      ) <= 0
    ) {

      this.productsError =
        'Quantity must be greater than zero.';

      return;

    }


    if (
      !this.productForm.departmentId ||
      Number(
        this.productForm.departmentId
      ) <= 0
    ) {

      this.productsError =
        'Please select a department.';

      return;

    }


    if (
      !this.productForm.categoryId ||
      Number(
        this.productForm.categoryId
      ) <= 0
    ) {

      this.productsError =
        'Please select a category.';

      return;

    }


    if (
      !this.productForm.description.trim()
    ) {

      this.productsError =
        'Description is required.';

      return;

    }


    this.calculateProductTotal();

    this.productForm.userId =
      this.userId;

    this.isSavingProduct = true;


    const request =
      { ...this.productForm };


    const operation =
      this.isEditProductMode &&
      this.editingProductId

        ? this.supplierProductsService
          .updateProduct(
            this.editingProductId,
            request
          )

        : this.supplierProductsService
          .createProduct(
            request
          );


    operation.subscribe({

      next: (
        product: SupplierProduct
      ) => {

        this.isSavingProduct = false;

        this.productSuccess =
          this.isEditProductMode

            ? 'Product updated successfully.'

            : 'Product added successfully.';


        this.showProductModal = false;

        this.loadProducts();

      },


      error: (error) => {

        console.error(
          'SAVE SUPPLIER PRODUCT FAILED:',
          error
        );

        this.isSavingProduct = false;

        this.productsError =
          this.getErrorMessage(
            error,
            'Unable to save product.'
          );

      }

    });

  }


  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  deleteProduct(
    product: SupplierProduct
  ): void {

    if (
      !product.productId ||
      this.deletingProductId !== null
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Delete "${product.name}"? This action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    this.deletingProductId =
      product.productId;

    this.productsError = '';

    this.productSuccess = '';


    this.supplierProductsService
      .deleteProduct(
        product.productId
      )
      .subscribe({

        next: () => {

          this.deletingProductId =
            null;

          this.productSuccess =
            'Product deleted successfully.';

          this.loadProducts();

        },


        error: (error) => {

          console.error(
            'DELETE SUPPLIER PRODUCT FAILED:',
            error
          );

          this.deletingProductId =
            null;

          this.productsError =
            this.getErrorMessage(
              error,
              'Unable to delete product.'
            );

        }

      });

  }


  // =====================================================
  // GET PRODUCT STATUS CLASS
  // =====================================================

  getProductStatusClass(
    status?: string
  ): string {

    return (
      status || ''
    ).toUpperCase() === 'ACTIVE'

      ? 'product-status-active'

      : 'product-status-inactive';

  }


  // =====================================================
  // SUPPLIER PROFILE
  // =====================================================

  private createEmptySupplierProfile():
    SupplierProfile {

    return {

      businessName: '',

      businessType: '',

      description: '',

      website: '',

      contactPerson: '',

      contactEmail: '',

      contactPhone: '',

      address: '',

      city: '',

      state: '',

      pincode: '',

      country: 'India',

      gstNumber: '',

      panNumber: '',

      businessRegistrationNumber: ''

    };

  }


  // =====================================================
  // LOAD SUPPLIER PROFILE
  // =====================================================

  loadSupplierProfile(): void {

    console.log('SUPPLIER PROFILE: REQUEST START');

    this.isLoadingProfile = true;
    this.profileError = '';
    this.profileSuccess = '';

    /* Angular updates the view automatically. */

    this.supplierProfileService
      .getMyProfile()
      .pipe(
        finalize(() => {
          this.isLoadingProfile = false;
          this.cdr.detectChanges();
          console.log('SUPPLIER PROFILE: REQUEST FINISHED');
        })
      )
      .subscribe({

        next: (response: SupplierProfile) => {

          console.log(
            'SUPPLIER PROFILE: API RESPONSE:',
            response
          );

          this.supplierProfile = {
            ...this.createEmptySupplierProfile(),
            ...(response || {})
          };

          console.log(
            'SUPPLIER PROFILE: DATA LOADED:',
            this.supplierProfile
          );

          /* Angular updates the view automatically. */
        },

        error: (error) => {

          console.error(
            'SUPPLIER PROFILE: API ERROR:',
            error
          );

          this.profileError =
            this.getErrorMessage(
              error,
              'Unable to load supplier profile.'
            );

          /* Angular updates the view automatically. */
        }
      });
  }

  // =====================================================
  // START EDITING PROFILE
  // =====================================================

  startEditingProfile(): void {

    this.profileError = '';

    this.profileSuccess = '';

    this.isEditingProfile = true;

  }


  // =====================================================
  // CANCEL PROFILE EDIT
  // =====================================================

  cancelEditingProfile(): void {

    this.isEditingProfile = false;

    this.profileError = '';

    this.profileSuccess = '';

    this.loadSupplierProfile();

  }


  // =====================================================
  // SAVE SUPPLIER PROFILE
  // =====================================================

  saveSupplierProfile(): void {

    this.profileError = '';
    this.profileSuccess = '';


    // Prevent duplicate save requests
    if (this.isSavingProfile) {
      return;
    }


    // =====================================================
    // VALIDATE BUSINESS NAME
    // =====================================================

    if (
      !this.supplierProfile.businessName ||
      !this.supplierProfile.businessName.trim()
    ) {

      this.profileError =
        'Business name is required.';

      return;
    }


    // =====================================================
    // VALIDATE EMAIL
    // =====================================================

    if (
      this.supplierProfile.contactEmail &&
      !this.isValidEmail(
        this.supplierProfile.contactEmail
      )
    ) {

      this.profileError =
        'Please enter a valid contact email.';

      return;
    }


    // =====================================================
    // START SAVING
    // =====================================================

    this.isSavingProfile = true;

    /* Angular updates the view automatically. */


    // =====================================================
    // PREPARE REQUEST
    // =====================================================

    const profileToSave: SupplierProfile = {

      ...this.supplierProfile,

      businessName:
        this.supplierProfile.businessName?.trim() || '',

      businessType:
        this.supplierProfile.businessType?.trim() || '',

      description:
        this.supplierProfile.description?.trim() || '',

      website:
        this.supplierProfile.website?.trim() || '',

      contactPerson:
        this.supplierProfile.contactPerson?.trim() || '',

      contactEmail:
        this.supplierProfile.contactEmail?.trim() || '',

      contactPhone:
        this.supplierProfile.contactPhone?.trim() || '',

      address:
        this.supplierProfile.address?.trim() || '',

      city:
        this.supplierProfile.city?.trim() || '',

      state:
        this.supplierProfile.state?.trim() || '',

      pincode:
        this.supplierProfile.pincode?.trim() || '',

      country:
        this.supplierProfile.country?.trim() || 'India',

      gstNumber:
        this.supplierProfile.gstNumber?.trim() || '',

      panNumber:
        this.supplierProfile.panNumber?.trim() || '',

      businessRegistrationNumber:
        this.supplierProfile.businessRegistrationNumber
          ?.trim() || ''

    };


    console.log(
      'SUPPLIER PROFILE: SAVE REQUEST:',
      profileToSave
    );


    // =====================================================
    // SAVE TO BACKEND
    // =====================================================

    this.supplierProfileService
      .updateMyProfile(profileToSave)
      .pipe(

        // Always stop the loading state
        // whether request succeeds or fails.
        finalize(() => {

          this.isSavingProfile = false;

          /* Angular updates the view automatically. */

          console.log(
            'SUPPLIER PROFILE: SAVE REQUEST FINISHED'
          );

        })

      )
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (
          updatedProfile: SupplierProfile
        ) => {

          console.log(
            'SUPPLIER PROFILE: SAVE SUCCESS:',
            updatedProfile
          );


          this.supplierProfile = {

            ...this.createEmptySupplierProfile(),

            ...(updatedProfile || {})

          };


          this.isEditingProfile = false;

          this.profileError = '';

          this.profileSuccess =
            'Profile updated successfully.';


          /* Angular updates the view automatically. */


          // Keep success message visible for 4 seconds.
          setTimeout(() => {

            this.profileSuccess = '';

            /* Angular updates the view automatically. */

          }, 4000);

        },


        // =================================================
        // ERROR
        // =================================================

        error: (error) => {

          console.error(
            'SUPPLIER PROFILE: SAVE FAILED:',
            error
          );


          this.profileSuccess = '';

          this.profileError =
            this.getErrorMessage(
              error,
              'Unable to update supplier profile.'
            );


          /* Angular updates the view automatically. */

        }

      });

  }


  // =====================================================
  // VALIDATE EMAIL
  // =====================================================

  private isValidEmail(
    email: string
  ): boolean {

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(
      email.trim()
    );

  }


  // =====================================================
  // DELIVERY TRACKING METHODS
  // =====================================================

  getDeliveryStatusLabel(
    status?: string
  ): string {

    switch (
      (status || 'REQUEST_RECEIVED').toUpperCase()
      ) {

      case 'REQUEST_RECEIVED':
        return 'Request Received';

      case 'APPROVED':
        return 'Approved';

      case 'PACKED':
        return 'Packed';

      case 'SHIPPED':
        return 'Shipped';

      case 'DELIVERED':
        return 'Delivered';

      default:
        return 'Request Received';
    }
  }


  // =====================================================
  // DELIVERY STEP COMPLETION
  // =====================================================

  isDeliveryStepCompleted(
    currentStatus?: string,
    stepStatus?: string
  ): boolean {

    const order = [
      'REQUEST_RECEIVED',
      'APPROVED',
      'PACKED',
      'SHIPPED',
      'DELIVERED'
    ];

    const currentIndex =
      order.indexOf(
        (currentStatus || 'REQUEST_RECEIVED').toUpperCase()
      );

    const stepIndex =
      order.indexOf(
        (stepStatus || '').toUpperCase()
      );

    if (stepIndex === -1) {
      return false;
    }

    return currentIndex >= stepIndex;
  }


  // =====================================================
  // GET NEXT DELIVERY STATUS
  // =====================================================

  getNextDeliveryStatus(
    currentStatus?: string
  ): string | null {

    const status =
      (currentStatus || 'REQUEST_RECEIVED').toUpperCase();

    switch (status) {

      case 'REQUEST_RECEIVED':
        // The supplier cannot manually move a request
        // from REQUEST_RECEIVED to APPROVED.
        return null;

      case 'APPROVED':
        return 'PACKED';

      case 'PACKED':
        return 'SHIPPED';

      case 'SHIPPED':
        return 'DELIVERED';

      case 'DELIVERED':
        return null;

      default:
        return null;
    }
  }


  // =====================================================
  // DELIVERY ACTION LABEL
  // =====================================================

  getDeliveryActionLabel(
    nextStatus?: string
  ): string {

    switch (
      (nextStatus || '').toUpperCase()
      ) {

      case 'PACKED':
        return 'Mark as Packed';

      case 'SHIPPED':
        return 'Mark as Shipped';

      case 'DELIVERED':
        return 'Mark as Delivered';

      default:
        return 'Update Delivery';
    }
  }


  // =====================================================
  // UPDATE DELIVERY STATUS
  // =====================================================

  updateDeliveryStatus(
    request: SupplierPurchaseRequest,
    nextStatus: string
  ): void {

    if (
      !request.purchaseRequestId ||
      !nextStatus ||
      this.updatingDeliveryRequestId !== null
    ) {
      return;
    }

    // Open custom Angular confirmation modal
    this.deliveryConfirmRequest = request;
    this.deliveryConfirmNextStatus = nextStatus;

    this.showDeliveryConfirmModal = true;

    this.deliveryError = '';
    this.deliverySuccess = '';

    this.cdr.detectChanges();

    // Start loading state
    this.updatingDeliveryRequestId =
      request.purchaseRequestId;

    this.deliveryError = '';
    this.deliverySuccess = '';

    this.cdr.detectChanges();

    this.supplierDashboardService
      .updateDeliveryStatus(
        request.purchaseRequestId,
        nextStatus
      )
      .subscribe({

        next: (updatedRequest: SupplierPurchaseRequest) => {

          // ==========================================
          // 1. UPDATE UI IMMEDIATELY
          // ==========================================

          request.deliveryStatus =
            updatedRequest?.deliveryStatus ||
            nextStatus;

          // Stop "Updating..." immediately
          this.updatingDeliveryRequestId = null;

          // Show success message
          this.deliverySuccess =
            `Order #${request.purchaseRequestId} successfully updated to ${this.getDeliveryStatusLabel(request.deliveryStatus)}.`;

          this.deliveryError = '';

          this.cdr.detectChanges();


          // ==========================================
          // 2. REFRESH DATA IN BACKGROUND
          // ==========================================

          this.loadSummary();
          this.loadPendingRequests();


          // ==========================================
          // 3. REMOVE SUCCESS MESSAGE AFTER 4 SECONDS
          // ==========================================

          setTimeout(() => {

            this.deliverySuccess = '';

            this.cdr.detectChanges();

          }, 4000);
        },


        error: (error) => {

          console.error(
            'DELIVERY STATUS UPDATE FAILED:',
            error
          );

          // Stop "Updating..."
          this.updatingDeliveryRequestId = null;

          this.deliveryError =
            this.getErrorMessage(
              error,
              'Unable to update delivery status.'
            );

          this.cdr.detectChanges();
        }
      });
  }
  // =====================================================
  // CONFIRM DELIVERY STATUS UPDATE
  // =====================================================

  confirmDeliveryStatusUpdate(): void {

    const request = this.deliveryConfirmRequest;
    const nextStatus = this.deliveryConfirmNextStatus;

    if (
      !request?.purchaseRequestId ||
      !nextStatus ||
      this.updatingDeliveryRequestId !== null
    ) {
      this.closeDeliveryConfirmModal();
      return;
    }

    // ---------------------------------------------
    // SAVE OLD STATUS
    // ---------------------------------------------

    const oldStatus = request.deliveryStatus;


    // ---------------------------------------------
    // UPDATE UI IMMEDIATELY
    // ---------------------------------------------

    request.deliveryStatus = nextStatus;

    this.showDeliveryConfirmModal = false;

    this.updatingDeliveryRequestId = null;

    this.deliveryConfirmRequest = null;
    this.deliveryConfirmNextStatus = null;

    this.deliveryError = '';

    this.deliverySuccess =
      `Order #${request.purchaseRequestId} updated to ${this.getDeliveryStatusLabel(nextStatus)}.`;

    this.cdr.detectChanges();


    // ---------------------------------------------
    // UPDATE BACKEND
    // ---------------------------------------------

    this.supplierDashboardService
      .updateDeliveryStatus(
        request.purchaseRequestId,
        nextStatus
      )
      .subscribe({

        next: (updatedRequest: SupplierPurchaseRequest) => {

          // Use actual backend value if returned
          request.deliveryStatus =
            updatedRequest?.deliveryStatus || nextStatus;

          this.cdr.detectChanges();

          // Refresh completed requests
          this.loadCompletedRequests();

        },

        error: (error) => {

          console.error(
            'DELIVERY STATUS UPDATE FAILED:',
            error
          );


          // -----------------------------------------
          // ROLLBACK UI IF BACKEND FAILED
          // -----------------------------------------

          request.deliveryStatus = oldStatus;

          this.deliveryError =
            this.getErrorMessage(
              error,
              'Unable to update delivery status.'
            );

          this.deliverySuccess = '';

          this.cdr.detectChanges();

        }

      });

    // ---------------------------------------------
    // REMOVE SUCCESS MESSAGE AFTER 4 SECONDS
    // ---------------------------------------------

    setTimeout(() => {

      this.deliverySuccess = '';

      this.cdr.detectChanges();

    }, 4000);
  }

  // =====================================================
  // CANCEL DELIVERY CONFIRMATION
  // =====================================================

  closeDeliveryConfirmModal(): void {

    if (this.updatingDeliveryRequestId !== null) {
      return;
    }


    this.showDeliveryConfirmModal = false;

    this.deliveryConfirmRequest = null;

    this.deliveryConfirmNextStatus = null;

    /* Angular updates the view automatically. */
  }
  // =====================================================
  // GET CURRENT TAB REQUESTS
  // =====================================================

  get currentRequests():
    SupplierPurchaseRequest[] {

    if (
      this.activeTab === 'completed'
    ) {

      return this.completedRequests;

    }


    if (
      this.activeTab === 'payments'
    ) {

      return this.paymentHistory;

    }


    return this.pendingRequests;

  }


  // =====================================================
  // GET PAYMENT STATUS LABEL
  // =====================================================

  getPaymentStatusLabel(
    status?: string
  ): string {

    if (!status) {

      return 'Not Paid';

    }


    switch (
      status.toUpperCase()
      ) {

      case 'SUCCESS':

        return 'Paid';


      case 'FAILED':

        return 'Failed';


      case 'INITIATED':

        return 'Payment Processing';


      case 'NOT_PAID':

        return 'Not Paid';


      default:

        return status;

    }

  }


  // =====================================================
  // PAYMENT STATUS CLASS
  // =====================================================

  getPaymentStatusClass(
    status?: string
  ): string {

    if (!status) {

      return 'status-not-paid';

    }


    switch (
      status.toUpperCase()
      ) {

      case 'SUCCESS':

        return 'status-success';


      case 'FAILED':

        return 'status-failed';


      case 'INITIATED':

        return 'status-processing';


      default:

        return 'status-not-paid';

    }

  }


  // =====================================================
  // REQUEST STATUS CLASS
  // =====================================================

  getRequestStatusClass(
    status?: string
  ): string {

    if (!status) {

      return 'request-status';

    }


    switch (
      status.toUpperCase()
      ) {

      case 'APPROVED':

        return 'request-approved';


      case 'REJECTED':

        return 'request-rejected';


      case 'PENDING':

        return 'request-pending';


      default:

        return 'request-status';

    }

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date?: string
  ): string {

    if (!date) {

      return '—';

    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return date;

    }


    return parsedDate.toLocaleDateString(
      'en-IN',
      {

        day: '2-digit',

        month: 'short',

        year: 'numeric'

      }
    );

  }


  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  formatCurrency(
    amount?: number
  ): string {

    if (
      amount === null ||
      amount === undefined
    ) {

      return '₹0.00';

    }


    return new Intl.NumberFormat(
      'en-IN',
      {

        style: 'currency',

        currency: 'INR',

        minimumFractionDigits: 2,

        maximumFractionDigits: 2

      }
    ).format(amount);

  }


  // =====================================================
  // GET ERROR MESSAGE
  // =====================================================

  private getErrorMessage(
    error: any,
    fallback: string
  ): string {

    if (
      error?.error &&
      typeof error.error === 'string'
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


    if (
      error?.status === 401
    ) {

      return 'Your session has expired. Please login again.';

    }


    if (
      error?.status === 403
    ) {

      return 'You are not authorized to access this page.';

    }


    return fallback;

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'userId'
    );

    localStorage.removeItem(
      'username'
    );

    localStorage.removeItem(
      'role'
    );


    this.router.navigate([
      '/login'
    ]);

  }

}
