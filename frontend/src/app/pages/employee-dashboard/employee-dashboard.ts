import {
  CommonModule
} from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Router
} from '@angular/router';

import {
  EmployeeDashboardService,
  EmployeePurchaseRequest
} from '../../services/employee-dashboard';

import {
  ReviewService,
  Review
} from '../../services/review.service';


interface UserProfile {

  userId: number;

  username: string;

  email: string;

  phoneNumber: string;

  designation: string;

  role: string;

  departmentId: number | null;

  departmentName?: string | null;

}


@Component({

  selector: 'app-employee-dashboard',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './employee-dashboard.html',

  styleUrl: './employee-dashboard.css'

})


export class EmployeeDashboard
  implements OnInit {


  // =====================================================
  // USER PROFILE
  // =====================================================

  userProfile: UserProfile | null = null;

  username: string =
    localStorage.getItem('username') || 'Employee';

  role: string =
    localStorage.getItem('role') || 'EMPLOYEE';

  userId: number =
    Number(localStorage.getItem('userId')) || 0;


  // =====================================================
  // UI STATE
  // =====================================================

  isLoading: boolean = true;

  isProfileLoading: boolean = true;

  errorMessage: string = '';

  profileError: string = '';

  profileMenuOpen: boolean = false;

  profileModalOpen: boolean = false;

  // =====================================================
  // DOWNLOAD
  // =====================================================

  downloadMenuOpen: boolean = false;
  isDownloading: boolean = false;


  // =====================================================
  // REVIEW / FEEDBACK
  // =====================================================

  reviewModalOpen: boolean = false;

  selectedReviewRequest: EmployeePurchaseRequest | null = null;

  selectedReviewProduct: NonNullable<EmployeePurchaseRequest['items']>[number] | null = null;

  selectedRating: number = 0;

  reviewFeedback: string = '';

  isSubmittingReview: boolean = false;

  reviewSuccessMessage: string = '';

  reviewErrorMessage: string = '';

  myReviews: Review[] = [];


  // =====================================================
  // PURCHASE REQUESTS
  // =====================================================

  purchaseRequests: EmployeePurchaseRequest[] = [];

  recentRequests: EmployeePurchaseRequest[] = [];


  // =====================================================
  // DASHBOARD STATISTICS
  // =====================================================

  totalRequests: number = 0;

  pendingRequests: number = 0;

  approvedRequests: number = 0;

  rejectedRequests: number = 0;

  totalSpend: number = 0;

  approvedSpend: number = 0;

  pendingSpend: number = 0;


  // =====================================================
  // PAYMENT / TRACKING VISIBILITY
  // =====================================================

  /**
   * Purchase request IDs for which payment has been completed.
   * Delivery tracking is hidden until the payment is successful.
   */
  private paidPurchaseRequestIds: Set<number> = new Set<number>();

  /**
   * Prevents the tracking section from briefly appearing while
   * payment information is still being loaded.
   */
  private paymentStatusLoaded: boolean = false;


  // =====================================================
  // API
  // =====================================================

  private readonly userApiUrl =
    'http://localhost:8080/users';

  private readonly purchaseRequestDownloadUrl =
    'http://localhost:8080/purchase-requests/download';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private employeeDashboardService:
    EmployeeDashboardService,

    private http: HttpClient,

    private router: Router,

    private cdr: ChangeDetectorRef,

    private reviewService: ReviewService

  ) {}


  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.loadStoredUser();

    this.loadCurrentUser();

    this.loadPurchaseRequests();

    // Tracking must not be shown until payment is confirmed.
    this.loadPaymentStatuses();

    this.loadMyReviews();
  }


  // =====================================================
  // LOAD STORED USER
  // =====================================================

  private loadStoredUser(): void {

    const storedUsername =
      localStorage.getItem('username');

    const storedRole =
      localStorage.getItem('role');

    const storedUserId =
      localStorage.getItem('userId');


    if (storedUsername) {

      this.username =
        storedUsername;

    }


    if (storedRole) {

      this.role =
        storedRole;

    }


    if (storedUserId) {

      const parsedUserId =
        Number(storedUserId);

      if (!Number.isNaN(parsedUserId)) {

        this.userId =
          parsedUserId;

      }

    }

  }


  // =====================================================
  // LOAD CURRENT USER PROFILE
  // =====================================================

  loadCurrentUser(): void {

    this.isProfileLoading = true;

    this.profileError = '';


    this.http
      .get<UserProfile>(
        `${this.userApiUrl}/me`
)
.subscribe({

  next: (profile: UserProfile) => {

    this.userProfile =
      profile;


    if (profile.userId) {

      this.userId =
        profile.userId;

      localStorage.setItem(
        'userId',
        String(profile.userId)
      );

    }


    if (profile.username) {

      this.username =
        profile.username;

      localStorage.setItem(
        'username',
        profile.username
      );

    }


    if (profile.role) {

      this.role =
        profile.role;

      localStorage.setItem(
        'role',
        profile.role
      );

    }


    this.isProfileLoading = false;

    this.cdr.detectChanges();

  },


  error: (error: unknown) => {

    console.error(
      'CURRENT USER PROFILE ERROR:',
      error
    );


    this.isProfileLoading = false;

    this.profileError =
      'Unable to load your profile.';

    this.cdr.detectChanges();

  }

});

}


