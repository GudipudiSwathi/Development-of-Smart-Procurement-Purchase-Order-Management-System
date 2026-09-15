import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  AdminReportsService,
  ReportUser,
  ReportDepartment,
  ReportCategory,
  ReportProduct,
  ReportSupplier,
  ReportPurchaseRequest,
  ReportPurchaseRequestItem,
  ReportAccount
} from '../../services/admin-reports';

import { AdminSidebar } from '../../components/admin-sidebar/admin-sidebar';


@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css'
})
export class AdminReports implements OnInit {

  // =========================================================
  // MAKE MATH AVAILABLE TO ANGULAR TEMPLATE
  // =========================================================

  readonly Math = Math;


  // =========================================================
  // RAW DATA
  // =========================================================

  users: ReportUser[] = [];
  departments: ReportDepartment[] = [];
  categories: ReportCategory[] = [];
  products: ReportProduct[] = [];
  suppliers: ReportSupplier[] = [];
  purchaseRequests: ReportPurchaseRequest[] = [];
  accounts: ReportAccount[] = [];


  // =========================================================
  // FILTERED DATA
  // =========================================================

  filteredPurchaseRequests: ReportPurchaseRequest[] = [];


  // =========================================================
  // UI STATE
  // =========================================================

  isLoading = true;
  isRefreshing = false;

  successMessage = '';
  errorMessage = '';

  selectedReport = 'overview';

  selectedStatus = 'ALL';
  selectedDepartment = 'ALL';
  selectedPeriod = 'ALL';

  searchTerm = '';


  // =========================================================
  // STATISTICS
  // =========================================================

  totalUsers = 0;
  totalEmployees = 0;
  totalAdmins = 0;

  totalDepartments = 0;
  totalCategories = 0;
  totalProducts = 0;
  totalSuppliers = 0;

  totalPurchaseRequests = 0;
  pendingRequests = 0;
  approvedRequests = 0;
  rejectedRequests = 0;
  cancelledRequests = 0;

  totalProcurementAmount = 0;
  approvedProcurementAmount = 0;
  pendingProcurementAmount = 0;
  rejectedProcurementAmount = 0;

  totalAccounts = 0;
  pendingPayments = 0;
  successfulPayments = 0;
  failedPayments = 0;

  totalPaidAmount = 0;
  totalPendingPaymentAmount = 0;


  // =========================================================
  // DERIVED REPORT DATA
  // =========================================================

  departmentReports: DepartmentReportRow[] = [];

  categoryReports: CategoryReportRow[] = [];

  supplierReports: SupplierReportRow[] = [];

  monthlyReports: MonthlyReportRow[] = [];

  recentRequests: ReportPurchaseRequest[] = [];


  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage = 1;
  pageSize = 8;

  totalPages = 1;
  pageNumbers: number[] = [];

  paginatedRequests: ReportPurchaseRequest[] = [];


  // =========================================================
  // DATE RANGE
  // =========================================================

  reportStartDate = '';
  reportEndDate = '';


  constructor(
    private reportsService: AdminReportsService,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {
    this.loadAllReports();
  }


  // =========================================================
  // LOAD ALL REPORT DATA
  // =========================================================

  loadAllReports(): void {

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    forkJoin({
      users: this.reportsService.getUsers(),
      departments: this.reportsService.getDepartments(),
      categories: this.reportsService.getCategories(),
      products: this.reportsService.getProducts(),
      suppliers: this.reportsService.getSuppliers(),
      purchaseRequests: this.reportsService.getPurchaseRequests(),
      accounts: this.reportsService.getAccounts()
    }).subscribe({

      next: (data) => {

        this.users = data.users || [];
        this.departments = data.departments || [];
        this.categories = data.categories || [];
        this.products = data.products || [];
        this.suppliers = data.suppliers || [];
        this.purchaseRequests =
          data.purchaseRequests || [];
        this.accounts = data.accounts || [];

        this.calculateAllReports();

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Failed to load report data:',
          error
        );

        this.isLoading = false;

        this.errorMessage =
          this.getErrorMessage(
            error,
            'Unable to load report data. Please try again.'
          );

        this.cdr.detectChanges();
      }
    });
  }


  // =========================================================
  // REFRESH
  // =========================================================

