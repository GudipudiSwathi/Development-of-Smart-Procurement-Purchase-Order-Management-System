import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import {
  AdminPurchaseRequestsService,
  PurchaseRequest,
  PurchaseRequestItem
} from '../../services/admin-purchase-requests';

import { AdminSidebar } from '../../components/admin-sidebar/admin-sidebar';

import {
  ReviewService,
  Review
} from '../../services/review.service';


interface PaymentAccount {
  accountId: number;
  purchaseRequestId: number;
  userId: number;
  amount: number;
  paymentStatus: string;
  paymentDate?: string | null;
  paymentReference?: string | null;
}


@Component({
  selector: 'app-admin-purchase-requests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './admin-purchase-requests.html',
  styleUrl: './admin-purchase-requests.css'
})
export class AdminPurchaseRequests implements OnInit {

  // =======================================================
  // DATA
  // =======================================================

  purchaseRequests: PurchaseRequest[] = [];

  filteredRequests: PurchaseRequest[] = [];

  selectedRequest: PurchaseRequest | null = null;

  requestToDelete: PurchaseRequest | null = null;


  // =======================================================
  // LOOKUP DATA
  // =======================================================

  users: any[] = [];

  products: any[] = [];

  departments: any[] = [];


  // =======================================================
  // PAYMENT STATUS
  // =======================================================
  // Tracking becomes visible only after payment SUCCESS.
  // The Admin dashboard reads the payment accounts directly
  // so an APPROVED-but-unpaid request cannot show tracking.
  // =======================================================

  private readonly accountsApiUrl =
    'http://localhost:8080/accounts';

  private paidPurchaseRequestIds =
    new Set<number>();

  private paymentStatusLoaded = false;


  // =======================================================
  // UI STATE
  // =======================================================

  isLoading = true;

  isRefreshing = false;

  isDeleting = false;

  isUpdatingStatus = false;

  selectedDecision: 'APPROVED' | 'REJECTED' | '' = '';

  adminRemarks = '';

  showDetailsModal = false;

  showDeleteModal = false;

  successMessage = '';

  errorMessage = '';


  // =======================================================
  // FILTERS
  // =======================================================

  searchTerm = '';

  selectedStatus = 'ALL';

  selectedApprovalLevel = 'ALL';


  // =======================================================
  // PAGINATION
  // =======================================================

  currentPage = 1;

  pageSize = 8;


  // =======================================================
  // STATISTICS
  // =======================================================

  totalRequests = 0;

  pendingRequests = 0;

  approvedRequests = 0;

  rejectedRequests = 0;

  cancelledRequests = 0;

  totalProcurementAmount = 0;

  pendingAmount = 0;


  // =======================================================
  // CUSTOMER REVIEWS
  // =======================================================

  reviews: Review[] = [];

  isLoadingReviews = false;

  reviewsError = '';


  // =======================================================
  // MATH
  // =======================================================

  Math = Math;


  // =======================================================
  // DELIVERY TRACKING
  // =======================================================
  //
  // Five tracking stages:
  // 1. Received Receipt
  // 2. Approved
  // 3. Packed
  // 4. Shipped
  // 5. Delivered
  //
  // Admin can VIEW the current delivery stage.
  // Supplier controls Packed / Shipped / Delivered.
  // =======================================================

  readonly deliverySteps = [
    {
      status: 'REQUEST_RECEIVED',
      label: 'Received Receipt',
      description: 'Purchase request received.'
    },
    {
      status: 'APPROVED',
      label: 'Approved',
      description: 'Request approved by Administrator.'
    },
    {
      status: 'PACKED',
      label: 'Packed',
      description: 'Products packed and ready for dispatch.'
    },
    {
      status: 'SHIPPED',
      label: 'Shipped',
      description: 'Order has been dispatched.'
    },
    {
      status: 'DELIVERED',
      label: 'Delivered',
      description: 'Order delivered to the employee.'
    }
  ];