// =====================================================
// LOAD PAYMENT STATUS FOR TRACKING
// =====================================================

private loadPaymentStatuses(): void {

  this.paymentStatusLoaded = false;
  this.paidPurchaseRequestIds.clear();

  this.http
    .get<Array<{
      purchaseRequestId?: number;
      paymentStatus?: string;
      status?: string;
    }>>('http://localhost:8080/accounts/my')
    .subscribe({

      next: (accounts) => {

        const paymentAccounts =
          Array.isArray(accounts)
            ? accounts
            : [];

        paymentAccounts.forEach(account => {

          const purchaseRequestId =
            Number(account.purchaseRequestId);

          const paymentStatus =
            this.normalizeStatus(
              account.paymentStatus || account.status
            );

          if (
            Number.isFinite(purchaseRequestId) &&
            paymentStatus === 'SUCCESS'
          ) {
            this.paidPurchaseRequestIds.add(
              purchaseRequestId
            );
          }

        });

        this.paymentStatusLoaded = true;
        this.cdr.detectChanges();

      },

      error: (error: unknown) => {

        console.error(
          'PAYMENT STATUS LOAD FAILED:',
          error
        );

        // Fail closed: if payment cannot be verified,
        // do not expose delivery tracking.
        this.paidPurchaseRequestIds.clear();
        this.paymentStatusLoaded = true;
        this.cdr.detectChanges();

      }

    });

}


// =====================================================
// LOAD PURCHASE REQUESTS
// =====================================================

loadPurchaseRequests(): void {

  this.isLoading = true;

  this.errorMessage = '';


  this.employeeDashboardService
    .getMyPurchaseRequests(this.userId)
    .subscribe({

      next: (
        data: EmployeePurchaseRequest[]
      ) => {

        this.purchaseRequests =
          Array.isArray(data)
            ? data
            : [];


        this.calculateStatistics();

        this.prepareRecentRequests();


        this.isLoading = false;

        this.cdr.detectChanges();

      },


      error: (error: unknown) => {

        console.error(
          'PURCHASE REQUESTS ERROR:',
          error
        );


        this.purchaseRequests = [];

        this.recentRequests = [];

        this.resetStatistics();

        this.isLoading = false;

        this.errorMessage =
          'Unable to load your purchase requests.';

        this.cdr.detectChanges();

      }

    });

}


// =====================================================
// CALCULATE STATISTICS
// =====================================================

