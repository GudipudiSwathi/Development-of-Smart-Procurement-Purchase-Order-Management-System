import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  EmployeeDashboardService,
  EmployeePurchaseRequest
} from '../../services/employee-dashboard';

import {
  Tracking,
  TrackingService
} from '../../services/tracking.service';


@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tracking.html',
  styleUrl: './tracking.css'
})
export class TrackingComponent implements OnInit {

  // =====================================================
  // TRACKING
  // =====================================================

  tracking: Tracking | null = null;

  purchaseRequestId: number = 0;


  // =====================================================
  // EMPLOYEE REQUESTS
  // =====================================================

  employeeRequests: EmployeePurchaseRequest[] = [];

  selectedRequest: EmployeePurchaseRequest | null = null;


  // =====================================================
  // USER
  // =====================================================

  userId: number =
    Number(localStorage.getItem('userId')) || 0;


  // =====================================================
  // UI STATE
  // =====================================================

  isLoading: boolean = true;

  errorMessage: string = '';


  // =====================================================
  // TRACKING STAGES
  // =====================================================

  readonly trackingStages: string[] = [
    'REQUEST_RECEIVED',
    'ORDER_CONFIRMED',
    'SHIPPED',
    'IN_TRANSIT',
    'ORDERS_PICKED',
    'SUCCESSFUL'
  ];