  /**
   * Admin may see delivery tracking only after payment succeeds.
   * Approval alone is NOT enough.
   */
  isDeliveryTrackingVisible(
    request: PurchaseRequest | null
  ): boolean {

    if (!request || !this.paymentStatusLoaded) {
      return false;
    }

    return (
      this.normalizeStatus(request.status) === 'APPROVED' &&
      this.paidPurchaseRequestIds.has(
        Number(request.purchaseRequestId)
      )
    );
  }


  private getDeliveryStatusValue(
    request: PurchaseRequest
  ): string {

    const requestWithDelivery =
      request as PurchaseRequest & {
        deliveryStatus?: string | null;
      };

    if (requestWithDelivery.deliveryStatus) {
      return requestWithDelivery.deliveryStatus
        .trim()
        .toUpperCase();
    }

    // Compatibility for older approved requests.
    // Backend repair persists APPROVED for these records.
    if (
      this.normalizeStatus(request.status) ===
      'APPROVED'
    ) {
      return 'APPROVED';
    }

    return 'REQUEST_RECEIVED';
  }


  getDeliveryStatusLabel(
    request: PurchaseRequest
  ): string {

    switch (this.getDeliveryStatusValue(request)) {

      case 'REQUEST_RECEIVED':
        return 'Received Receipt';

      case 'APPROVED':
        return 'Approved';

      case 'PACKED':
        return 'Packed';

      case 'SHIPPED':
        return 'Shipped';

      case 'DELIVERED':
        return 'Delivered';

      default:
        return 'Received Receipt';
    }
  }


  isDeliveryStepCompleted(
    request: PurchaseRequest,
    stepStatus: string
  ): boolean {

    const stages = [
      'REQUEST_RECEIVED',
      'APPROVED',
      'PACKED',
      'SHIPPED',
      'DELIVERED'
    ];

    const currentIndex =
      stages.indexOf(
        this.getDeliveryStatusValue(request)
      );

    const stepIndex =
      stages.indexOf(stepStatus);

    return (
      currentIndex >= 0 &&
      stepIndex >= 0 &&
      currentIndex >= stepIndex
    );
  }


  isDeliveryStepCurrent(
    request: PurchaseRequest,
    stepStatus: string
  ): boolean {

    return (
      this.getDeliveryStatusValue(request) ===
      stepStatus
    );
  }


  getDeliveryStatusClass(
    request: PurchaseRequest
  ): string {

    switch (this.getDeliveryStatusValue(request)) {

      case 'APPROVED':
        return 'delivery-approved';

      case 'PACKED':
        return 'delivery-packed';

      case 'SHIPPED':
        return 'delivery-shipped';

      case 'DELIVERED':
        return 'delivery-delivered';

      default:
        return 'delivery-received';
    }
  }


  constructor(
    private purchaseRequestService: AdminPurchaseRequestsService,
    private cdr: ChangeDetectorRef,
    private reviewService: ReviewService,
    private http: HttpClient
  ) {}


  // =======================================================
  // INITIALIZATION
  // =======================================================

  ngOnInit(): void {

    this.loadAllData();
    this.loadPaymentStatuses();

  }


  // =======================================================
  // LOAD ALL DATA
  // =======================================================

  loadAllData(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.loadLookupData();

    this.loadSuppliersRequests();
    this.loadReviews();

  }


  // =======================================================
  // LOAD PAYMENT STATUSES
  // =======================================================

  loadPaymentStatuses(): void {

    this.paymentStatusLoaded = false;
    this.paidPurchaseRequestIds.clear();

    this.http
      .get<PaymentAccount[]>(this.accountsApiUrl)
      .subscribe({
        next: (accounts) => {

          const paymentAccounts =
            Array.isArray(accounts) ? accounts : [];

          paymentAccounts
            .filter(
              account =>
                String(account.paymentStatus || '')
                  .trim()
                  .toUpperCase() === 'SUCCESS'
            )
            .forEach(account => {
              this.paidPurchaseRequestIds.add(
                Number(account.purchaseRequestId)
              );
            });

          this.paymentStatusLoaded = true;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(
            'ADMIN PAYMENT STATUS LOAD FAILED:',
            error
          );

          // Fail closed: if payment status cannot be verified,
          // do not show delivery tracking.
          this.paidPurchaseRequestIds.clear();
          this.paymentStatusLoaded = true;
          this.cdr.detectChanges();
        }
      });
  }


