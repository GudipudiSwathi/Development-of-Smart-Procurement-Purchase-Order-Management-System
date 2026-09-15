import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  map
} from 'rxjs';


// =====================================================
// PURCHASE REQUEST ITEM
// =====================================================

export interface EmployeePurchaseRequestItem {

  productId?: number;

  productName?: string;

  quantity?: number;

  itemTotalPrice?: number;

  supplierId?: number;

  supplierName?: string;
}


// =====================================================
// PURCHASE REQUEST
// =====================================================

export interface EmployeePurchaseRequest {

  purchaseRequestId: number;

  userId: number;

  totalPrice: number;

  remarks?: string;

  adminRemarks?: string;

  status: string;

  // Delivery tracking status
  deliveryStatus?: string;

  currentApprovalLevel?: number;

  requestDate?: string;

  approvedDate?: string;

  items?: EmployeePurchaseRequestItem[];
}


// =====================================================
// DASHBOARD SUMMARY
// =====================================================

export interface EmployeeDashboardSummary {

  totalRequests: number;

  pendingRequests: number;

  approvedRequests: number;

  rejectedRequests: number;

  completedRequests: number;

  pendingPayments: number;

  totalProcurementAmount: number;

  pendingProcurementAmount: number;

  approvedProcurementAmount: number;

