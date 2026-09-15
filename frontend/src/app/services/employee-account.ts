import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
export class EmployeeAccountService {

  private readonly apiUrl = 'http://localhost:8080/accounts';

  constructor(private http: HttpClient) {}

  // =====================================================
  // GET MY PAYMENT ACCOUNTS
  // EMPLOYEE ONLY
  // =====================================================
  //
  // The backend determines the logged-in employee from
  // the authentication token/session.
  //
  // No userId is sent from the frontend.
  // =====================================================

  getMyAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(
      `${this.apiUrl}/my`
    );
  }
}