  refreshReports(): void {

    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;
    this.errorMessage = '';
    this.successMessage = '';

    forkJoin({
      users: this.reportsService.getUsers(),
      departments: this.reportsService.getDepartments(),
      categories: this.reportsService.getCategories(),
      products: this.reportsService.getProducts(),
      suppliers: this.reportsService.getSuppliers(),
      purchaseRequests:
        this.reportsService.getPurchaseRequests(),
      accounts:
        this.reportsService.getAccounts()
    }).subscribe({

      next: (data) => {

        this.users = data.users || [];
        this.departments = data.departments || [];
        this.categories = data.categories || [];
        this.products = data.products || [];
        this.suppliers = data.suppliers || [];
        this.purchaseRequests =
          data.purchaseRequests || [];
        this.accounts = data.accounts || [];

        this.calculateAllReports();

        this.isRefreshing = false;

        this.successMessage =
          'Reports refreshed successfully.';

        this.cdr.detectChanges();

        this.clearSuccessMessage();
      },

      error: (error) => {

        console.error(
          'Failed to refresh reports:',
          error
        );

        this.isRefreshing = false;

        this.errorMessage =
          this.getErrorMessage(
            error,
            'Unable to refresh reports.'
          );

        this.cdr.detectChanges();
      }
    });
  }


  // =========================================================
  // CALCULATE EVERYTHING
  // =========================================================

  calculateAllReports(): void {

    this.calculateBasicStatistics();

    this.calculateRequestStatistics();

    this.calculatePaymentStatistics();

    this.calculateDepartmentReports();

    this.calculateCategoryReports();

    this.calculateSupplierReports();

    this.calculateMonthlyReports();

    this.calculateRecentRequests();

    this.applyRequestFilters();
  }


  // =========================================================
  // BASIC STATISTICS
  // =========================================================

  calculateBasicStatistics(): void {

    this.totalUsers =
      this.users.length;

    this.totalEmployees =
      this.users.filter(
        user =>
          this.normalize(
            user.role
          ) === 'EMPLOYEE'
      ).length;

    this.totalAdmins =
      this.users.filter(
        user =>
          this.normalize(
            user.role
          ) === 'ADMIN'
      ).length;

    this.totalDepartments =
      this.departments.length;

    this.totalCategories =
      this.categories.length;

    this.totalProducts =
      this.products.length;

    this.totalSuppliers =
      this.suppliers.length;
  }


  // =========================================================
  // PURCHASE REQUEST STATISTICS
  // =========================================================

  calculateRequestStatistics(): void {

    this.totalPurchaseRequests =
      this.purchaseRequests.length;

    this.pendingRequests =
      this.countRequestsByStatus('PENDING');

    this.approvedRequests =
      this.countRequestsByStatus('APPROVED');

    this.rejectedRequests =
      this.countRequestsByStatus('REJECTED');

    this.cancelledRequests =
      this.countRequestsByStatus('CANCELLED');


    this.totalProcurementAmount =
      this.purchaseRequests.reduce(
        (total, request) =>
          total +
          this.toNumber(
            request.totalPrice
          ),
        0
      );


    this.approvedProcurementAmount =
      this.purchaseRequests
        .filter(
          request =>
            this.normalize(
              request.status
            ) === 'APPROVED'
        )
        .reduce(
          (total, request) =>
            total +
            this.toNumber(
              request.totalPrice
            ),
          0
        );


    this.pendingProcurementAmount =
      this.purchaseRequests
        .filter(
          request =>
            this.normalize(
              request.status
            ) === 'PENDING'
        )
        .reduce(
          (total, request) =>
            total +
            this.toNumber(
              request.totalPrice
            ),
          0
        );


    this.rejectedProcurementAmount =
      this.purchaseRequests
        .filter(
          request =>
            this.normalize(
              request.status
            ) === 'REJECTED'
        )
        .reduce(
          (total, request) =>
            total +
            this.toNumber(
              request.totalPrice
            ),
          0
        );
  }


  // =========================================================
  // PAYMENT STATISTICS
  // =========================================================

  calculatePaymentStatistics(): void {

    this.totalAccounts =
      this.accounts.length;


    this.pendingPayments =
      this.countAccountsByStatus('PENDING');


    this.successfulPayments =
      this.countAccountsByStatus('SUCCESS');


    this.failedPayments =
      this.countAccountsByStatus('FAILED');


    this.totalPaidAmount =
      this.accounts
        .filter(
          account =>
            this.normalize(
              account.paymentStatus
            ) === 'SUCCESS'
        )
        .reduce(
          (total, account) =>
            total +
            this.toNumber(
              account.amount
            ),
          0
        );


    this.totalPendingPaymentAmount =
      this.accounts
        .filter(
          account =>
            this.normalize(
              account.paymentStatus
            ) === 'PENDING'
        )
        .reduce(
          (total, account) =>
            total +
            this.toNumber(
              account.amount
            ),
          0
        );
  }


  // =========================================================
  // DEPARTMENT REPORT
  // =========================================================