  // =======================================================
  // LOAD CUSTOMER REVIEWS
  // =======================================================

  loadReviews(): void {
    this.isLoadingReviews = true;
    this.reviewsError = '';

    this.reviewService.getAllReviews().subscribe({
      next: (reviews: Review[]) => {
        this.reviews = Array.isArray(reviews) ? reviews : [];
        this.isLoadingReviews = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('ADMIN REVIEWS FAILED:', error);
        this.reviews = [];
        this.isLoadingReviews = false;
        this.reviewsError = this.getErrorMessage(
          error,
          'Unable to load customer reviews.'
        );
        this.cdr.detectChanges();
      }
    });
  }


  getReviewStars(rating: number): string {
    const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
    return '★'.repeat(safeRating) + '☆'.repeat(5 - safeRating);
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


  // =======================================================
  // LOAD PURCHASE REQUESTS
  // =======================================================

  loadSuppliersRequests(): void {

    this.purchaseRequestService
      .getAllPurchaseRequests()
      .subscribe({

        next: (data: PurchaseRequest[]) => {

          this.purchaseRequests =
            Array.isArray(data)
              ? data
              : [];

          this.enrichPurchaseRequests();

          this.calculateStatistics();

          this.applyFilters();

          this.isLoading = false;

          this.isRefreshing = false;

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          console.error(
            'Failed to load purchase requests:',
            error
          );

          this.isLoading = false;

          this.isRefreshing = false;

          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to load purchase requests.'
            );

          this.cdr.detectChanges();

        }

      });

  }


  // =======================================================
  // LOAD LOOKUP DATA
  // =======================================================

  loadLookupData(): void {

    this.purchaseRequestService
      .getAllUsers()
      .subscribe({

        next: (data: any[]) => {

          this.users =
            Array.isArray(data)
              ? data
              : [];

          this.enrichPurchaseRequests();

        },

        error: (error: any) => {

          console.warn(
            'Unable to load users:',
            error
          );

        }

      });


    this.purchaseRequestService
      .getAllProducts()
      .subscribe({

        next: (data: any[]) => {

          this.products =
            Array.isArray(data)
              ? data
              : [];

          this.enrichPurchaseRequests();

        },

        error: (error: any) => {

          console.warn(
            'Unable to load products:',
            error
          );

        }

      });


    this.purchaseRequestService
      .getAllDepartments()
      .subscribe({

        next: (data: any[]) => {

          this.departments =
            Array.isArray(data)
              ? data
              : [];

          this.enrichPurchaseRequests();

        },

        error: (error: any) => {

          console.warn(
            'Unable to load departments:',
            error
          );

        }

      });

  }


  // =======================================================
  // ENRICH REQUEST DATA
  // =======================================================

  enrichPurchaseRequests(): void {

    if (!this.purchaseRequests.length) {
      return;
    }


    this.purchaseRequests.forEach(
      (request: PurchaseRequest) => {

        const user =
          this.users.find(
            (item: any) =>
              Number(item.userId) ===
              Number(request.userId)
          );


        if (user) {

          request.userName =
            user.username ||
            user.name ||
            `User #${request.userId}`;

          request.userEmail =
            user.email ||
            '';

          request.userPhone =
            user.phoneNumber ||
            '';

          request.departmentId =
            user.departmentId ||
            null;

          request.departmentName =
            user.departmentName ||
            this.getDepartmentName(
              user.departmentId
            );

        }


        if (
          request.items &&
          Array.isArray(request.items)
        ) {

          request.items.forEach(
            (item: PurchaseRequestItem) => {

              const product =
                this.products.find(
                  (productItem: any) =>
                    Number(productItem.productId) ===
                    Number(item.productId)
                );


              if (product) {

                item.productName =
                  product.productName ||
                  product.name ||
                  `Product #${item.productId}`;

                item.productPrice =
                  product.price ??
                  product.productPrice ??
                  null;

              }

            }
          );

        }

      }
    );


    this.cdr.detectChanges();

  }


  // =======================================================
  // DEPARTMENT NAME
  // =======================================================

