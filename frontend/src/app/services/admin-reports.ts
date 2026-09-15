import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/* =========================================================
   USER REPORT
   ========================================================= */

export interface ReportUser {
  userId: number;
  username: string;
  email: string;
  phoneNumber: string;
  designation: string;
  role: string;

  departmentId?: number;
  departmentName?: string;

  purchaseRequestCount: number;
  totalProcurementAmount: number;
}

/* =========================================================
   DEPARTMENT REPORT
   ========================================================= */

export interface ReportDepartment {
  departmentId: number;
  departmentName: string;

  description?: string;

  employeeCount: number;
  purchaseRequestCount: number;

  pendingRequestCount: number;
  approvedRequestCount: number;
  rejectedRequestCount: number;

  totalProcurementAmount: number;
}

/* =========================================================
   CATEGORY REPORT
   ========================================================= */

export interface ReportCategory {
  categoryId: number;
  categoryName: string;

  description?: string;

  productCount: number;
  supplierCount: number;

  purchaseRequestCount: number;

  totalProcurementAmount: number;
}

/* =========================================================
   PRODUCT REPORT
   ========================================================= */

export interface ReportProduct {
  productId: number;

  productName: string;

  description?: string;

  price: number;

  stockQuantity: number;

  status?: string;

  categoryId?: number;
  categoryName?: string;

  purchaseRequestCount: number;

  totalQuantityRequested: number;

  totalProcurementAmount: number;
}

/* =========================================================
   PURCHASE REQUEST ITEM
   ========================================================= */

export interface ReportPurchaseRequestItem {

  productId?: number;

  productName?: string;

  supplierId?: number;

  supplierName?: string;

  quantity?: number;

  price?: number;

  totalPrice?: number;

  itemTotalPrice?: number;
}

/* =========================================================
   SUPPLIER REPORT
   ========================================================= */

export interface ReportSupplier {

  supplierId: number;

  supplierName: string;

  phoneNumber: string;

  email: string;

  address: string;

  gstNumber: string;

  rating?: number;

  feedback?: string;

  status?: string;

  categoryId?: number;

  categoryName?: string;

  purchaseRequestCount: number;

  totalProcurementAmount: number;
}

/* =========================================================
   PURCHASE REQUEST REPORT
   ========================================================= */

export interface ReportPurchaseRequest {

  purchaseRequestId: number;

  userId?: number;

  username?: string;

  departmentId?: number;

  departmentName?: string;

  totalPrice: number;

  remarks?: string;

  adminRemarks?: string;

  status?: string;

  currentApprovalLevel?: number;

  requestDate?: string;

  approvedDate?: string;

  itemCount: number;

  totalQuantity: number;

  approvalStatus?: string;

  items?: ReportPurchaseRequestItem[];
}

/* =========================================================
   ACCOUNT / PAYMENT REPORT
   ========================================================= */

export interface ReportAccount {

  accountId: number;

  purchaseRequestId?: number;

  userId?: number;

  username?: string;

  departmentName?: string;

  amount: number;

  paymentStatus?: string;

  paymentDate?: string;

  paymentReference?: string;
}

/* =========================================================
   COMPLETE REPORT
   ========================================================= */

export interface ReportDTO {

  totalUsers: number;

  totalEmployees: number;

  totalAdmins: number;

  totalDepartments: number;

  totalCategories: number;

  totalProducts: number;

  totalSuppliers: number;

  totalPurchaseRequests: number;

  pendingRequests: number;

  approvedRequests: number;

  rejectedRequests: number;

  cancelledRequests: number;

  totalProcurementAmount: number;

  totalPendingAmount: number;

  totalApprovedAmount: number;

  totalPaidAmount: number;

  successfulPayments: number;

  failedPayments: number;

  users: ReportUser[];

  departments: ReportDepartment[];

  categories: ReportCategory[];

  products: ReportProduct[];

  suppliers: ReportSupplier[];

  purchaseRequests: ReportPurchaseRequest[];

  accounts: ReportAccount[];
}

/* =========================================================
   SERVICE
   ========================================================= */

@Injectable({
  providedIn: 'root'
})
export class AdminReportsService {

  private readonly apiUrl =
    'http://localhost:8080/reports';

  constructor(
    private http: HttpClient
  ) {}

  /* =========================================================
     COMPLETE REPORT
     ========================================================= */

  getReport(): Observable<ReportDTO> {

    return this.http.get<ReportDTO>(
      this.apiUrl
    );
  }

  /* =========================================================
     OVERVIEW
     ========================================================= */

  getOverview(): Observable<ReportDTO> {

    return this.http.get<ReportDTO>(
      `${this.apiUrl}/overview`
    );
  }

  /* =========================================================
     USERS
     ========================================================= */

  getUsers(): Observable<ReportUser[]> {

    return this.http.get<ReportUser[]>(
      `${this.apiUrl}/users`
    );
  }

  getUserReports(): Observable<ReportUser[]> {

    return this.getUsers();
  }

  /* =========================================================
     DEPARTMENTS
     ========================================================= */

  getDepartments(): Observable<ReportDepartment[]> {

    return this.http.get<ReportDepartment[]>(
      `${this.apiUrl}/departments`
    );
  }

  getDepartmentReports(): Observable<ReportDepartment[]> {

    return this.getDepartments();
  }

  /* =========================================================
     CATEGORIES
     ========================================================= */

  getCategories(): Observable<ReportCategory[]> {

    return this.http.get<ReportCategory[]>(
      `${this.apiUrl}/categories`
    );
  }

  getCategoryReports(): Observable<ReportCategory[]> {

    return this.getCategories();
  }

  /* =========================================================
     PRODUCTS
     ========================================================= */

  getProducts(): Observable<ReportProduct[]> {

    return this.http.get<ReportProduct[]>(
      `${this.apiUrl}/products`
    );
  }

  getProductReports(): Observable<ReportProduct[]> {

    return this.getProducts();
  }

  /* =========================================================
     SUPPLIERS
     ========================================================= */

  getSuppliers(): Observable<ReportSupplier[]> {

    return this.http.get<ReportSupplier[]>(
      `${this.apiUrl}/suppliers`
    );
  }

  getSupplierReports(): Observable<ReportSupplier[]> {

    return this.getSuppliers();
  }

  /* =========================================================
     PURCHASE REQUESTS
     ========================================================= */

  getPurchaseRequests():
    Observable<ReportPurchaseRequest[]> {

    return this.http.get<ReportPurchaseRequest[]>(
      `${this.apiUrl}/purchase-requests`
    );
  }

  getPurchaseRequestReports():
    Observable<ReportPurchaseRequest[]> {

    return this.getPurchaseRequests();
  }

  /* =========================================================
     ACCOUNTS / PAYMENTS
     ========================================================= */

  getAccounts(): Observable<ReportAccount[]> {

    return this.http.get<ReportAccount[]>(
      `${this.apiUrl}/payments`
    );
  }

  getPaymentReports(): Observable<ReportAccount[]> {

    return this.getAccounts();
  }

  /* =========================================================
     CSV EXPORT
     ========================================================= */

  exportReport(): Observable<Blob> {

    return this.http.get(
      `${this.apiUrl}/export`,
      {
        responseType: 'blob'
      }
    );
  }
}