  calculateDepartmentReports(): void {

    this.departmentReports =
      this.departments.map(
        department => {

          const departmentUsers =
            this.users.filter(
              user =>
                user.departmentId ===
                department.departmentId
            );


          const departmentRequests =
            this.purchaseRequests.filter(
              request =>
                this.getUserDepartmentId(
                  request.userId
                ) ===
                department.departmentId
            );


          const totalAmount =
            departmentRequests.reduce(
              (total, request) =>
                total +
                this.toNumber(
                  request.totalPrice
                ),
              0
            );


          const approvedAmount =
            departmentRequests
              .filter(
                request =>
                  this.normalize(
                    request.status
                  ) === 'APPROVED'
              )
              .reduce(
                (total, request) =>
                  total +
                  this.toNumber(
                    request.totalPrice
                  ),
                0
              );


          return {
            departmentId:
              department.departmentId ?? 0,

            departmentName:
              department.departmentName ||
              'Unnamed Department',

            employeeCount:
            departmentUsers.length,

            requestCount:
            departmentRequests.length,

            approvedCount:
            departmentRequests.filter(
              request =>
                this.normalize(
                  request.status
                ) === 'APPROVED'
            ).length,

            pendingCount:
            departmentRequests.filter(
              request =>
                this.normalize(
                  request.status
                ) === 'PENDING'
            ).length,

            rejectedCount:
            departmentRequests.filter(
              request =>
                this.normalize(
                  request.status
                ) === 'REJECTED'
            ).length,

            totalAmount,

            approvedAmount
          };
        }
      );


    this.departmentReports.sort(
      (a, b) =>
        b.totalAmount -
        a.totalAmount
    );
  }


  // =========================================================
  // CATEGORY REPORT
  // =========================================================

  calculateCategoryReports(): void {

    this.categoryReports =
      this.categories.map(
        category => {

          let requestCount = 0;
          let totalAmount = 0;
          let totalQuantity = 0;


          this.purchaseRequests.forEach(
            request => {

              (request.items || [])
                .forEach(item => {

                  const product =
                    this.products.find(
                      p =>
                        p.productId ===
                        item.productId
                    );


                  if (
                    product?.categoryId ===
                    category.categoryId
                  ) {

                    requestCount++;

                    const quantity =
                      this.toNumber(
                        item.quantity
                      );

                    const itemAmount =
                      this.getItemAmount(
                        item
                      );

                    totalQuantity +=
                      quantity;

                    totalAmount +=
                      itemAmount;
                  }
                });
            }
          );


          return {
            categoryId:
              category.categoryId ?? 0,

            categoryName:
              category.categoryName ||
              'Unnamed Category',

            productCount:
            this.products.filter(
              product =>
                product.categoryId ===
                category.categoryId
            ).length,

            supplierCount:
            this.suppliers.filter(
              supplier =>
                supplier.categoryId ===
                category.categoryId
            ).length,

            requestCount,

            totalQuantity,

            totalAmount
          };
        }
      );


    this.categoryReports.sort(
      (a, b) =>
        b.totalAmount -
        a.totalAmount
    );
  }


  // =========================================================
  // SUPPLIER REPORT
  // =========================================================

  calculateSupplierReports(): void {

    this.supplierReports =
      this.suppliers.map(
        supplier => {

          let orderCount = 0;
          let totalAmount = 0;


          this.purchaseRequests.forEach(
            request => {

              (request.items || [])
                .forEach(item => {

                  if (
                    item.supplierId ===
                    supplier.supplierId
                  ) {

                    orderCount++;

                    totalAmount +=
                      this.getItemAmount(
                        item
                      );
                  }
                });
            }
          );


          return {
            supplierId:
              supplier.supplierId ?? 0,

            supplierName:
              supplier.supplierName ||
              'Unnamed Supplier',

            categoryName:
              supplier.categoryName ||
              this.getCategoryName(
                supplier.categoryId
              ),

            rating:
              this.toNumber(
                supplier.rating
              ),

            status:
              supplier.status ||
              'UNKNOWN',

            orderCount,

            totalAmount
          };
        }
      );


    this.supplierReports.sort(
      (a, b) =>
        b.totalAmount -
        a.totalAmount
    );
  }


  // =========================================================
  // MONTHLY REPORT
  // =========================================================

