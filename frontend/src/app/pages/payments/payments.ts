import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient
} from '@angular/common/http';

import {
  Router
} from '@angular/router';

import {
  EmployeeDashboardService,
  EmployeePurchaseRequest
} from '../../services/employee-dashboard';


// =====================================================
// PAYMENT ACCOUNT INTERFACE
// =====================================================

interface PaymentAccount {

  accountId: number;

  purchaseRequestId: number;

  userId: number;

  amount: number;

  paymentStatus: string;

  paymentDate?: string | null;

  paymentReference?: string | null;

}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector: 'app-payments',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './payments.html',

  styleUrl: './payments.css'

})


export class Payments implements OnInit {


  // =====================================================
  // USER
  // =====================================================

  userId: number =
    Number(localStorage.getItem('userId')) || 0;

  username: string =
    localStorage.getItem('username') || 'Employee';


  // =====================================================
  // DATA
  // =====================================================

  payments: PaymentAccount[] = [];

  filteredPayments: PaymentAccount[] = [];

  purchaseRequests: EmployeePurchaseRequest[] = [];


  // =====================================================
  // UI STATE
  // =====================================================

  isLoading = true;

  isRefreshing = false;

  errorMessage = '';

  selectedStatus = 'ALL';

  searchTerm = '';


  // =====================================================
  // STATISTICS
  // =====================================================

  totalPayments = 0;

  pendingPayments = 0;

  successfulPayments = 0;

  failedPayments = 0;

  totalAmount = 0;

  pendingAmount = 0;

  successfulAmount = 0;


  // =====================================================
  // API
  // =====================================================

  /*
   * IMPORTANT:
   *
   * /accounts/my is the employee-only endpoint.
   *
   * The backend identifies the logged-in employee
   * from the authentication/JWT and returns only
   * that employee's payment accounts.
   */

  private readonly accountsApiUrl =
    'http://localhost:8080/accounts/my';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient,

    private employeeDashboardService:
    EmployeeDashboardService,