  getDepartmentName(
    departmentId: number | null | undefined
  ): string {

    if (
      departmentId === null ||
      departmentId === undefined
    ) {

      return 'Not assigned';

    }


    const department =
      this.departments.find(
        (item: any) =>
          Number(item.departmentId) ===
          Number(departmentId)
      );


    return department
      ? (
        department.departmentName ||
        department.name ||
        'Department'
      )
      : 'Not assigned';

  }


  // =======================================================
  // STATISTICS
  // =======================================================

  calculateStatistics(): void {

    this.totalRequests =
      this.purchaseRequests.length;


    this.pendingRequests =
      this.purchaseRequests.filter(
        request =>
          this.normalizeStatus(request.status) ===
          'PENDING'
      ).length;


    this.approvedRequests =
      this.purchaseRequests.filter(
        request =>
          this.normalizeStatus(request.status) ===
          'APPROVED'
      ).length;


    this.rejectedRequests =
      this.purchaseRequests.filter(
        request =>
          this.normalizeStatus(request.status) ===
          'REJECTED'
      ).length;


    this.cancelledRequests =
      this.purchaseRequests.filter(
        request =>
          this.normalizeStatus(request.status) ===
          'CANCELLED'
      ).length;


    this.totalProcurementAmount =
      this.purchaseRequests.reduce(
        (
          total: number,
          request: PurchaseRequest
        ) =>
          total +
          Number(request.totalPrice || 0),
        0
      );


    this.pendingAmount =
      this.purchaseRequests
        .filter(
          request =>
            this.normalizeStatus(request.status) ===
            'PENDING'
        )
        .reduce(
          (
            total: number,
            request: PurchaseRequest
          ) =>
            total +
            Number(request.totalPrice || 0),
          0
        );

  }


  // =======================================================
  // REFRESH
  // =======================================================

  refreshRequests(): void {

    this.loadReviews();

    this.isRefreshing = true;

    this.errorMessage = '';

    this.loadSuppliersRequests();
    this.loadPaymentStatuses();

  }


  // =======================================================
  // SEARCH
  // =======================================================

  onSearch(): void {

    this.currentPage = 1;

    this.applyFilters();

  }


  // =======================================================
  // STATUS FILTER
  // =======================================================

  onStatusChange(): void {

    this.currentPage = 1;

    this.applyFilters();

  }


  // =======================================================
  // APPROVAL FILTER
  // =======================================================

  onApprovalLevelChange(): void {

    this.currentPage = 1;

    this.applyFilters();

  }


  // =======================================================
  // APPLY FILTERS
  // =======================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredRequests =
      this.purchaseRequests.filter(
        (request: PurchaseRequest) => {

          // -----------------------------------------------
          // SEARCH
          // -----------------------------------------------

          const searchableText = [

            request.purchaseRequestId,

            request.userId,

            request.userName,

            request.userEmail,

            request.departmentName,

            request.remarks,

            request.adminRemarks,

            request.status,

            ...(request.items || []).map(
              item =>
                item.productName ||
                item.productId
            )

          ]
            .filter(
              value =>
                value !== null &&
                value !== undefined
            )
            .join(' ')
            .toLowerCase();


          const matchesSearch =
            !search ||
            searchableText.includes(search);


          // -----------------------------------------------
          // STATUS
          // -----------------------------------------------

          const matchesStatus =
            this.selectedStatus === 'ALL' ||
            this.normalizeStatus(
              request.status
            ) === this.selectedStatus;


          // -----------------------------------------------
          // APPROVAL LEVEL
          // -----------------------------------------------

          const matchesApproval =
            this.selectedApprovalLevel === 'ALL' ||
            String(
              request.currentApprovalLevel || ''
            ) ===
            this.selectedApprovalLevel;


          return (
            matchesSearch &&
            matchesStatus &&
            matchesApproval
          );

        }
      );