  calculateMonthlyReports(): void {

    const monthMap =
      new Map<string, MonthlyReportRow>();


    this.purchaseRequests.forEach(
      request => {

        if (!request.requestDate) {
          return;
        }


        const date =
          new Date(
            request.requestDate
          );


        if (isNaN(date.getTime())) {
          return;
        }


        const year =
          date.getFullYear();

        const month =
          date.getMonth();


        const key =
          `${year}-${String(month + 1).padStart(2, '0')}`;


        if (!monthMap.has(key)) {

          monthMap.set(
            key,
            {
              key,
              monthName:
                date.toLocaleDateString(
                  'en-IN',
                  {
                    month: 'short',
                    year: 'numeric'
                  }
                ),

              requestCount: 0,
              approvedCount: 0,
              rejectedCount: 0,
              pendingCount: 0,
              totalAmount: 0,
              approvedAmount: 0
            }
          );
        }


        const row =
          monthMap.get(key)!;


        row.requestCount++;


        const amount =
          this.toNumber(
            request.totalPrice
          );


        row.totalAmount +=
          amount;


        const status =
          this.normalize(
            request.status
          );


        if (status === 'APPROVED') {

          row.approvedCount++;

          row.approvedAmount +=
            amount;

        } else if (status === 'REJECTED') {

          row.rejectedCount++;

        } else if (status === 'PENDING') {

          row.pendingCount++;
        }
      }
    );


    this.monthlyReports =
      Array.from(
        monthMap.values()
      )
        .sort(
          (a, b) =>
            a.key.localeCompare(b.key)
        )
        .slice(-12);
  }


  // =========================================================
  // RECENT REQUESTS
  // =========================================================

  calculateRecentRequests(): void {

    this.recentRequests =
      [...this.purchaseRequests]
        .sort(
          (a, b) =>
            this.getDateValue(
              b.requestDate
            ) -
            this.getDateValue(
              a.requestDate
            )
        )
        .slice(0, 6);
  }


  // =========================================================
  // REQUEST FILTERING
  // =========================================================

  applyRequestFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    this.filteredPurchaseRequests =
      this.purchaseRequests.filter(
        request => {

          const requestUser =
            this.getUserName(
              request.userId
            );


          const departmentName =
            this.getDepartmentName(
              this.getUserDepartmentId(
                request.userId
              )
            );


          const matchesSearch =
            !search ||
            String(
              request.purchaseRequestId ?? ''
            ).includes(search) ||
            requestUser
              .toLowerCase()
              .includes(search) ||
            departmentName
              .toLowerCase()
              .includes(search) ||
            (request.remarks || '')
              .toLowerCase()
              .includes(search);


          const matchesStatus =
            this.selectedStatus === 'ALL' ||
            this.normalize(
              request.status
            ) === this.selectedStatus;


          const matchesDepartment =
            this.selectedDepartment === 'ALL' ||
            String(
              this.getUserDepartmentId(
                request.userId
              )
            ) ===
            this.selectedDepartment;


          const matchesPeriod =
            this.matchesPeriod(
              request.requestDate
            );


          const matchesDateRange =
            this.matchesCustomDateRange(
              request.requestDate
            );


          return (
            matchesSearch &&
            matchesStatus &&
            matchesDepartment &&
            matchesPeriod &&
            matchesDateRange
          );
        }
      );


    this.currentPage = 1;