    private router: Router,

    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.loadPayments();

  }


  // =====================================================
  // LOAD PAYMENTS
  // =====================================================

  loadPayments(): void {

    this.isLoading = true;

    this.isRefreshing = false;

    this.errorMessage = '';


    this.http
      .get<PaymentAccount[]>(
        this.accountsApiUrl
      )
      .subscribe({

        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        next: (accounts) => {

          /*
           * The backend already filters the records
           * according to the logged-in employee.
           *
           * Therefore, DO NOT filter using localStorage
           * userId on the frontend.
           */

          this.payments =
            Array.isArray(accounts)
              ? accounts
              : [];


          // Update statistics

          this.calculateStatistics();


          // Apply search/status filters

          this.applyFilters();


          this.isLoading = false;

          this.isRefreshing = false;


          this.cdr.detectChanges();

        },


        // -------------------------------------------------
        // ERROR
        // -------------------------------------------------

        error: (error) => {

          console.error(
            'Failed to load payment information:',
            error
          );


          this.isLoading = false;

          this.isRefreshing = false;


          // Unauthorized

          if (error.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          }


          // Forbidden

          else if (error.status === 403) {

            this.errorMessage =
              'You do not have permission to view payment information.';

          }


          // Other errors

          else {

            this.errorMessage =
              'Unable to load payment information. Please try again.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refreshPayments(): void {

    this.isRefreshing = true;

    this.loadPayments();

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  calculateStatistics(): void {

    // Total number of payments/accounts

    this.totalPayments =
      this.payments.length;


    // Pending payments

    this.pendingPayments =
      this.payments.filter(
        payment =>
          this.normalizeStatus(
            payment.paymentStatus
          ) === 'PENDING'
      ).length;


    // Successful payments

    this.successfulPayments =
      this.payments.filter(
        payment =>
          this.normalizeStatus(
            payment.paymentStatus
          ) === 'SUCCESS'
      ).length;


    // Failed payments

    this.failedPayments =
      this.payments.filter(
        payment =>
          this.normalizeStatus(
            payment.paymentStatus
          ) === 'FAILED'
      ).length;


    // Total amount

    this.totalAmount =
      this.payments.reduce(
        (total, payment) =>
          total +
          this.toNumber(payment.amount),
        0
      );


    // Pending amount

    this.pendingAmount =
      this.payments

        .filter(
          payment =>
            this.normalizeStatus(
              payment.paymentStatus
            ) === 'PENDING'
        )

        .reduce(
          (total, payment) =>
            total +
            this.toNumber(payment.amount),
          0
        );


    // Successful amount

    this.successfulAmount =
      this.payments

        .filter(
          payment =>
            this.normalizeStatus(
              payment.paymentStatus
            ) === 'SUCCESS'
        )

        .reduce(
          (total, payment) =>
            total +
            this.toNumber(payment.amount),
          0
        );

  }


  // =====================================================
  // SEARCH
  // =====================================================

  onSearch(): void {

    this.applyFilters();

  }


  // =====================================================
  // STATUS FILTER
  // =====================================================

  onStatusChange(): void {

    this.applyFilters();

  }


  // =====================================================
  // APPLY FILTERS
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredPayments =
      this.payments.filter(
        payment => {

          const status =
            this.normalizeStatus(
              payment.paymentStatus
            );


          // Status filter

          const matchesStatus =
            this.selectedStatus === 'ALL' ||
            status === this.selectedStatus;


          // Search filter

          const matchesSearch =
            !search ||

            String(payment.accountId)
              .toLowerCase()
              .includes(search) ||

            String(payment.purchaseRequestId)
              .toLowerCase()
              .includes(search) ||

            String(payment.paymentReference || '')
              .toLowerCase()
              .includes(search) ||

            status
              .toLowerCase()
              .includes(search);


          return (
            matchesStatus &&
            matchesSearch
          );

        }
      );

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedStatus = 'ALL';

    this.applyFilters();

  }


  // =====================================================
  // STATUS NORMALIZATION
  // =====================================================

  normalizeStatus(
    status: string | null | undefined
  ): string {

    if (!status) {

      return '';

    }


    return status
      .trim()
      .toUpperCase();

  }


  // =====================================================
  // STATUS LABEL
  // =====================================================

  getStatusLabel(
    status: string | null | undefined
  ): string {

    switch (
      this.normalizeStatus(status)
      ) {

      case 'PENDING':

        return 'Pending';


      case 'SUCCESS':

        return 'Paid';


      case 'FAILED':

        return 'Payment Failed';


      default:

        return status || 'Unknown';

    }

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: string | null | undefined
  ): string {

    switch (
      this.normalizeStatus(status)
      ) {

      case 'PENDING':

        return 'pending';


      case 'SUCCESS':

        return 'success';


      case 'FAILED':

        return 'failed';


      default:

        return 'unknown';

    }

  }


  // =====================================================
  // CURRENCY
  // =====================================================

  formatCurrency(
    amount: number | null | undefined
  ): string {

    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
      }
    ).format(
      this.toNumber(amount)
    );

  }


  // =====================================================
  // DATE
  // =====================================================

  formatDate(
    value: string | null | undefined
  ): string {

    if (!value) {

      return 'Not paid';

    }


    const date =
      new Date(value);


    if (Number.isNaN(date.getTime())) {

      return 'Not available';

    }


    return new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(date);

  }


  // =====================================================
  // DATE + TIME
  // =====================================================

  formatDateTime(
    value: string | null | undefined
  ): string {

    if (!value) {

      return 'Not available';

    }


    const date =
      new Date(value);


    if (Number.isNaN(date.getTime())) {

      return 'Not available';

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
    ).format(date);

  }


  // =====================================================
  // NUMBER
  // =====================================================

  private toNumber(
    value: number | null | undefined
  ): number {

    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {

      return 0;

    }


    return Number(value);

  }


  // =====================================================
  // NAVIGATION
  // =====================================================

  goToDashboard(): void {

    this.router.navigate(
      ['/employee-dashboard']
    );

  }


  goToPurchaseRequests(): void {

    this.router.navigate(
      ['/purchase-requests']
    );

  }


  goToTracking(): void {

    this.router.navigate(
      ['/tracking']
    );

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    localStorage.removeItem('token');

    localStorage.removeItem('userId');

    localStorage.removeItem('username');

    localStorage.removeItem('role');


    this.router.navigate(
      ['/login']
    );

  }


  // =====================================================
  // TRACK BY
  // =====================================================

  trackByAccountId(
    index: number,
    account: PaymentAccount
  ): number {

    return account.accountId;

  }

}
