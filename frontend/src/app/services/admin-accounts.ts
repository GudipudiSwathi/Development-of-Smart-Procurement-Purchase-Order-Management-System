import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Account {
  accountId?: number;
  purchaseRequestId: number;
  userId: number;
  amount: number;
  paymentStatus?: string;
  paymentDate?: string | null;
  paymentReference?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAccountsService {

  private readonly apiUrl = 'http://localhost:8080/accounts';

  constructor(private http: HttpClient) {}

  // =====================================================
  // GET ALL ACCOUNTS
  // ADMIN ONLY
  // =====================================================

  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(this.apiUrl);
  }

  // =====================================================
  // GET ACCOUNT BY ID
  // =====================================================

  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(
      `${this.apiUrl}/${id}`
    );
  }

  // =====================================================
  // GET ACCOUNT BY PURCHASE REQUEST
  // =====================================================

  getAccountByPurchaseRequest(
    purchaseRequestId: number
  ): Observable<Account> {
    return this.http.get<Account>(
      `${this.apiUrl}/purchase-request/${purchaseRequestId}`
    );
  }

  // =====================================================
  // MAKE PAYMENT
  // ADMIN ONLY
  // =====================================================

  makePayment(
    accountId: number,
    paymentReference: string
  ): Observable<Account> {

    return this.http.post<Account>(
      `${this.apiUrl}/payment`,
      {
        accountId,
        paymentReference
      }
    );
  }

  // =====================================================
  // MARK PAYMENT FAILED
  // ADMIN ONLY
  // =====================================================

  markPaymentFailed(
    accountId: number,
    paymentReference: string
  ): Observable<Account> {

    const params = new HttpParams()
      .set('paymentReference', paymentReference);

    return this.http.put<Account>(
      `${this.apiUrl}/${accountId}/payment-failed`,
      null,
      { params }
    );
  }
}
