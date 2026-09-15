import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  AdminDashboardService,
  AdminDashboardStats
} from '../../services/admin-dashboard';

import { AdminSidebar } from '../../components/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AdminSidebar
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {

  /* =====================================================
     ADMIN INFORMATION
     ===================================================== */

  adminName: string =
    localStorage.getItem('username') || 'Administrator';

  adminRole: string =
    localStorage.getItem('role') || 'ADMIN';


  /* =====================================================
     DASHBOARD DATA
     ===================================================== */

  stats: AdminDashboardStats = {
    totalUsers: 0,
    totalEmployees: 0,
    totalAdmins: 0,
    totalDepartments: 0,
    totalCategories: 0,
    totalProducts: 0,
    totalSuppliers: 0,
    totalPurchaseRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalProcurementAmount: 0
  };


  /* =====================================================
     UI STATE
     ===================================================== */

  isLoading = true;
  errorMessage = '';

  currentDate = new Date();


  /* =====================================================
     CONSTRUCTOR
     ===================================================== */

  constructor(
    private adminDashboardService: AdminDashboardService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  /* =====================================================
     INITIALIZATION
     ===================================================== */

  ngOnInit(): void {

    this.loadAdminInformation();

    this.loadDashboardStats();

  }


  /* =====================================================
     ADMIN INFORMATION
     ===================================================== */

  loadAdminInformation(): void {

    this.adminName =
      localStorage.getItem('username') || 'Administrator';

    this.adminRole =
      localStorage.getItem('role') || 'ADMIN';

  }


  /* =====================================================
     LOAD DASHBOARD STATISTICS
     ===================================================== */

  loadDashboardStats(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.adminDashboardService.getDashboardStats().subscribe({

      next: (data: AdminDashboardStats) => {

        if (data) {

          this.stats = {
            totalUsers: data.totalUsers ?? 0,
            totalEmployees: data.totalEmployees ?? 0,
            totalAdmins: data.totalAdmins ?? 0,
            totalDepartments: data.totalDepartments ?? 0,
            totalCategories: data.totalCategories ?? 0,
            totalProducts: data.totalProducts ?? 0,
            totalSuppliers: data.totalSuppliers ?? 0,
            totalPurchaseRequests: data.totalPurchaseRequests ?? 0,
            pendingRequests: data.pendingRequests ?? 0,
            approvedRequests: data.approvedRequests ?? 0,
            rejectedRequests: data.rejectedRequests ?? 0,
            totalProcurementAmount: data.totalProcurementAmount ?? 0
          };

        }

        this.isLoading = false;

        this.cdr.detectChanges();

      },

      error: (error: any) => {

        console.error(
          'Failed to load dashboard statistics:',
          error
        );

        this.isLoading = false;

        if (error?.status === 401) {

          this.errorMessage =
            'Your session has expired. Please login again.';

        } else if (error?.status === 403) {

          this.errorMessage =
            'You do not have permission to access the admin dashboard.';

        } else {

          this.errorMessage =
            'Unable to load dashboard statistics. Please try again.';

        }

        this.cdr.detectChanges();

      }

    });

  }


  /* =====================================================
     REFRESH DASHBOARD
     ===================================================== */

  refreshDashboard(): void {

    this.loadDashboardStats();

  }


  /* =====================================================
     CURRENCY FORMATTER
     ===================================================== */

  formatCurrency(value: number): string {

    if (value === null || value === undefined) {
      return '₹0.00';
    }

    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    ).format(value);

  }


  /* =====================================================
     LOGOUT
     ===================================================== */

  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    this.router.navigate(['/login']);

  }

}