    this.updatePagination();

  }


  // =======================================================
  // CLEAR FILTERS
  // =======================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus = 'ALL';

    this.selectedApprovalLevel = 'ALL';

    this.currentPage = 1;

    this.applyFilters();

  }


  // =======================================================
  // PAGINATION
  // =======================================================

  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.filteredRequests.length /
        this.pageSize
      )
    );

  }


  get paginatedRequests(): PurchaseRequest[] {

    const start =
      (this.currentPage - 1) *
      this.pageSize;


    return this.filteredRequests.slice(
      start,
      start + this.pageSize
    );

  }


  get pageNumbers(): number[] {

    const pages: number[] = [];

    const total =
      this.totalPages;


    for (
      let page = 1;
      page <= total;
      page++
    ) {

      pages.push(page);

    }


    return pages;

  }


  updatePagination(): void {

    if (
      this.currentPage >
      this.totalPages
    ) {

      this.currentPage =
        this.totalPages;

    }

  }


  previousPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

    }

  }


  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;

    }

  }


  goToPage(page: number): void {

    if (
      page >= 1 &&
      page <= this.totalPages
    ) {

      this.currentPage = page;

    }

  }


  // =======================================================
  // VIEW DETAILS
  // =======================================================

  viewDetails(
    request: PurchaseRequest
  ): void {

    this.selectedRequest = request;

    this.adminRemarks = '';

    this.selectedDecision = '';

    this.showDetailsModal = true;

  }


  closeDetails(): void {

    if (this.isUpdatingStatus) {
      return;
    }

    this.showDetailsModal = false;

    this.selectedRequest = null;

    this.adminRemarks = '';

    this.selectedDecision = '';

  }


  // =======================================================
  // APPROVE / REJECT PURCHASE REQUEST
  // =======================================================

  approveRequest(): void {

    if (!this.selectedRequest?.purchaseRequestId) {
      return;
    }

    this.updateRequestStatus(
      this.selectedRequest.purchaseRequestId,
      'APPROVED'
    );

  }


  rejectRequest(): void {

    if (!this.selectedRequest?.purchaseRequestId) {
      return;
    }

    this.updateRequestStatus(
      this.selectedRequest.purchaseRequestId,
      'REJECTED'
    );

  }


  private updateRequestStatus(
    requestId: number,
    status: 'APPROVED' | 'REJECTED'
  ): void {

    if (this.isUpdatingStatus) {
      return;
    }

    this.isUpdatingStatus = true;

    this.selectedDecision = status;

    this.successMessage = '';

    this.errorMessage = '';

    const payload = {
      status,
      adminRemarks: this.adminRemarks?.trim() || null
    };

    this.purchaseRequestService
      .updatePurchaseRequestStatus(
        requestId,
        payload
      )
      .subscribe({

        next: (updatedRequest: PurchaseRequest) => {

          this.isUpdatingStatus = false;

          this.selectedDecision = '';

          this.selectedRequest = updatedRequest;

          this.adminRemarks = '';

          this.purchaseRequests =
            this.purchaseRequests.map(
              (request: PurchaseRequest) =>
                request.purchaseRequestId === requestId
                  ? {
                    ...request,
                    ...updatedRequest
                  }
                  : request
            );

          this.enrichPurchaseRequests();

          this.calculateStatistics();

          this.applyFilters();

          this.successMessage =
            status === 'APPROVED'
              ? `Purchase request #${requestId} approved successfully.`
              : `Purchase request #${requestId} rejected successfully.`;

          this.cdr.detectChanges();

          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 4000);

        },

        error: (error: any) => {

          console.error(
            'Failed to update purchase request status:',
            error
          );

          this.isUpdatingStatus = false;

          this.selectedDecision = '';

          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to update purchase request status.'
            );

          this.cdr.detectChanges();

        }

      });

  }


  // =======================================================
  // DELETE
  // =======================================================

  confirmDelete(
    request: PurchaseRequest
  ): void {

    if (this.isUpdatingStatus) {
      return;
    }

    this.requestToDelete = request;

    this.showDeleteModal = true;

  }


  closeDeleteModal(): void {

    if (this.isDeleting) {
      return;
    }

    this.showDeleteModal = false;

    this.requestToDelete = null;

  }


  deleteRequest(): void {

    if (
      !this.requestToDelete?.purchaseRequestId
    ) {

      return;

    }


    const id =
      this.requestToDelete.purchaseRequestId;


    this.isDeleting = true;

    this.errorMessage = '';


    this.purchaseRequestService
      .deletePurchaseRequest(id)
      .subscribe({

        next: () => {

          this.purchaseRequests =
            this.purchaseRequests.filter(
              request =>
                request.purchaseRequestId !== id
            );


          this.calculateStatistics();

          this.applyFilters();


          this.isDeleting = false;

          this.showDeleteModal = false;

          this.requestToDelete = null;

          this.successMessage =
            `Purchase request #${id} deleted successfully.`;


          this.cdr.detectChanges();


          setTimeout(() => {

            this.successMessage = '';

            this.cdr.detectChanges();

          }, 4000);

        },


        error: (error: any) => {

          console.error(
            'Failed to delete purchase request:',
            error
          );


          this.isDeleting = false;


          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to delete the purchase request.'
            );


          this.cdr.detectChanges();

        }

      });

  }


  // =======================================================
  // ITEM COUNT
  // =======================================================

  getItemCount(
    request: PurchaseRequest
  ): number {

    return request.items?.length || 0;

  }


  // =======================================================
  // TOTAL QUANTITY
  // =======================================================

  getTotalQuantity(
    request: PurchaseRequest
  ): number {

    return (
      request.items || []
    ).reduce(
      (
        total: number,
        item: PurchaseRequestItem
      ) =>
        total +
        Number(item.quantity || 0),
      0
    );

  }


  // =======================================================
  // APPROVAL LABEL
  // =======================================================

  getApprovalLevelLabel(
    level: number | null | undefined,
    status?: string | null
  ): string {

    const normalizedStatus =
      this.normalizeStatus(status);

    // The approval hierarchy was removed.
    // Only the Administrator approves or rejects.
    switch (normalizedStatus) {

      case 'APPROVED':
        return 'Approved';

      case 'REJECTED':
        return 'Rejected';

      case 'CANCELLED':
        return 'Cancelled';

      case 'PENDING':
      default:
        return 'Awaiting Admin';
    }

  }


  // =======================================================
  // STATUS
  // =======================================================

  normalizeStatus(
    status: string | null | undefined
  ): string {

    return String(
      status || 'PENDING'
    ).toUpperCase();

  }


  getStatusLabel(
    status: string | null | undefined
  ): string {

    const normalized =
      this.normalizeStatus(status);


    switch (normalized) {

      case 'APPROVED':
        return 'Approved';

      case 'REJECTED':
        return 'Rejected';

      case 'CANCELLED':
        return 'Cancelled';

      case 'PENDING':
        return 'Pending';

      default:
        return normalized;

    }

  }


  getStatusClass(
    status: string | null | undefined
  ): string {

    switch (
      this.normalizeStatus(status)
      ) {

      case 'APPROVED':
        return 'status-approved';

      case 'REJECTED':
        return 'status-rejected';

      case 'CANCELLED':
        return 'status-cancelled';

      default:
        return 'status-pending';

    }

  }


  // =======================================================
  // CURRENCY
  // =======================================================

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
      Number(value || 0)
    );

  }


  // =======================================================
  // DATE
  // =======================================================

  formatDate(
    value: string | null | undefined
  ): string {

    if (!value) {

      return '—';

    }


    const date =
      new Date(value);


    if (isNaN(date.getTime())) {

      return '—';

    }


    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(date);

  }


  formatDateTime(
    value: string | null | undefined
  ): string {

    if (!value) {

      return '—';

    }


    const date =
      new Date(value);


    if (isNaN(date.getTime())) {

      return '—';

    }


    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(date);

  }


  // =======================================================
  // TRACK BY
  // =======================================================

  trackByRequestId(
    index: number,
    request: PurchaseRequest
  ): number {

    return (
      request.purchaseRequestId ||
      index
    );

  }


  trackByItemId(
    index: number,
    item: PurchaseRequestItem
  ): number {

    return (
      item.productId ||
      index
    );

  }


  // =======================================================
  // ERROR MESSAGE
  // =======================================================

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


    if (error?.status === 401) {

      return 'Your session has expired. Please login again.';

    }


    if (error?.status === 403) {

      return 'You do not have permission to perform this action.';

    }


    return fallback;

  }

}