private calculateStatistics(): void {

  this.totalRequests =
    this.purchaseRequests.length;


  this.pendingRequests =
    this.purchaseRequests.filter(
      (
        request: EmployeePurchaseRequest
      ) =>
        this.normalizeStatus(
          request.status
        ) === 'PENDING'
    ).length;


  this.approvedRequests =
    this.purchaseRequests.filter(
      (
        request: EmployeePurchaseRequest
      ) =>
        this.normalizeStatus(
          request.status
        ) === 'APPROVED'
    ).length;


  this.rejectedRequests =
    this.purchaseRequests.filter(
      (
        request: EmployeePurchaseRequest
      ) =>
        this.normalizeStatus(
          request.status
        ) === 'REJECTED'
    ).length;


  this.totalSpend =
    this.purchaseRequests.reduce(
      (
        total: number,
        request: EmployeePurchaseRequest
      ) =>
        total +
        this.getRequestAmount(request),
      0
    );


  this.approvedSpend =
    this.purchaseRequests
      .filter(
        (
          request: EmployeePurchaseRequest
        ) =>
          this.normalizeStatus(
            request.status
          ) === 'APPROVED'
      )
      .reduce(
        (
          total: number,
          request: EmployeePurchaseRequest
        ) =>
          total +
          this.getRequestAmount(request),
        0
      );


  this.pendingSpend =
    this.purchaseRequests
      .filter(
        (
          request: EmployeePurchaseRequest
        ) =>
          this.normalizeStatus(
            request.status
          ) === 'PENDING'
      )
      .reduce(
        (
          total: number,
          request: EmployeePurchaseRequest
        ) =>
          total +
          this.getRequestAmount(request),
        0
      );

}


// =====================================================
// RESET STATISTICS
// =====================================================

private resetStatistics(): void {

  this.totalRequests = 0;

  this.pendingRequests = 0;

  this.approvedRequests = 0;

  this.rejectedRequests = 0;

  this.totalSpend = 0;

  this.approvedSpend = 0;

  this.pendingSpend = 0;

}


// =====================================================
// RECENT REQUESTS
// =====================================================

private prepareRecentRequests(): void {

  this.recentRequests =
    [...this.purchaseRequests]
      .sort(
        (
          first: EmployeePurchaseRequest,
          second: EmployeePurchaseRequest
        ) =>
          this.getTime(
            second.requestDate
          ) -
          this.getTime(
            first.requestDate
          )
      )
      .slice(0, 5);

}


// =====================================================
// SAFE DATE
// =====================================================

private getTime(
  value: string | undefined
): number {

  if (!value) {

    return 0;

  }


  const time =
    new Date(value).getTime();


  return Number.isNaN(time)
    ? 0
    : time;

}


// =====================================================
// REQUEST AMOUNT
// =====================================================

getRequestAmount(
  request: EmployeePurchaseRequest
): number {

  const amount =
    Number(request.totalPrice);


  return Number.isFinite(amount)
    ? amount
    : 0;

}


// =====================================================
// NORMALIZE STATUS
// =====================================================

normalizeStatus(
  status: string | null | undefined
): string {

  return (status || '')
    .trim()
    .toUpperCase();

}


// =====================================================
// STATUS LABEL
// =====================================================

getStatusLabel(
  status: string | null | undefined
): string {

  const normalized =
    this.normalizeStatus(status);


  switch (normalized) {

    case 'PENDING':
      return 'Pending';

    case 'APPROVED':
      return 'Approved';

    case 'REJECTED':
      return 'Rejected';

    case 'CANCELLED':
      return 'Cancelled';

    default:
      return status || 'Unknown';

  }

}


// =====================================================
// STATUS CLASS
// =====================================================

getStatusClass(
  status: string | null | undefined
): string {

  const normalized =
    this.normalizeStatus(status);


  switch (normalized) {

    case 'PENDING':
      return 'pending';

    case 'APPROVED':
      return 'approved';

    case 'REJECTED':
      return 'rejected';

    case 'CANCELLED':
      return 'cancelled';

    default:
      return 'unknown';

  }

}


// =====================================================
// USER INITIAL
// =====================================================

get userInitial(): string {

  const name =
    this.userProfile?.username ||
    this.username ||
    'E';


  return name
    .charAt(0)
    .toUpperCase();

}


// =====================================================
// DISPLAY ROLE
// =====================================================

