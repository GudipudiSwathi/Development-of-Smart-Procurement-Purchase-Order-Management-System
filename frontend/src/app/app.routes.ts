import { Routes } from '@angular/router';

import { Landing } from './pages/landing/landing';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';

import { EmployeeDashboard } from './pages/employee-dashboard/employee-dashboard';
import { PurchaseRequestPage } from './pages/purchase-request/purchase-request';
import { PurchaseRequestDetailsPage } from './pages/purchase-request-details/purchase-request-details';

import { EmployeeProfileComponent } from './pages/employee-profile/employee-profile';
import { TrackingComponent } from './pages/tracking/tracking';
import { Payments } from './pages/payments/payments';

import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { AdminUsers } from './pages/admin-users/admin-users';
import { AdminDepartments } from './pages/admin-departments/admin-departments';
import { AdminCategories } from './pages/admin-categories/admin-categories';
import { AdminProducts } from './pages/admin-products/admin-products';
import { AdminSuppliers } from './pages/admin-suppliers/admin-suppliers';
import { AdminPurchaseRequests } from './pages/admin-purchase-requests/admin-purchase-requests';
import { AdminAccounts } from './pages/admin-accounts/admin-accounts';
import { AdminApprovals } from './pages/admin-approvals/admin-approvals';
import { AdminReports } from './pages/admin-reports/admin-reports';
import { AdminSettings } from './pages/admin-settings/admin-settings';

import { authGuard } from './guards/auth-guard';


export const routes: Routes = [

  // ==========================================
  // LANDING PAGE
  // ==========================================

  {
    path: '',
    component: Landing,
    title: 'Enterprise Procurement System'
  },


  // ==========================================
  // AUTH
  // ==========================================

  {
    path: 'register',
    component: Register,
    title: 'Register - Enterprise Procurement System'
  },

  {
    path: 'login',
    component: Login,
    title: 'Login - Enterprise Procurement System'
  },


  // ==========================================
  // EMPLOYEE DASHBOARD
  // ==========================================

  {
    path: 'dashboard',
    component: EmployeeDashboard,
    canActivate: [authGuard],
    title: 'Employee Dashboard - Enterprise Procurement System'
  },


  // ==========================================
  // EMPLOYEE PROFILE
  // ==========================================

  {
    path: 'profile',
    component: EmployeeProfileComponent,
    canActivate: [authGuard],
    title: 'My Profile - Enterprise Procurement System'
  },


  // ==========================================
  // EMPLOYEE PURCHASE REQUESTS
  // ==========================================

  {
    path: 'purchase-requests',
    component: PurchaseRequestPage,
    canActivate: [authGuard],
    title: 'Purchase Requests - Enterprise Procurement System'
  },


  // ==========================================
  // PURCHASE REQUEST DETAILS
  // ==========================================

  {
    path: 'purchase-request-details/:id',
    component: PurchaseRequestDetailsPage,
    canActivate: [authGuard],
    title: 'Purchase Request Details - Enterprise Procurement System'
  },


  // ==========================================
  // EMPLOYEE TRACKING
  // ==========================================

  {
    path: 'tracking',
    component: TrackingComponent,
    canActivate: [authGuard],
    title: 'Order Tracking - Enterprise Procurement System'
  },

  {
    path: 'tracking/:purchaseRequestId',
    component: TrackingComponent,
    canActivate: [authGuard],
    title: 'Order Tracking - Enterprise Procurement System'
  },


  // ==========================================
  // EMPLOYEE PAYMENTS
  // ==========================================

  {
    path: 'payments',
    component: Payments,
    canActivate: [authGuard],
    title: 'My Payments - Enterprise Procurement System'
  },


  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================

  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [authGuard],
    title: 'Admin Dashboard - Enterprise Procurement System'
  },


  // ==========================================
  // ADMIN USERS
  // ==========================================

  {
    path: 'admin/users',
    component: AdminUsers,
    canActivate: [authGuard],
    title: 'Users - Enterprise Procurement System'
  },


  // ==========================================
  // ADMIN DEPARTMENTS
  // ==========================================

  {
    path: 'admin/departments',
    component: AdminDepartments,
    canActivate: [authGuard],
    title: 'Departments - Enterprise Procurement System'
  },


  // ==========================================
  // ADMIN CATEGORIES
  // ==========================================

  {
    path: 'admin/categories',
    component: AdminCategories,
    canActivate: [authGuard],
    title: 'Categories - Enterprise Procurement System'
  },


  // ==========================================
  // ADMIN PRODUCTS
  // ==========================================

  {
    path: 'admin/products',
    component: AdminProducts,
    canActivate: [authGuard],
    title: 'Products - Enterprise Procurement System'
  },


  // ==========================================
  // ADMIN SUPPLIERS
  // ==========================================

  {
    path: 'admin/suppliers',
    component: AdminSuppliers,
    canActivate: [authGuard],
    title: 'Suppliers - Enterprise Procurement System'
  },


  // ==========================================
  // ADMIN PURCHASE REQUESTS
  // ==========================================

  {
    path: 'admin/purchase-requests',
    component: AdminPurchaseRequests,
    canActivate: [authGuard],
    title: 'Purchase Requests - Enterprise Procurement System'
  },


  // ==========================================
  // ADMIN ACCOUNTS
  // ==========================================

  {
    path: 'admin/accounts',
    component: AdminAccounts,
    canActivate: [authGuard],
    title: 'Accounts - Enterprise Procurement System'
  },


  // ==========================================
  // ADMIN APPROVALS
  // ==========================================

  {
    path: 'admin/approvals',
    component: AdminApprovals,
    canActivate: [authGuard],
    title: 'Approvals - Enterprise Procurement System'
  },


  // ==========================================
  // ADMIN REPORTS
  // ==========================================

  {
    path: 'admin/reports',
    component: AdminReports,
    canActivate: [authGuard],
    title: 'Reports - Enterprise Procurement System'
  },


  // ==========================================
  // ADMIN SETTINGS
  // ==========================================

  {
    path: 'admin/settings',
    component: AdminSettings,
    canActivate: [authGuard],
    title: 'Settings - Enterprise Procurement System'
  },

  {
    path: 'supplier-dashboard',
    loadComponent: () =>
      import('./pages/supplier-dashboard/supplier-dashboard')
        .then(m => m.SupplierDashboard)
  }

];
