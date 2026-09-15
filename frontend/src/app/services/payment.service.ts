import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type PaymentMethod = 'QR_CODE' | 'UPI' | 'CREDIT_CARD';
export type PaymentTransactionStatus = 'INITIATED' | 'SUCCESS' | 'FAILED';

export interface PaymentTransaction {
  paymentId: number;
  purchaseRequestId: number;
  accountId: number;
  userId: number;
  supplierId: number;
  supplierName: string;
  supplierUpiId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentTransactionStatus;
  transactionReference?: string;
  qrReference?: string;
  cardLast4?: string;
  paymentDate?: string;
}

export interface PaymentProcessRequest {
  mpin?: string;
  cardHolderName?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  transactionReference?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly apiUrl = 'http://localhost:8080/payments';

  constructor(private http: HttpClient) {}

  initiatePayment(purchaseRequestId: number, supplierId: number, paymentMethod: PaymentMethod): Observable<PaymentTransaction> {
    const params = new HttpParams()
      .set('purchaseRequestId', purchaseRequestId.toString())
      .set('supplierId', supplierId.toString())
      .set('paymentMethod', paymentMethod);

    return this.http.post<PaymentTransaction>(`${this.apiUrl}/initiate`, null, { params });
  }

  processPayment(paymentId: number, request: PaymentProcessRequest): Observable<PaymentTransaction> {
    return this.http.post<PaymentTransaction>(`${this.apiUrl}/process/${paymentId}`, request);
  }

  markPaymentFailed(paymentId: number): Observable<PaymentTransaction> {
    return this.http.put<PaymentTransaction>(`${this.apiUrl}/${paymentId}/failed`, {});
  }

  getPaymentById(paymentId: number): Observable<PaymentTransaction> {
    return this.http.get<PaymentTransaction>(`${this.apiUrl}/${paymentId}`);
  }

  getPaymentsByPurchaseRequest(purchaseRequestId: number): Observable<PaymentTransaction[]> {
    return this.http.get<PaymentTransaction[]>(`${this.apiUrl}/purchase-request/${purchaseRequestId}`);
  }

  getAllPayments(): Observable<PaymentTransaction[]> {
    return this.http.get<PaymentTransaction[]>(this.apiUrl);
  }
}