  constructor(
    private trackingService: TrackingService,

    private employeeDashboardService:
    EmployeeDashboardService,

    private route: ActivatedRoute,

    private router: Router,

    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const routeId =
        Number(params.get('purchaseRequestId'));


      if (
        routeId &&
        !Number.isNaN(routeId)
      ) {

        this.purchaseRequestId = routeId;

        this.loadEmployeeRequests(true);

        return;
      }


      this.loadEmployeeRequests(false);

    });

  }


  // =====================================================
  // LOAD EMPLOYEE REQUESTS
  // =====================================================

  private loadEmployeeRequests(
    hasRouteRequest: boolean
  ): void {

    this.isLoading = true;
    this.errorMessage = '';
    this.tracking = null;


    if (!this.userId) {

      this.isLoading = false;

      this.errorMessage =
        'Your session could not be identified. Please log in again.';

      this.cdr.detectChanges();

      return;
    }


    this.employeeDashboardService
      .getMyPurchaseRequests(this.userId)
      .subscribe({

        next: (
          requests: EmployeePurchaseRequest[]
        ) => {

          this.employeeRequests =
            Array.isArray(requests)
              ? requests
              : [];


          // =============================================
          // SPECIFIC REQUEST FROM URL
          // =============================================

          if (hasRouteRequest) {

            const request =
              this.employeeRequests.find(
                item =>
                  Number(item.purchaseRequestId) ===
                  Number(this.purchaseRequestId)
              );


            if (!request) {

              this.selectedRequest = null;
              this.tracking = null;
              this.isLoading = false;

              this.errorMessage =
                'The selected purchase request could not be found.';

              this.cdr.detectChanges();

              return;
            }


            this.selectedRequest = request;

            this.loadTracking();

            return;
          }


          // =============================================
          // SORT REQUESTS — NEWEST FIRST
          // =============================================

          const sortedRequests =
            [...this.employeeRequests].sort(
              (first, second) =>
                this.getRequestTime(second) -
                this.getRequestTime(first)
            );


          // =============================================
          // PREFER LATEST APPROVED REQUEST
          // =============================================

          const approvedRequest =
            sortedRequests.find(
              request =>
                this.normalizeStatus(
                  request.status
                ) === 'APPROVED'
            );


          const requestToSelect =
            approvedRequest ||
            sortedRequests[0];


          // =============================================
          // NO REQUESTS
          // =============================================

          if (!requestToSelect) {

            this.selectedRequest = null;
            this.purchaseRequestId = 0;
            this.tracking = null;
            this.isLoading = false;

            this.cdr.detectChanges();

            return;
          }


          // =============================================
          // SELECT REQUEST
          // =============================================

          this.selectedRequest =
            requestToSelect;

          this.purchaseRequestId =
            requestToSelect.purchaseRequestId;


          // =============================================
          // ONLY APPROVED REQUESTS HAVE TRACKING
          // =============================================

          if (
            this.normalizeStatus(
              requestToSelect.status
            ) !== 'APPROVED'
          ) {

            this.tracking = null;
            this.isLoading = false;

            this.cdr.detectChanges();

            return;
          }


          this.loadTracking();

        },


        error: (error: unknown) => {

          console.error(
            'EMPLOYEE REQUESTS ERROR:',
            error
          );

          this.employeeRequests = [];
          this.selectedRequest = null;
          this.tracking = null;

          this.isLoading = false;

          this.errorMessage =
            'Unable to load your purchase requests. Please try again.';

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD TRACKING
  // =====================================================
  //
  // This method is intentionally public because the
  // tracking.html request selector calls loadTracking().
  //
  // =====================================================

  loadTracking(): void {

    // ---------------------------------------------
    // Find selected request if HTML only changed ID
    // ---------------------------------------------

    if (!this.selectedRequest && this.purchaseRequestId) {

      this.selectedRequest =
        this.employeeRequests.find(
          request =>
            Number(request.purchaseRequestId) ===
            Number(this.purchaseRequestId)
        ) || null;

    }


    // ---------------------------------------------
    // No request selected
    // ---------------------------------------------

    if (!this.selectedRequest) {

      this.tracking = null;
      this.isLoading = false;

      this.cdr.detectChanges();

      return;
    }


    // ---------------------------------------------
    // Keep ID synchronized
    // ---------------------------------------------

    this.purchaseRequestId =
      this.selectedRequest.purchaseRequestId;


    // ---------------------------------------------
    // Pending / Rejected / Cancelled
    // ---------------------------------------------
    //
    // These requests do not have tracking yet.
    //

    if (
      this.normalizeStatus(
        this.selectedRequest.status
      ) !== 'APPROVED'
    ) {

      this.tracking = null;
      this.errorMessage = '';
      this.isLoading = false;

      this.cdr.detectChanges();

      return;
    }


    // ---------------------------------------------
    // Approved request
    // ---------------------------------------------

    this.loadTrackingForSelectedRequest();

  }


  // =====================================================
  // LOAD TRACKING FROM API
  // =====================================================

  private loadTrackingForSelectedRequest(): void {

    if (!this.purchaseRequestId) {

      this.isLoading = false;

      this.errorMessage =
        'A valid purchase request could not be identified.';

      this.cdr.detectChanges();

      return;
    }


    this.isLoading = true;
    this.errorMessage = '';
    this.tracking = null;


    this.trackingService
      .getTracking(
        this.purchaseRequestId
      )
      .subscribe({

        next: (data: Tracking) => {

          this.tracking = data;

          this.isLoading = false;

          this.cdr.detectChanges();

        },


        error: (error: unknown) => {

          console.error(
            'TRACKING ERROR:',
            error
          );


          const status =
            this.getHttpStatus(error);


          this.tracking = null;
          this.isLoading = false;


          // -------------------------------------------
          // Approved but Admin has not created tracking
          // -------------------------------------------

          if (status === 404) {

            this.errorMessage = '';

          }


            // -------------------------------------------
            // Unauthorized
          // -------------------------------------------

          else if (status === 403) {

            this.errorMessage =
              'You are not authorized to view this tracking information.';

          }


            // -------------------------------------------
            // Other error
          // -------------------------------------------

          else {

            this.errorMessage =
              'Unable to load tracking information. Please try again.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // SELECT REQUEST
  // =====================================================

  selectRequest(
    request: EmployeePurchaseRequest
  ): void {

    if (!request.purchaseRequestId) {
      return;
    }


    this.selectedRequest = request;

    this.purchaseRequestId =
      request.purchaseRequestId;


    this.tracking = null;

    this.errorMessage = '';


    // ---------------------------------------------
    // Pending / Rejected / Cancelled
    // ---------------------------------------------

    if (
      this.normalizeStatus(
        request.status
      ) !== 'APPROVED'
    ) {

      this.isLoading = false;

      this.cdr.detectChanges();

      return;
    }


    // ---------------------------------------------
    // Approved
    // ---------------------------------------------

    this.loadTracking();

  }


  // =====================================================
  // HTTP STATUS
  // =====================================================

  private getHttpStatus(
    error: unknown
  ): number | null {

    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error
    ) {

      const status =
        (error as {
          status?: unknown
        }).status;


      return typeof status === 'number'
        ? status
        : null;
    }


    return null;

  }


  // =====================================================
  // REQUEST TIME
  // =====================================================

  private getRequestTime(
    request: EmployeePurchaseRequest
  ): number {

    if (!request.requestDate) {

      return Number(
        request.purchaseRequestId
      ) || 0;

    }


    const time =
      new Date(
        request.requestDate
      ).getTime();


    return Number.isNaN(time)
      ? Number(
      request.purchaseRequestId
    ) || 0
      : time;

  }


  // =====================================================
  // STATUS NORMALIZATION
  // =====================================================

  normalizeStatus(
    status: string | null | undefined
  ): string {

    return (status || '')
      .trim()
      .toUpperCase();

  }


  // =====================================================
  // TRACKING STATUS LABEL
  // =====================================================

  getStatusLabel(
    status: string | null | undefined
  ): string {

    return this.trackingService
      .getStatusLabel(status);

  }


  // =====================================================
  // TRACKING STATUS CSS CLASS
  // =====================================================

  getStatusClass(
    status: string | null | undefined
  ): string {

    return this.trackingService
      .getStatusClass(status);

  }


  // =====================================================
  // REQUEST STATUS LABEL
  // =====================================================

  getRequestStatusLabel(
    request: EmployeePurchaseRequest
  ): string {

    const status =
      this.normalizeStatus(
        request.status
      );


    switch (status) {

      case 'PENDING':
        return 'Pending Approval';

      case 'APPROVED':
        return 'Approved';

      case 'REJECTED':
        return 'Rejected';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return request.status || 'Unknown';

    }

  }


  // =====================================================
  // REQUEST STATUS CSS CLASS
  // =====================================================

  getRequestStatusClass(
    request: EmployeePurchaseRequest
  ): string {

    return this.normalizeStatus(
      request.status
    ).toLowerCase();

  }


  // =====================================================
  // TRACKING AVAILABLE
  // =====================================================

  get isTrackingAvailable(): boolean {

    return !!this.tracking;

  }


  // =====================================================
  // SELECTED REQUEST APPROVED
  // =====================================================

  get isSelectedRequestApproved(): boolean {

    return (
      !!this.selectedRequest &&
      this.normalizeStatus(
        this.selectedRequest.status
      ) === 'APPROVED'
    );

  }


  // =====================================================
  // WAITING FOR APPROVAL
  // =====================================================

  get isWaitingForApproval(): boolean {

    return (
      !!this.selectedRequest &&
      !this.isSelectedRequestApproved &&
      !this.errorMessage
    );

  }


  // =====================================================
  // TRACKING BEING PREPARED
  // =====================================================

  get isTrackingBeingPrepared(): boolean {

    return (
      !!this.selectedRequest &&
      this.isSelectedRequestApproved &&
      !this.tracking &&
      !this.isLoading &&
      !this.errorMessage
    );

  }


  // =====================================================
  // STAGE COMPLETED
  // =====================================================

  isStageCompleted(
    stage: string
  ): boolean {

    return this.trackingService
      .isStageCompleted(
        this.tracking?.status,
        stage
      );

  }


  // =====================================================
  // CURRENT STAGE
  // =====================================================

  isCurrentStage(
    stage: string
  ): boolean {

    return this.trackingService
      .isCurrentStage(
        this.tracking?.status,
        stage
      );

  }


  // =====================================================
  // CURRENT STAGE INDEX
  // =====================================================

  getCurrentStageIndex(): number {

    const index =
      this.trackingService
        .getStatusIndex(
          this.tracking?.status
        );


    return index < 0
      ? 0
      : index;

  }


  // =====================================================
  // STAGE DESCRIPTION
  // =====================================================

  getStageDescription(
    stage: string
  ): string {

    switch (stage) {

      case 'REQUEST_RECEIVED':
        return 'Your purchase request has been received.';

      case 'ORDER_CONFIRMED':
        return 'The order has been confirmed.';

      case 'SHIPPED':
        return 'Your order has been shipped.';

      case 'IN_TRANSIT':
        return 'Your order is currently in transit.';

      case 'ORDERS_PICKED':
        return 'The ordered items have been picked up.';

      case 'SUCCESSFUL':
        return 'Your purchase request has been successfully completed.';

      default:
        return '';

    }

  }


  // =====================================================
  // UPDATED DATE
  // =====================================================

  getUpdatedDate(): string {

    return this.trackingService
      .formatDate(
        this.tracking?.updatedDate
      );

  }


  // =====================================================
  // CURRENT STATUS LABEL
  // =====================================================

  get currentStatusLabel(): string {

    return this.getStatusLabel(
      this.tracking?.status
    );

  }


  // =====================================================
  // CURRENT STATUS CLASS
  // =====================================================

  get currentStatusClass(): string {

    return this.getStatusClass(
      this.tracking?.status
    );

  }


  // =====================================================
  // GO BACK
  // =====================================================

  goBack(): void {

    this.router.navigate([
      '/purchase-requests'
    ]);

  }


  // =====================================================
  // DASHBOARD
  // =====================================================

  goToDashboard(): void {

    this.router.navigate([
      '/dashboard'
    ]);

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refresh(): void {

    this.loadEmployeeRequests(
      !!this.purchaseRequestId
    );

  }

}