get displayRole(): string {

  const currentRole =
    this.userProfile?.role ||
    this.role ||
    'EMPLOYEE';


  return currentRole
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(
      /\b\w/g,
      (char: string) =>
        char.toUpperCase()
    );

}


// =====================================================
// DISPLAY DEPARTMENT
// =====================================================

get displayDepartment(): string {

  if (
    this.userProfile?.departmentName
  ) {

    return this.userProfile.departmentName;

  }


  if (
    this.userProfile?.departmentId
  ) {

    return `Department ${this.userProfile.departmentId}`;

  }


  return 'Not assigned';

}


// =====================================================
// PROFILE MENU
// =====================================================

toggleProfileMenu(): void {

  this.profileMenuOpen =
    !this.profileMenuOpen;

}


closeProfileMenu(): void {

  this.profileMenuOpen =
    false;

}


// =====================================================
// PROFILE MODAL
// =====================================================

openProfile(): void {

  this.profileMenuOpen =
    false;

  this.profileModalOpen =
    true;

}


closeProfile(): void {

  this.profileModalOpen =
    false;

}


// =====================================================
// NAVIGATION
// =====================================================

createPurchaseRequest(): void {

  this.router.navigate([
    '/purchase-requests'
  ]);

}


viewPurchaseRequests(): void {

  this.router.navigate([
    '/purchase-requests'
  ]);

}