    this.updatePagination();
  }


  // =========================================================
  // SEARCH
  // =========================================================

  onSearch(): void {
    this.applyRequestFilters();
  }


  // =========================================================
  // STATUS
  // =========================================================

  onStatusChange(): void {
    this.applyRequestFilters();
  }


  // =========================================================
  // DEPARTMENT
  // =========================================================

  onDepartmentChange(): void {
    this.applyRequestFilters();
  }


  // =========================================================
  // PERIOD
  // =========================================================

  onPeriodChange(): void {
    this.applyRequestFilters();
  }


  // =========================================================
  // DATE FILTER
  // =========================================================

  onDateRangeChange(): void {
    this.selectedPeriod = 'CUSTOM';
    this.applyRequestFilters();
  }


  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  clearFilters(): void {

    this.searchTerm = '';
    this.selectedStatus = 'ALL';
    this.selectedDepartment = 'ALL';
    this.selectedPeriod = 'ALL';

    this.reportStartDate = '';
    this.reportEndDate = '';

    this.applyRequestFilters();
  }


  // =========================================================
  // PERIOD MATCH
  // =========================================================

  matchesPeriod(
    requestDate: string | undefined
  ): boolean {

    if (
      this.selectedPeriod === 'ALL' ||
      this.selectedPeriod === 'CUSTOM'
    ) {
      return true;
    }


    if (!requestDate) {
      return false;
    }


    const date =
      new Date(requestDate);


    if (isNaN(date.getTime())) {
      return false;
    }


    const now =
      new Date();


    if (this.selectedPeriod === 'MONTH') {

      return (
        date.getFullYear() ===
        now.getFullYear() &&
        date.getMonth() ===
        now.getMonth()
      );
    }


    if (this.selectedPeriod === 'QUARTER') {

      const currentQuarter =
        Math.floor(
          now.getMonth() / 3
        );

      const requestQuarter =
        Math.floor(
          date.getMonth() / 3
        );


      return (
        date.getFullYear() ===
        now.getFullYear() &&
        requestQuarter ===
        currentQuarter
      );
    }


    if (this.selectedPeriod === 'YEAR') {

      return (
        date.getFullYear() ===
        now.getFullYear()
      );
    }


    return true;
  }


  // =========================================================
  // CUSTOM DATE RANGE
  // =========================================================

  matchesCustomDateRange(
    requestDate: string | undefined
  ): boolean {

    if (
      !this.reportStartDate &&
      !this.reportEndDate
    ) {
      return true;
    }


    if (!requestDate) {
      return false;
    }


    const requestTime =
      this.getDateValue(
        requestDate
      );


    if (
      this.reportStartDate
    ) {

      const start =
        new Date(
          this.reportStartDate
        );

      start.setHours(
        0,
        0,
        0,
        0
      );


      if (
        requestTime <
        start.getTime()
      ) {
        return false;
      }
    }


    if (
      this.reportEndDate
    ) {

      const end =
        new Date(
          this.reportEndDate
        );

      end.setHours(
        23,
        59,
        59,
        999
      );


      if (
        requestTime >
        end.getTime()
      ) {
        return false;
      }
    }


    return true;
  }


  // =========================================================
  // PAGINATION
  // =========================================================

  updatePagination(): void {

    this.totalPages =
      Math.max(
        1,
        Math.ceil(
          this.filteredPurchaseRequests.length /
          this.pageSize
        )
      );


    if (
      this.currentPage >
      this.totalPages
    ) {
      this.currentPage =
        this.totalPages;
    }


    const startIndex =
      (
        this.currentPage - 1
      ) *
      this.pageSize;


    const endIndex =
      startIndex +
      this.pageSize;


    this.paginatedRequests =
      this.filteredPurchaseRequests.slice(
        startIndex,
        endIndex
      );


    this.pageNumbers =
      this.getPageNumbers();
  }


  getPageNumbers(): number[] {

    const pages: number[] = [];

    const maxVisiblePages = 5;

    let start =
      Math.max(
        1,
        this.currentPage -
        Math.floor(
          maxVisiblePages / 2
        )
      );


    const end =
      Math.min(
        this.totalPages,
        start +
        maxVisiblePages -
        1
      );


    if (
      end -
      start +
      1 <
      maxVisiblePages
    ) {

      start =
        Math.max(
          1,
          end -
          maxVisiblePages +
          1
        );
    }


    for (
      let page = start;
      page <= end;
      page++
    ) {

      pages.push(page);
    }


    return pages;
  }


  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }


    this.currentPage = page;

    this.updatePagination();
  }


  previousPage(): void {

    if (
      this.currentPage > 1
    ) {

      this.currentPage--;

      this.updatePagination();
    }
  }


  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;

      this.updatePagination();
    }
  }


  // =========================================================
  // REPORT TAB
  // =========================================================

  selectReport(
    report: string
  ): void {

    this.selectedReport = report;
  }


  // =========================================================
  // REQUEST STATUS COUNT
  // =========================================================

  countRequestsByStatus(
    status: string
  ): number {

    return this.purchaseRequests.filter(
      request =>
        this.normalize(
          request.status
        ) === status
    ).length;
  }


  // =========================================================
  // ACCOUNT STATUS COUNT
  // =========================================================

  countAccountsByStatus(
    status: string
  ): number {

    return this.accounts.filter(
      account =>
        this.normalize(
          account.paymentStatus
        ) === status
    ).length;
  }


  // =========================================================
  // PERCENTAGE HELPERS
  // =========================================================

  getPercentage(
    value: number,
    total: number
  ): number {

    if (
      !total ||
      total <= 0
    ) {
      return 0;
    }


    return Math.round(
      (
        value /
        total
      ) *
      100
    );
  }


  getAmountPercentage(
    value: number,
    total: number
  ): number {

    if (
      !total ||
      total <= 0
    ) {
      return 0;
    }


    return Math.round(
      (
        value /
        total
      ) *
      100
    );
  }


  // =========================================================
  // TOP DEPARTMENT
  // =========================================================

  getTopDepartment():
    DepartmentReportRow | null {

    if (
      !this.departmentReports.length
    ) {
      return null;
    }


    return this.departmentReports[0];
  }


  // =========================================================
  // TOP CATEGORY
  // =========================================================

  getTopCategory():
    CategoryReportRow | null {

    if (
      !this.categoryReports.length
    ) {
      return null;
    }


    return this.categoryReports[0];
  }


  // =========================================================
  // TOP SUPPLIER
  // =========================================================

  getTopSupplier():
    SupplierReportRow | null {

    if (
      !this.supplierReports.length
    ) {
      return null;
    }


    return this.supplierReports[0];
  }


  // =========================================================
  // USER NAME
  // =========================================================

  getUserName(
    userId: number | undefined
  ): string {

    if (!userId) {
      return 'Unknown User';
    }


    const user =
      this.users.find(
        item =>
          item.userId === userId
      );


    return (
      user?.username ||
      `User #${userId}`
    );
  }


  // =========================================================
  // USER EMAIL
  // =========================================================

  getUserEmail(
    userId: number | undefined
  ): string {

    if (!userId) {
      return '';
    }


    const user =
      this.users.find(
        item =>
          item.userId === userId
      );


    return user?.email || '';
  }


  // =========================================================
  // USER DEPARTMENT
  // =========================================================

  getUserDepartmentId(
    userId: number | undefined
  ): number | null {

    if (!userId) {
      return null;
    }


    const user =
      this.users.find(
        item =>
          item.userId === userId
      );


    return user?.departmentId ?? null;
  }


  // =========================================================
  // DEPARTMENT NAME
  // =========================================================

  getDepartmentName(
    departmentId: number | null | undefined
  ): string {

    if (
      departmentId === null ||
      departmentId === undefined
    ) {
      return 'Unassigned';
    }


    const department =
      this.departments.find(
        item =>
          item.departmentId ===
          departmentId
      );


    return (
      department?.departmentName ||
      `Department #${departmentId}`
    );
  }


  // =========================================================
  // CATEGORY NAME
  // =========================================================

  getCategoryName(
    categoryId: number | null | undefined
  ): string {

    if (
      categoryId === null ||
      categoryId === undefined
    ) {
      return 'Uncategorized';
    }


    const category =
      this.categories.find(
        item =>
          item.categoryId ===
          categoryId
      );


    return (
      category?.categoryName ||
      `Category #${categoryId}`
    );
  }


  // =========================================================
  // PRODUCT NAME
  // =========================================================

  getProductName(
    productId: number | undefined
  ): string {

    if (!productId) {
      return 'Unknown Product';
    }


    const product =
      this.products.find(
        item =>
          item.productId === productId
      );


    return (
      product?.productName ||
      `Product #${productId}`
    );
  }


  // =========================================================
  // ITEM AMOUNT
  // =========================================================

  getItemAmount(
    item: ReportPurchaseRequestItem
  ): number {

    if (
      item.totalPrice !== undefined &&
      item.totalPrice !== null
    ) {

      return this.toNumber(
        item.totalPrice
      );
    }


    return (
      this.toNumber(
        item.price
      ) *
      this.toNumber(
        item.quantity
      )
    );
  }


  // =========================================================
  // REQUEST ITEM COUNT
  // =========================================================

  getItemCount(
    request: ReportPurchaseRequest
  ): number {

    return (
      request.items?.length ||
      0
    );
  }


  // =========================================================
  // REQUEST QUANTITY
  // =========================================================

  getRequestQuantity(
    request: ReportPurchaseRequest
  ): number {

    return (
      request.items || []
    ).reduce(
      (total, item) =>
        total +
        this.toNumber(
          item.quantity
        ),
      0
    );
  }


  // =========================================================
  // STATUS LABEL
  // =========================================================

  getStatusLabel(
    status: string | undefined
  ): string {

    switch (
      this.normalize(status)
      ) {

      case 'PENDING':
        return 'Pending';

      case 'APPROVED':
        return 'Approved';

      case 'REJECTED':
        return 'Rejected';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return 'Unknown';
    }
  }


  // =========================================================
  // STATUS CLASS
  // =========================================================

  getStatusClass(
    status: string | undefined
  ): string {

    switch (
      this.normalize(status)
      ) {

      case 'PENDING':
        return 'status-pending';

      case 'APPROVED':
        return 'status-approved';

      case 'REJECTED':
        return 'status-rejected';

      case 'CANCELLED':
        return 'status-cancelled';

      default:
        return 'status-unknown';
    }
  }


  // =========================================================
  // PAYMENT STATUS LABEL
  // =========================================================

  getPaymentStatusLabel(
    status: string | undefined
  ): string {

    switch (
      this.normalize(status)
      ) {

      case 'PENDING':
        return 'Pending';

      case 'SUCCESS':
        return 'Successful';

      case 'FAILED':
        return 'Failed';

      default:
        return 'Unknown';
    }
  }


  // =========================================================
  // PAYMENT STATUS CLASS
  // =========================================================

  getPaymentStatusClass(
    status: string | undefined
  ): string {

    switch (
      this.normalize(status)
      ) {

      case 'PENDING':
        return 'status-pending';

      case 'SUCCESS':
        return 'status-approved';

      case 'FAILED':
        return 'status-rejected';

      default:
        return 'status-unknown';
    }
  }


  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  formatCurrency(
    value: number | null | undefined
  ): string {

    const amount =
      this.toNumber(value);


    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    ).format(amount);
  }


  // =========================================================
  // FORMAT DATE
  // =========================================================

  formatDate(
    value: string | undefined
  ): string {

    if (!value) {
      return '—';
    }


    const date =
      new Date(value);


    if (
      isNaN(
        date.getTime()
      )
    ) {
      return '—';
    }


    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }


  // =========================================================
  // FORMAT DATE TIME
  // =========================================================

  formatDateTime(
    value: string | undefined
  ): string {

    if (!value) {
      return '—';
    }


    const date =
      new Date(value);


    if (
      isNaN(
        date.getTime()
      )
    ) {
      return '—';
    }


    return date.toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }


  // =========================================================
  // DATE VALUE
  // =========================================================

  getDateValue(
    value: string | undefined
  ): number {

    if (!value) {
      return 0;
    }


    const time =
      new Date(value).getTime();


    return isNaN(time)
      ? 0
      : time;
  }


  // =========================================================
  // NORMALIZE
  // =========================================================

  normalize(
    value: string | null | undefined
  ): string {

    return (
      value || ''
    )
      .trim()
      .toUpperCase();
  }


  // =========================================================
  // NUMBER CONVERSION
  // =========================================================

  toNumber(
    value: number | null | undefined
  ): number {

    if (
      value === null ||
      value === undefined
    ) {
      return 0;
    }


    const numberValue =
      Number(value);


    return isNaN(numberValue)
      ? 0
      : numberValue;
  }


  // =========================================================
  // TRACK BY REQUEST
  // =========================================================

  trackByRequestId(
    index: number,
    request: ReportPurchaseRequest
  ): number {

    return (
      request.purchaseRequestId ??
      index
    );
  }


  // =========================================================
  // TRACK BY DEPARTMENT
  // =========================================================

  trackByDepartmentId(
    index: number,
    row: DepartmentReportRow
  ): number {

    return (
      row.departmentId ||
      index
    );
  }


  // =========================================================
  // TRACK BY CATEGORY
  // =========================================================

  trackByCategoryId(
    index: number,
    row: CategoryReportRow
  ): number {

    return (
      row.categoryId ||
      index
    );
  }


  // =========================================================
  // TRACK BY SUPPLIER
  // =========================================================

  trackBySupplierId(
    index: number,
    row: SupplierReportRow
  ): number {

    return (
      row.supplierId ||
      index
    );
  }


  // =========================================================
  // EXPORT REPORT
  // =========================================================

  exportReport(): void {

    const rows =
      this.filteredPurchaseRequests;


    if (!rows.length) {

      this.errorMessage =
        'There is no report data available to export.';

      return;
    }


    const headers = [
      'Purchase Request ID',
      'Employee',
      'Department',
      'Status',
      'Approval Level',
      'Request Date',
      'Approved Date',
      'Total Amount',
      'Item Count',
      'Total Quantity',
      'Remarks'
    ];


    const csvRows =
      rows.map(
        request => [

          request.purchaseRequestId ?? '',

          this.getUserName(
            request.userId
          ),

          this.getDepartmentName(
            this.getUserDepartmentId(
              request.userId
            )
          ),

          this.getStatusLabel(
            request.status
          ),

          request.currentApprovalLevel ?? '',

          this.formatDateTime(
            request.requestDate
          ),

          this.formatDateTime(
            request.approvedDate
          ),

          this.toNumber(
            request.totalPrice
          ).toFixed(2),

          this.getItemCount(
            request
          ),

          this.getRequestQuantity(
            request
          ),

          request.remarks || ''
        ]
      );


    const csvContent = [
      headers,
      ...csvRows
    ]
      .map(
        row =>
          row
            .map(
              value =>
                `"${String(value)
                  .replace(/"/g, '""')}"`
            )
            .join(',')
      )
      .join('\n');


    const blob =
      new Blob(
        [csvContent],
        {
          type:
            'text/csv;charset=utf-8;'
        }
      );


    const url =
      window.URL.createObjectURL(
        blob
      );


    const link =
      document.createElement('a');

    link.href = url;

    link.download =
      `procurement-report-${this.getFileDate()}.csv`;

    link.click();


    window.URL.revokeObjectURL(
      url
    );


    this.successMessage =
      'Procurement report exported successfully.';

    this.clearSuccessMessage();
  }


  // =========================================================
  // EXPORT DEPARTMENT REPORT
  // =========================================================

  exportDepartmentReport(): void {

    if (
      !this.departmentReports.length
    ) {

      this.errorMessage =
        'No department report data is available.';

      return;
    }


    const headers = [
      'Department',
      'Employees',
      'Requests',
      'Approved',
      'Pending',
      'Rejected',
      'Total Procurement',
      'Approved Procurement'
    ];


    const rows =
      this.departmentReports.map(
        row => [

          row.departmentName,

          row.employeeCount,

          row.requestCount,

          row.approvedCount,

          row.pendingCount,

          row.rejectedCount,

          row.totalAmount.toFixed(2),

          row.approvedAmount.toFixed(2)
        ]
      );


    this.downloadCsv(
      headers,
      rows,
      `department-procurement-report-${this.getFileDate()}.csv`
    );
  }


  // =========================================================
  // EXPORT CATEGORY REPORT
  // =========================================================

  exportCategoryReport(): void {

    if (
      !this.categoryReports.length
    ) {

      this.errorMessage =
        'No category report data is available.';

      return;
    }


    const headers = [
      'Category',
      'Products',
      'Suppliers',
      'Requests',
      'Quantity',
      'Procurement Amount'
    ];


    const rows =
      this.categoryReports.map(
        row => [

          row.categoryName,

          row.productCount,

          row.supplierCount,

          row.requestCount,

          row.totalQuantity,

          row.totalAmount.toFixed(2)
        ]
      );


    this.downloadCsv(
      headers,
      rows,
      `category-procurement-report-${this.getFileDate()}.csv`
    );
  }


  // =========================================================
  // GENERIC CSV DOWNLOAD
  // =========================================================

  private downloadCsv(
    headers: string[],
    rows: any[][],
    filename: string
  ): void {

    const csvContent = [
      headers,
      ...rows
    ]
      .map(
        row =>
          row
            .map(
              value =>
                `"${String(value)
                  .replace(/"/g, '""')}"`
            )
            .join(',')
      )
      .join('\n');


    const blob =
      new Blob(
        [csvContent],
        {
          type:
            'text/csv;charset=utf-8;'
        }
      );


    const url =
      window.URL.createObjectURL(
        blob
      );


    const link =
      document.createElement('a');

    link.href = url;

    link.download = filename;

    link.click();


    window.URL.revokeObjectURL(
      url
    );


    this.successMessage =
      'Report exported successfully.';

    this.clearSuccessMessage();
  }


  // =========================================================
  // FILE DATE
  // =========================================================

  getFileDate(): string {

    const now =
      new Date();


    return [
      now.getFullYear(),
      String(
        now.getMonth() + 1
      ).padStart(2, '0'),
      String(
        now.getDate()
      ).padStart(2, '0')
    ].join('-');
  }


  // =========================================================
  // SUCCESS MESSAGE
  // =========================================================

  clearSuccessMessage(): void {

    setTimeout(() => {

      this.successMessage = '';

      this.cdr.detectChanges();

    }, 4500);
  }


  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  getErrorMessage(
    error: any,
    fallback: string
  ): string {

    if (
      error?.error?.message &&
      typeof error.error.message === 'string'
    ) {

      return error.error.message;
    }


    if (
      error?.error?.error &&
      typeof error.error.error === 'string'
    ) {

      return error.error.error;
    }


    if (
      typeof error?.error === 'string' &&
      error.error.trim()
    ) {

      return error.error;
    }


    if (
      error?.message &&
      typeof error.message === 'string'
    ) {

      return error.message;
    }


    if (error?.status === 401) {

      return 'Your session has expired. Please login again.';
    }


    if (error?.status === 403) {

      return 'You do not have permission to access report data.';
    }


    return fallback;
  }

}


// =========================================================
// REPORT ROW INTERFACES
// =========================================================

export interface DepartmentReportRow {

  departmentId: number;

  departmentName: string;

  employeeCount: number;

  requestCount: number;

  approvedCount: number;

  pendingCount: number;

  rejectedCount: number;

  totalAmount: number;

  approvedAmount: number;
}


export interface CategoryReportRow {

  categoryId: number;

  categoryName: string;

  productCount: number;

  supplierCount: number;

  requestCount: number;

  totalQuantity: number;

  totalAmount: number;
}


export interface SupplierReportRow {

  supplierId: number;

  supplierName: string;

  categoryName: string;

  rating: number;

  status: string;

  orderCount: number;

  totalAmount: number;
}


export interface MonthlyReportRow {

  key: string;

  monthName: string;

  requestCount: number;

  approvedCount: number;

  rejectedCount: number;

  pendingCount: number;

  totalAmount: number;

  approvedAmount: number;
}
