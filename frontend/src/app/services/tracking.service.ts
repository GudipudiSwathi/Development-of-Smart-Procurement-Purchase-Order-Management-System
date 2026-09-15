import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


// =====================================================
// TRACKING MODEL
// =====================================================

export interface Tracking {

  trackingId?: number;

  purchaseRequestId: number;

  status: string;

  updatedDate?: string;

  remarks?: string;
}


// =====================================================
// TRACKING SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class TrackingService {


  // =====================================================
  // API URL
  // =====================================================

  private readonly apiUrl =
    'http://localhost:8080/tracking';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // GET TRACKING
  // =====================================================

  getTracking(
    purchaseRequestId: number
  ): Observable<Tracking> {

    return this.http.get<Tracking>(
      `${this.apiUrl}/${purchaseRequestId}`
    );

  }


  // =====================================================
  // CREATE TRACKING
  // =====================================================

  createTracking(
    purchaseRequestId: number
  ): Observable<Tracking> {

    return this.http.post<Tracking>(
      `${this.apiUrl}/${purchaseRequestId}`,
      {}
    );

  }


  // =====================================================
  // UPDATE TRACKING STATUS
  // =====================================================

  updateTrackingStatus(
    purchaseRequestId: number,
    status: string,
    remarks?: string
  ): Observable<Tracking> {

    let params =
      new HttpParams()
        .set('status', status);


    if (
      remarks !== undefined &&
      remarks !== null &&
      remarks.trim().length > 0
    ) {

      params =
        params.set(
          'remarks',
          remarks.trim()
        );

    }


    return this.http.put<Tracking>(
      `${this.apiUrl}/${purchaseRequestId}/status`,
      {},
      { params }
    );

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

      case 'REQUEST_RECEIVED':
        return 'Request Received';

      case 'ORDER_CONFIRMED':
        return 'Order Confirmed';

      case 'SHIPPED':
        return 'Shipped';

      case 'IN_TRANSIT':
        return 'In Transit';

      case 'ORDERS_PICKED':
        return 'Orders Picked';

      case 'SUCCESSFUL':
        return 'Successful';

      default:
        return status || 'Unknown';

    }

  }


  // =====================================================
  // STATUS CSS CLASS
  // =====================================================

  getStatusClass(
    status: string | null | undefined
  ): string {

    const normalized =
      this.normalizeStatus(status);


    switch (normalized) {

      case 'REQUEST_RECEIVED':
        return 'status-request-received';

      case 'ORDER_CONFIRMED':
        return 'status-order-confirmed';

      case 'SHIPPED':
        return 'status-shipped';

      case 'IN_TRANSIT':
        return 'status-in-transit';

      case 'ORDERS_PICKED':
        return 'status-orders-picked';

      case 'SUCCESSFUL':
        return 'status-successful';

      default:
        return 'status-unknown';

    }

  }


  // =====================================================
  // NORMALIZE STATUS
  // =====================================================

  private normalizeStatus(
    status: string | null | undefined
  ): string {

    return (status || '')
      .trim()
      .toUpperCase();

  }


  // =====================================================
  // STATUS INDEX
  // =====================================================

  getStatusIndex(
    status: string | null | undefined
  ): number {

    const normalized =
      this.normalizeStatus(status);


    const statuses: string[] = [

      'REQUEST_RECEIVED',

      'ORDER_CONFIRMED',

      'SHIPPED',

      'IN_TRANSIT',

      'ORDERS_PICKED',

      'SUCCESSFUL'

    ];


    return statuses.indexOf(
      normalized
    );

  }


  // =====================================================
  // CHECK CURRENT STAGE
  // =====================================================

  isCurrentStage(
    currentStatus: string | null | undefined,
    stage: string
  ): boolean {

    return this.normalizeStatus(
      currentStatus
    ) === this.normalizeStatus(
      stage
    );

  }


  // =====================================================
  // CHECK COMPLETED STAGE
  // =====================================================

  isStageCompleted(
    currentStatus: string | null | undefined,
    stage: string
  ): boolean {

    const currentIndex =
      this.getStatusIndex(
        currentStatus
      );


    const stageIndex =
      this.getStatusIndex(
        stage
      );


    if (
      currentIndex === -1 ||
      stageIndex === -1
    ) {

      return false;

    }


    return stageIndex <= currentIndex;

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    date: string | null | undefined
  ): string {

    if (!date) {
      return 'Not available';
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


    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(parsedDate);

  }

}
