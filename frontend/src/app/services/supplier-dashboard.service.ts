import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SupplierPurchaseRequestItem {
  productId: number;
  productName: string;
  quantity: number;
  itemTotalPrice: number;
}

export interface SupplierPurchaseRequest {
  purchaseRequestId: number;
  requesterUserId?: number;
  requesterUsername?: string;
  status: string;
  deliveryStatus?: string;
  remarks?: string;
  adminRemarks?: string;
  requestDate?: string;
  approvedDate?: string;
  supplierAmount: number;
  paymentStatus: string;
  paymentReference?: string;
  items: SupplierPurchaseRequestItem[];
}

export interface SupplierDashboardSummary {
  pendingRequests: number;
  completedRequests: number;
  successfulPayments: number;
  totalAmountPaid: number;
}

@Injectable({
  providedIn: 'root'
})
export class SupplierDashboardService {
  private readonly apiUrl = 'http://localhost:8080/supplier-dashboard';
  private readonly purchaseRequestApiUrl = 'http://localhost:8080/purchase-requests';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<SupplierDashboardSummary> {
    return this.http.get<SupplierDashboardSummary>(`${this.apiUrl}/summary`);
  }

  getPendingRequests(): Observable<SupplierPurchaseRequest[]> {
    return this.http.get<SupplierPurchaseRequest[]>(`${this.apiUrl}/pending`);
  }

  getCompletedRequests(): Observable<SupplierPurchaseRequest[]> {
    return this.http.get<SupplierPurchaseRequest[]>(`${this.apiUrl}/completed`);
  }

  getPaymentHistory(): Observable<SupplierPurchaseRequest[]> {
    return this.http.get<SupplierPurchaseRequest[]>(`${this.apiUrl}/payments`);
  }

  updateDeliveryStatus(
    requestId: number,
    deliveryStatus: string
  ): Observable<SupplierPurchaseRequest> {
    return this.http.put<SupplierPurchaseRequest>(
      `${this.purchaseRequestApiUrl}/${requestId}/delivery-status`,
      { deliveryStatus }
    );
  }
}