viewTracking(): void {

  const trackingSection = document.getElementById('employee-delivery-tracking');

  if (trackingSection) {
    trackingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}


// =====================================================
// DELIVERY TRACKING
// =====================================================

readonly deliverySteps = [
  { status: 'REQUEST_RECEIVED', label: 'Request Receipt', description: 'Your purchase request was received.' },
  { status: 'APPROVED', label: 'Order Confirmed', description: 'The order was confirmed after payment.' },
  { status: 'PACKED', label: 'Order Packed', description: 'The supplier has packed your products.' },
  { status: 'SHIPPED', label: 'Order Shipped', description: 'Your order has been dispatched.' },
  { status: 'DELIVERED', label: 'Delivered', description: 'Your order has been delivered.' }
];

/**
 * Tracking is available only when BOTH conditions are true:
 * 1. Administrator approved the purchase request.
 * 2. Payment status is SUCCESS.
 *
 * An approved-but-unpaid request must never appear here.
 */
get approvedTrackingRequests(): EmployeePurchaseRequest[] {

  if (!this.paymentStatusLoaded) {
    return [];
  }

  return this.purchaseRequests.filter(
    request =>
      this.normalizeStatus(request.status) === 'APPROVED' &&
      this.paidPurchaseRequestIds.has(
        Number(request.purchaseRequestId)
      )
  );

}


isPaymentCompleted(
  request: EmployeePurchaseRequest
): boolean {
  return this.paidPurchaseRequestIds.has(
    Number(request.purchaseRequestId)
  );
}


getDeliveryStatus(
  request: EmployeePurchaseRequest
): string {

  // Never expose delivery progress for an unpaid request.
  if (!this.isPaymentCompleted(request)) {
    return 'REQUEST_RECEIVED';
  }

  if (request.deliveryStatus) {
    return request.deliveryStatus
      .trim()
      .toUpperCase();
  }

  // A paid + approved request starts at the confirmed-order stage.
  if (this.normalizeStatus(request.status) === 'APPROVED') {
    return 'APPROVED';
  }

  return 'REQUEST_RECEIVED';
}

getDeliveryStatusLabel(status?: string): string {
  switch ((status || 'REQUEST_RECEIVED').toUpperCase()) {
    case 'REQUEST_RECEIVED': return 'Received Receipt';
    case 'APPROVED': return 'Approved';
    case 'PACKED': return 'Packed';
    case 'SHIPPED': return 'Shipped';
    case 'DELIVERED': return 'Delivered';
    default: return 'Received Receipt';
  }
}

isDeliveryStepCompleted(currentStatus: string | undefined, stepStatus: string): boolean {
  const order = ['REQUEST_RECEIVED', 'APPROVED', 'PACKED', 'SHIPPED', 'DELIVERED'];
  const currentIndex = order.indexOf((currentStatus || 'REQUEST_RECEIVED').toUpperCase());
  const stepIndex = order.indexOf(stepStatus.toUpperCase());
  return stepIndex >= 0 && currentIndex >= stepIndex;
}

isDeliveryStepCurrent(currentStatus: string | undefined, stepStatus: string): boolean {
  return (currentStatus || 'REQUEST_RECEIVED').toUpperCase() === stepStatus.toUpperCase();
}


viewPayments(): void {

  this.router.navigate([
    '/payments'
  ]);

}


viewRequest(
  request: EmployeePurchaseRequest
): void {

  if (
!request.purchaseRequestId
) {

  return;

}


this.router.navigate([
  '/purchase-requests',
  request.purchaseRequestId
]);

}


// =====================================================
// REVIEW / FEEDBACK
// =====================================================

get deliveredTrackingRequests(): EmployeePurchaseRequest[] {
  return this.approvedTrackingRequests.filter(
    request =>
      this.getDeliveryStatus(request) === 'DELIVERED'
  );
}


isDelivered(request: EmployeePurchaseRequest): boolean {
  return this.getDeliveryStatus(request) === 'DELIVERED';
}


hasReviewedProduct(
  requestId: number,
  productId: number | undefined
): boolean {
  return this.myReviews.some(
    review =>
      Number(review.purchaseRequestId) === Number(requestId) &&
      Number(review.productId) === Number(productId)
  );
}


getReviewForProduct(
  requestId: number,
  productId: number | undefined
): Review | undefined {
  return this.myReviews.find(
    review =>
      Number(review.purchaseRequestId) === Number(requestId) &&
      Number(review.productId) === Number(productId)
  );
}


loadMyReviews(): void {
  this.reviewService.getMyReviews().subscribe({
    next: (reviews: Review[]) => {
      this.myReviews = Array.isArray(reviews)
        ? reviews
        : [];
      this.cdr.detectChanges();
    },
    error: (error: unknown) => {
      console.error('MY REVIEWS ERROR:', error);
      this.myReviews = [];
      this.cdr.detectChanges();
    }
  });
}


openReviewModal(
  request: EmployeePurchaseRequest,
  product: NonNullable<EmployeePurchaseRequest['items']>[number]
): void {

  if (!request || !product?.productId) {
  return;
}

if (!this.isDelivered(request)) {
  return;
}

if (this.hasReviewedProduct(
  request.purchaseRequestId,
  product.productId
)) {
  return;
}

this.selectedReviewRequest = request;

this.selectedReviewProduct = product;

this.selectedRating = 0;

this.reviewFeedback = '';

this.reviewSuccessMessage = '';

this.reviewErrorMessage = '';

this.isSubmittingReview = false;

this.reviewModalOpen = true;

this.cdr.detectChanges();
}


closeReviewModal(): void {

  if (this.isSubmittingReview) {
  return;
}

this.reviewModalOpen = false;

this.selectedReviewRequest = null;

this.selectedReviewProduct = null;

this.selectedRating = 0;

this.reviewFeedback = '';

this.reviewSuccessMessage = '';

this.reviewErrorMessage = '';
}


setRating(rating: number): void {

  if (
    rating < 1 ||
rating > 5 ||
this.isSubmittingReview
) {
  return;
}

this.selectedRating = rating;
}


isRatingSelected(star: number): boolean {
  return star <= this.selectedRating;
}


submitReview(): void {

  if (
!this.selectedReviewRequest ||
!this.selectedReviewProduct ||
!this.selectedReviewProduct.productId
) {
  return;
}

if (this.selectedRating < 1 || this.selectedRating > 5) {
  this.reviewErrorMessage =
    'Please select a rating from 1 to 5 stars.';
  return;
}

if (!this.isDelivered(this.selectedReviewRequest)) {
  this.reviewErrorMessage =
    'Reviews are available only after the order is delivered.';
  return;
}

const requestId =
  this.selectedReviewRequest.purchaseRequestId;

const productId =
  this.selectedReviewProduct.productId;

if (this.hasReviewedProduct(requestId, productId)) {
  this.reviewErrorMessage =
    'You have already reviewed this product.';
  return;
}

this.isSubmittingReview = true;

this.reviewErrorMessage = '';

this.reviewSuccessMessage = '';

this.reviewService.createReview({
  purchaseRequestId: requestId,
  productId: productId,
  rating: this.selectedRating,
  feedback: this.reviewFeedback.trim()
}).subscribe({

  next: (savedReview: Review) => {

    this.myReviews = [
      savedReview,
      ...this.myReviews
    ];

    this.isSubmittingReview = false;

    this.reviewSuccessMessage =
      'Your review was submitted successfully.';

    this.cdr.detectChanges();

    setTimeout(() => {
      this.closeReviewModal();
      this.cdr.detectChanges();
    }, 1200);
  },

  error: (error: any) => {

    console.error(
      'CREATE REVIEW ERROR:',
      error
    );

    this.isSubmittingReview = false;

    this.reviewErrorMessage =
      error?.error?.message ||
      error?.error?.error ||
      'Unable to submit your review. Please try again.';

    this.cdr.detectChanges();
  }
});
}


getReviewButtonLabel(
  request: EmployeePurchaseRequest,
  product: NonNullable<EmployeePurchaseRequest['items']>[number]
): string {

  if (
    product?.productId &&
    this.hasReviewedProduct(
      request.purchaseRequestId,
      product.productId
    )
  ) {
    return 'Reviewed';
  }

  return 'Review Product';
}


// =====================================================
// DOWNLOAD PURCHASE REQUESTS
// =====================================================

/**
 * Opens/closes the download format popup.
 */
toggleDownloadMenu(): void {
  if (this.isDownloading) {
  return;
}

this.downloadMenuOpen = !this.downloadMenuOpen;
}


/**
 * Closes the download format popup.
 */
closeDownloadMenu(): void {
  if (this.isDownloading) {
  return;
}

this.downloadMenuOpen = false;
}


/**
 * Downloads the logged-in employee's purchase requests
 * in the selected format.
 *
 * The backend endpoint must return the authenticated
 * employee's data only.
 */
downloadPurchaseRequests(format: 'pdf' | 'xlsx' | 'csv'): void {
  if (this.isDownloading) {
  return;
}

const fileNames: Record<'pdf' | 'xlsx' | 'csv', string> = {
  pdf: 'purchase-requests.pdf',
  xlsx: 'purchase-requests.xlsx',
  csv: 'purchase-requests.csv'
};

const endpoints: Record<'pdf' | 'xlsx' | 'csv', string> = {
  pdf: `${this.purchaseRequestDownloadUrl}/pdf`,
  xlsx: `${this.purchaseRequestDownloadUrl}/xlsx`,
  csv: this.purchaseRequestDownloadUrl
};

this.isDownloading = true;

this.http
  .get(endpoints[format], {
    responseType: 'blob'
  })
  .subscribe({
    next: (blob: Blob) => {
      if (!blob || blob.size === 0) {
        console.error('DOWNLOAD ERROR: Empty file received.');
        this.isDownloading = false;
        return;
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = downloadUrl;
      anchor.download = fileNames[format];
      anchor.style.display = 'none';

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(downloadUrl);

      this.isDownloading = false;
      this.downloadMenuOpen = false;

      this.cdr.detectChanges();
    },

    error: (error: unknown) => {
      console.error(
        `PURCHASE REQUEST ${format.toUpperCase()} DOWNLOAD ERROR:`,
        error
      );

      this.isDownloading = false;
      this.cdr.detectChanges();
    }
  });
}


// =====================================================
// REFRESH
// =====================================================

refreshDashboard(): void {

  this.loadCurrentUser();

  this.loadPurchaseRequests();

}


// =====================================================
// LOGOUT
// =====================================================

logout(): void {

  localStorage.removeItem('token');

  localStorage.removeItem('userId');

  localStorage.removeItem('username');

  localStorage.removeItem('role');


  this.profileMenuOpen =
    false;

  this.profileModalOpen =
    false;


  this.router.navigate([
    '/login'
  ]);

}

}
