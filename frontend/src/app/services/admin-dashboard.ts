import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminDashboardStats {

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

  totalProcurementAmount: number;
}


@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  private dashboardUrl =
    'http://localhost:8080/admin/dashboard/stats';


  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // GET ADMIN DASHBOARD STATISTICS
  // ==========================================

  getDashboardStats():
    Observable<AdminDashboardStats> {

    console.log(
      'CALLING ADMIN DASHBOARD API'
    );

    console.log(
      'URL:',
      this.dashboardUrl
    );


    return this.http.get<AdminDashboardStats>(
      this.dashboardUrl
    );

  }

}
