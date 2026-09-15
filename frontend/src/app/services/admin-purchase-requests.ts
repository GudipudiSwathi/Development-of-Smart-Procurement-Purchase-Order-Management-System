import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


// =========================================================
// PURCHASE REQUEST ITEM
// =========================================================

export interface PurchaseRequestItem {

  productId: number;

  quantity: number;

  itemTotalPrice?: number | null;

  supplierId?: number | null;

  // Display-only fields populated by the frontend
  productName?: string;

  productPrice?: number | null;

  supplierName?: string;
}


// =========================================================
// PURCHASE REQUEST
// =========================================================

export interface PurchaseRequest {

  purchaseRequestId?: number;

  userId: number;

  totalPrice?: number | null;

  remarks?: string | null;

  adminRemarks?: string | null;

  status?: string;

  currentApprovalLevel?: number | null;

  requestDate?: string | null;

  approvedDate?: string | null;

  items: PurchaseRequestItem[];

  // -------------------------------------------------------
  // Display-only user information
  // -------------------------------------------------------

  userName?: string;

  userEmail?: string;

  userPhone?: string;

  departmentId?: number | null;

  departmentName?: string;
}


// =========================================================
// SERVICE
// =========================================================

@Injectable({
  providedIn: 'root'
})
export class AdminPurchaseRequestsService {

  private readonly purchaseRequestApiUrl =
    'http://localhost:8080/purchase-requests';

  private readonly userApiUrl =
    'http://localhost:8080/users';

  private readonly productApiUrl =
    'http://localhost:8080/products';

  private readonly departmentApiUrl =
    'http://localhost:8080/departments';


  constructor(
    private http: HttpClient
  ) {}


  // =======================================================
  // GET ALL PURCHASE REQUESTS
  // =======================================================

  getAllPurchaseRequests():
    Observable<PurchaseRequest[]> {

    return this.http.get<PurchaseRequest[]>(
      this.purchaseRequestApiUrl
    );
  }


  // =======================================================
  // GET PURCHASE REQUEST BY ID
  // =======================================================

  getPurchaseRequestById(
    id: number
  ): Observable<PurchaseRequest> {

    return this.http.get<PurchaseRequest>(
      `${this.purchaseRequestApiUrl}/${id}`
    );
  }


  // =======================================================
  // APPROVE / REJECT PURCHASE REQUEST
  // =======================================================

  updatePurchaseRequestStatus(
    id: number,
    payload: {
      status: 'APPROVED' | 'REJECTED';
      adminRemarks?: string | null;
    }
  ): Observable<PurchaseRequest> {

    return this.http.put<PurchaseRequest>(
      `${this.purchaseRequestApiUrl}/${id}/status`,
      payload
    );
  }


  // =======================================================
  // DELETE PURCHASE REQUEST
  // =======================================================

  deletePurchaseRequest(
    id: number
  ): Observable<string> {

    return this.http.delete(
      `${this.purchaseRequestApiUrl}/${id}`,
      {
        responseType: 'text'
      }
    );
  }


  // =======================================================
  // GET ALL USERS
  // =======================================================

  getAllUsers(): Observable<any[]> {

    return this.http.get<any[]>(
      this.userApiUrl
    );
  }


  // =======================================================
  // GET ALL PRODUCTS
  // =======================================================

  getAllProducts(): Observable<any[]> {

    return this.http.get<any[]>(
      this.productApiUrl
    );
  }


  // =======================================================
  // GET ALL DEPARTMENTS
  // =======================================================

  getAllDepartments(): Observable<any[]> {

    return this.http.get<any[]>(
      this.departmentApiUrl
    );
  }


  // =======================================================
  // DOWNLOAD PURCHASE REQUEST CSV
  //
  // This endpoint downloads the logged-in user's requests.
  // It is not an admin-wide CSV endpoint in the current
  // backend.
  // =======================================================

  downloadMyPurchaseRequests(): Observable<Blob> {

    return this.http.get(
      `${this.purchaseRequestApiUrl}/download`,
      {
        responseType: 'blob'
      }
    );
  }
}