  recentRequests: EmployeePurchaseRequest[];
}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class EmployeeDashboardService {


  // =====================================================
  // API URL
  // =====================================================

  private readonly apiUrl =
    'http://localhost:8080/purchase-requests';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // GET ALL PURCHASE REQUESTS
  // =====================================================
  //
  // The existing backend endpoint allows authenticated
  // employees to access purchase requests.
  //
  // We filter them by the logged-in user's ID on the
  // frontend for the dashboard.
  //
  // =====================================================

  getAllPurchaseRequests():
    Observable<EmployeePurchaseRequest[]> {

    return this.http.get<EmployeePurchaseRequest[]>(
      this.apiUrl
    );
  }


  // =====================================================
  // GET MY PURCHASE REQUESTS
  // =====================================================

  getMyPurchaseRequests(
    userId: number
  ): Observable<EmployeePurchaseRequest[]> {

    return this.getAllPurchaseRequests()
      .pipe(

        map(
          (requests) =>
            requests.filter(
              request =>
                Number(request.userId) ===
                Number(userId)
            )
        )

      );
  }


  // =====================================================
  // GET DASHBOARD SUMMARY
  // =====================================================

  getDashboardSummary(
    userId: number
  ): Observable<EmployeeDashboardSummary> {

    return this.getMyPurchaseRequests(userId)
      .pipe(

        map(
          requests =>
            this.calculateSummary(requests)
        )

      );
  }


  // =====================================================
  // CALCULATE SUMMARY
  // =====================================================

  private calculateSummary(
    requests: EmployeePurchaseRequest[]
  ): EmployeeDashboardSummary {


    // -------------------------------------------------
    // TOTAL
    // -------------------------------------------------

    const totalRequests =
      requests.length;


    // -------------------------------------------------
    // PENDING
    // -------------------------------------------------

    const pendingRequests =
      requests.filter(
        request =>
          this.normalizeStatus(
            request.status
          ) === 'PENDING'
      );


    // -------------------------------------------------
    // APPROVED
    // -------------------------------------------------

    const approvedRequests =
      requests.filter(
        request =>
          this.normalizeStatus(
            request.status
          ) === 'APPROVED'
      );


    // -------------------------------------------------
    // REJECTED
    // -------------------------------------------------

    const rejectedRequests =
      requests.filter(
        request =>
          this.normalizeStatus(
            request.status
          ) === 'REJECTED'
      );


    // -------------------------------------------------
    // COMPLETED
    // -------------------------------------------------
    //
    // Your current PurchaseRequestStatus enum contains
    // PENDING, APPROVED, REJECTED and CANCELLED.
    //
    // Therefore APPROVED requests are currently treated
    // as completed from the purchase-request perspective.
    //
    // Actual delivery tracking will be connected later
    // when the Tracking module is implemented.
    //
    // -------------------------------------------------

    const completedRequests =
      approvedRequests.length;


    // -------------------------------------------------
    // TOTAL PROCUREMENT VALUE
    // -------------------------------------------------

    const totalProcurementAmount =
      requests.reduce(
        (
          total,
          request
        ) =>
          total +
          this.toNumber(
            request.totalPrice
          ),
        0
      );


    // -------------------------------------------------
    // PENDING PROCUREMENT VALUE
    // -------------------------------------------------

    const pendingProcurementAmount =
      pendingRequests.reduce(
        (
          total,
          request
        ) =>
          total +
          this.toNumber(
            request.totalPrice
          ),
        0
      );


    // -------------------------------------------------
    // APPROVED PROCUREMENT VALUE
    // -------------------------------------------------

    const approvedProcurementAmount =
      approvedRequests.reduce(
        (
          total,
          request
        ) =>
          total +
          this.toNumber(
            request.totalPrice
          ),
        0
      );


    // -------------------------------------------------
    // RECENT REQUESTS
    // -------------------------------------------------

    const recentRequests =
      [...requests]
        .sort(
          (
            first,
            second
          ) =>
            this.getTime(
              second.requestDate
            ) -
            this.getTime(
              first.requestDate
            )
        )
        .slice(0, 5);


    // -------------------------------------------------
    // PENDING PAYMENTS
    // -------------------------------------------------
    //
    // The Account/payment module is separate from the
    // purchase-request endpoint.
    //
    // For now, approved requests are not automatically
    // counted as pending payments here because that would
    // incorrectly assume every approved request has an
    // unpaid account.
    //
    // This will be connected to the Accounts API in the
    // next dashboard integration.
    //
    // -------------------------------------------------

    const pendingPayments = 0;


    // -------------------------------------------------
    // RETURN SUMMARY
    // -------------------------------------------------

    return {

      totalRequests,

      pendingRequests:
      pendingRequests.length,

      approvedRequests:
      approvedRequests.length,

      rejectedRequests:
      rejectedRequests.length,

      completedRequests,

      pendingPayments,

      totalProcurementAmount,

      pendingProcurementAmount,

      approvedProcurementAmount,

      recentRequests

    };
  }


  // =====================================================
  // NORMALIZE STATUS
  // =====================================================

  private normalizeStatus(
    status: string | null | undefined
  ): string {

    if (!status) {

      return '';
    }


    return status
      .trim()
      .toUpperCase();
  }


  // =====================================================
  // SAFE NUMBER
  // =====================================================

  private toNumber(
    value: number | null | undefined
  ): number {

    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {

      return 0;
    }


    return Number(value);
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
  // FORMAT CURRENCY
  // =====================================================

  formatCurrency(
    amount: number
  ): string {

    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
      }
    ).format(
      this.toNumber(amount)
    );
  }


  // =====================================================
  // GET STATUS LABEL
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
  // GET STATUS CLASS
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
  // DOWNLOAD MY PURCHASE REQUESTS
  // =====================================================
  //
  // These endpoints are secured by the backend.
  // The backend identifies the currently logged-in
  // employee from the authenticated session/token.
  //
  // PDF  -> GET /purchase-requests/download/pdf
  // Excel -> GET /purchase-requests/download/xlsx
  // CSV  -> GET /purchase-requests/download
  //
  // =====================================================

  downloadMyPurchaseRequestsPdf(): Observable<Blob> {

    return this.http.get(
      `${this.apiUrl}/download/pdf`,
      {
        responseType: 'blob'
      }
    );
  }


  downloadMyPurchaseRequestsExcel(): Observable<Blob> {

    return this.http.get(
      `${this.apiUrl}/download/xlsx`,
      {
        responseType: 'blob'
      }
    );
  }


  downloadMyPurchaseRequestsCsv(): Observable<Blob> {

    return this.http.get(
      `${this.apiUrl}/download`,
{
  responseType: 'blob'
}
);
}


}
