import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminAccountsService, Account } from '../../services/admin-accounts';
import { AdminSidebar } from '../../components/admin-sidebar/admin-sidebar';
import { PaymentService, PaymentMethod, PaymentProcessRequest, PaymentTransaction } from '../../services/payment.service';
import { HttpClient } from '@angular/common/http';

interface SupplierOption {
  supplierId: number;
  supplierName: string;
  upiId?: string;
  amount?: number;
}

interface PurchaseRequestResponse {
  purchaseRequestId: number;
  status: string;
  items: Array<{
    productId: number;
    quantity: number;
    itemTotalPrice?: number;
    supplierId?: number;
  }>;
}

@Component({
  selector: 'app-admin-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebar],
  templateUrl: './admin-accounts.html',
  styleUrl: './admin-accounts.css'
})
export class AdminAccounts implements OnInit {
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  selectedAccount: Account | null = null;

  isLoading = true;
  isRefreshing = false;
  isProcessingPayment = false;
  isProcessingFailure = false;

  showDetailsModal = false;
  showPaymentModal = false;

  successMessage = '';
  errorMessage = '';

  searchTerm = '';
  selectedStatus = 'ALL';

  currentPage = 1;
  pageSize = 8;

  totalAccounts = 0;
  pendingPayments = 0;
  successfulPayments = 0;
  failedPayments = 0;
  totalAmount = 0;
  pendingAmount = 0;
  successfulAmount = 0;
  failedAmount = 0;

  Math = Math;

  // Payment flow
  paymentStep = 1;
  accountForPayment: Account | null = null;
  suppliersForPayment: SupplierOption[] = [];
  selectedSupplier: SupplierOption | null = null;
  selectedPaymentMethod: PaymentMethod | null = null;
  currentTransaction: PaymentTransaction | null = null;

  mpin = '';
  cardHolderName = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';

  private readonly purchaseRequestApiUrl = 'http://localhost:8080/purchase-requests';

  constructor(
    private accountsService: AdminAccountsService,
    private paymentService: PaymentService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.accountsService.getAllAccounts().subscribe({
      next: (data: Account[]) => {
        this.accounts = Array.isArray(data) ? data : [];
        this.calculateStatistics();
        this.applyFilters();
        this.isLoading = false;
        this.isRefreshing = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Failed to load accounts:', error);
        this.isLoading = false;
        this.isRefreshing = false;
        this.errorMessage = this.getErrorMessage(error, 'Unable to load payment accounts.');
        this.cdr.detectChanges();
      }
    });
  }

  refreshAccounts(): void {
    this.isRefreshing = true;
    this.errorMessage = '';
    this.loadAccounts();
  }

  calculateStatistics(): void {
    this.totalAccounts = this.accounts.length;
    this.pendingPayments = this.accounts.filter(a => this.normalizeStatus(a.paymentStatus) === 'PENDING').length;
    this.successfulPayments = this.accounts.filter(a => this.normalizeStatus(a.paymentStatus) === 'SUCCESS').length;
    this.failedPayments = this.accounts.filter(a => this.normalizeStatus(a.paymentStatus) === 'FAILED').length;

    this.totalAmount = this.accounts.reduce((t, a) => t + Number(a.amount || 0), 0);
    this.pendingAmount = this.accounts.filter(a => this.normalizeStatus(a.paymentStatus) === 'PENDING').reduce((t, a) => t + Number(a.amount || 0), 0);
    this.successfulAmount = this.accounts.filter(a => this.normalizeStatus(a.paymentStatus) === 'SUCCESS').reduce((t, a) => t + Number(a.amount || 0), 0);
    this.failedAmount = this.accounts.filter(a => this.normalizeStatus(a.paymentStatus) === 'FAILED').reduce((t, a) => t + Number(a.amount || 0), 0);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredAccounts = this.accounts.filter((account: Account) => {
      const searchableText = [
        account.accountId,
        account.purchaseRequestId,
        account.userId,
        account.amount,
        account.paymentStatus,
        account.paymentReference,
        account.paymentDate
      ].filter(v => v !== null && v !== undefined).join(' ').toLowerCase();

      const matchesSearch = !search || searchableText.includes(search);
      const matchesStatus = this.selectedStatus === 'ALL' || this.normalizeStatus(account.paymentStatus) === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });

    this.updatePagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'ALL';
    this.currentPage = 1;
    this.applyFilters();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAccounts.length / this.pageSize));
  }

  get paginatedAccounts(): Account[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAccounts.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  updatePagination(): void {
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  viewDetails(account: Account): void {
    this.selectedAccount = account;
    this.showDetailsModal = true;
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.selectedAccount = null;
  }

  // Safe entry point for the Pay Now button inside the
  // account-details modal. Keep a local reference before
  // closing the details modal, because closeDetails() clears
  // selectedAccount.
  openPaymentFromDetails(): void {
    const account = this.selectedAccount;

    if (!account) {
      this.errorMessage = 'No payment account is selected.';
      return;
    }

    if (this.normalizeStatus(account.paymentStatus) !== 'PENDING') {
      this.errorMessage = 'Only pending approved payments can be processed.';
      return;
    }

    this.closeDetails();
    this.openPaymentModal(account);
  }

  // =====================================================
  // NEW PAYMENT FLOW
  // =====================================================

  openPaymentModal(account: Account | null): void {

    if (!account) {
      this.errorMessage =
        'Unable to open payment. Payment account was not found.';
      return;
    }

    if (this.normalizeStatus(account.paymentStatus) !== 'PENDING') {
      this.errorMessage =
        'Only pending approved payments can be processed.';
      return;
    }

    this.accountForPayment = account;

    this.paymentStep = 1;
    this.suppliersForPayment = [];
    this.selectedSupplier = null;
    this.selectedPaymentMethod = null;
    this.currentTransaction = null;

    this.resetPaymentFields();

    this.errorMessage = '';

    this.showDetailsModal = false;
    this.showPaymentModal = true;

    this.loadSuppliersForRequest(
      account.purchaseRequestId
    );
  }

  private loadSuppliersForRequest(purchaseRequestId: number): void {
    this.http.get<PurchaseRequestResponse>(`${this.purchaseRequestApiUrl}/${purchaseRequestId}`).subscribe({
      next: (request) => {
        if (this.normalizeStatus(request.status) !== 'APPROVED') {
          this.errorMessage = 'Payment is available only after Admin approval.';
          return;
        }

        const ids = Array.from(new Set(
          (request.items || [])
            .map(item => Number(item.supplierId))
            .filter(id => Number.isFinite(id) && id > 0)
        ));

        this.suppliersForPayment = ids.map(id => ({
          supplierId: id,
          supplierName: `Supplier #${id}`
        }));

        if (!this.suppliersForPayment.length) {
          this.errorMessage = 'No supplier is assigned to this purchase request.';
        }

        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Failed to load purchase request suppliers:', error);
        this.errorMessage = this.getErrorMessage(error, 'Unable to load suppliers for this payment.');
        this.cdr.detectChanges();
      }
    });
  }

  selectSupplier(supplier: SupplierOption): void {
    this.selectedSupplier = supplier;
    this.selectedPaymentMethod = null;
    this.currentTransaction = null;
    this.paymentStep = 2;
    this.errorMessage = '';
  }

  choosePaymentMethod(method: PaymentMethod): void {
    if (!this.accountForPayment || !this.selectedSupplier) return;

    this.selectedPaymentMethod = method;
    this.isProcessingPayment = true;
    this.errorMessage = '';

    this.paymentService.initiatePayment(
      this.accountForPayment.purchaseRequestId,
      this.selectedSupplier.supplierId,
      method
    ).subscribe({
      next: (transaction) => {
        this.currentTransaction = transaction;
        this.selectedSupplier = {
          ...this.selectedSupplier!,
          supplierName: transaction.supplierName || this.selectedSupplier!.supplierName,
          upiId: transaction.supplierUpiId,
          amount: transaction.amount
        };
        this.paymentStep = 3;
        this.isProcessingPayment = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Failed to initiate payment:', error);
        this.isProcessingPayment = false;
        this.errorMessage = this.getErrorMessage(error, 'Unable to initiate payment.');
        this.cdr.detectChanges();
      }
    });
  }

  processPayment(): void {
    if (!this.currentTransaction || !this.selectedPaymentMethod) return;

    const request: PaymentProcessRequest = {
      transactionReference: this.currentTransaction.transactionReference
    };

    if (this.selectedPaymentMethod === 'QR_CODE' || this.selectedPaymentMethod === 'UPI') {
      const pin = this.mpin.trim();
      if (!/^\d{4,6}$/.test(pin)) {
        this.errorMessage = 'MPIN must contain 4 to 6 digits.';
        return;
      }
      request.mpin = pin;
    } else {
      const number = this.cardNumber.replace(/\s+/g, '');
      if (!/^\d{12,19}$/.test(number)) {
        this.errorMessage = 'Card number must contain 12 to 19 digits.';
        return;
      }
      if (!this.cardHolderName.trim()) {
        this.errorMessage = 'Card holder name is required.';
        return;
      }
      if (!this.cardExpiry.trim()) {
        this.errorMessage = 'Card expiry is required.';
        return;
      }
      if (!/^\d{3,4}$/.test(this.cardCvv.trim())) {
        this.errorMessage = 'Card CVV must contain 3 or 4 digits.';
        return;
      }

      request.cardHolderName = this.cardHolderName.trim();
      request.cardNumber = number;
      request.cardExpiry = this.cardExpiry.trim();
      request.cardCvv = this.cardCvv.trim();
    }

    this.isProcessingPayment = true;
    this.errorMessage = '';

    this.paymentService.processPayment(this.currentTransaction.paymentId, request).subscribe({
      next: () => {
        this.isProcessingPayment = false;
        this.closePaymentModal(true);
        this.successMessage = 'Payment processed successfully.';
        this.loadAccounts();
        this.clearSuccessMessage();
      },
      error: (error: any) => {
        console.error('Payment processing failed:', error);
        this.isProcessingPayment = false;
        this.errorMessage = this.getErrorMessage(error, 'Unable to process the payment.');
        this.cdr.detectChanges();
      }
    });
  }

  markCurrentPaymentFailed(): void {
    if (!this.currentTransaction) return;

    this.isProcessingFailure = true;
    this.errorMessage = '';

    this.paymentService.markPaymentFailed(this.currentTransaction.paymentId).subscribe({
      next: () => {
        this.isProcessingFailure = false;
        this.closePaymentModal(true);
        this.successMessage = 'Payment transaction marked as failed.';
        this.loadAccounts();
        this.clearSuccessMessage();
      },
      error: (error: any) => {
        console.error('Failed to mark payment transaction as failed:', error);
        this.isProcessingFailure = false;
        this.errorMessage = this.getErrorMessage(error, 'Unable to mark the payment as failed.');
        this.cdr.detectChanges();
      }
    });
  }

  backPaymentStep(): void {
    if (this.isProcessingPayment || this.isProcessingFailure) return;
    if (this.paymentStep === 3) {
      this.currentTransaction = null;
      this.selectedPaymentMethod = null;
      this.resetPaymentFields();
      this.paymentStep = 2;
    } else if (this.paymentStep === 2) {
      this.selectedSupplier = null;
      this.paymentStep = 1;
    }
    this.errorMessage = '';
  }

  closePaymentModal(force = false): void {
    if (!force && (this.isProcessingPayment || this.isProcessingFailure)) return;

    this.showPaymentModal = false;
    this.accountForPayment = null;
    this.suppliersForPayment = [];
    this.selectedSupplier = null;
    this.selectedPaymentMethod = null;
    this.currentTransaction = null;
    this.paymentStep = 1;
    this.resetPaymentFields();
  }

  get paymentAmount(): number {
    return Number(this.currentTransaction?.amount ?? this.selectedSupplier?.amount ?? this.accountForPayment?.amount ?? 0);
  }

  get qrPayload(): string {
    const upi = this.currentTransaction?.supplierUpiId || this.selectedSupplier?.upiId || '';
    const name = this.currentTransaction?.supplierName || this.selectedSupplier?.supplierName || 'Supplier';
    const amount = this.paymentAmount.toFixed(2);
    const reference = this.currentTransaction?.qrReference || this.currentTransaction?.transactionReference || '';
    return `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tr=${encodeURIComponent(reference)}`;
  }

  get qrImageUrl(): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(this.qrPayload)}`;
  }

  get isDigitalPayment(): boolean {
    return this.selectedPaymentMethod === 'QR_CODE' || this.selectedPaymentMethod === 'UPI';
  }

  private resetPaymentFields(): void {
    this.mpin = '';
    this.cardHolderName = '';
    this.cardNumber = '';
    this.cardExpiry = '';
    this.cardCvv = '';
  }

  normalizeStatus(status: string | null | undefined): string {
    return String(status || 'PENDING').trim().toUpperCase();
  }

  getStatusLabel(status: string | null | undefined): string {
    switch (this.normalizeStatus(status)) {
      case 'SUCCESS': return 'Success';
      case 'FAILED': return 'Failed';
      case 'PENDING': return 'Pending';
      default: return this.normalizeStatus(status);
    }
  }

  getStatusClass(status: string | null | undefined): string {
    switch (this.normalizeStatus(status)) {
      case 'SUCCESS': return 'status-success';
      case 'FAILED': return 'status-failed';
      default: return 'status-pending';
    }
  }

  formatCurrency(value: number | null | undefined): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(Number(value || 0));
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '—';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  formatDateTime(value: string | null | undefined): string {
    if (!value) return '—';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  }

  trackByAccountId(index: number, account: Account): number {
    return account.accountId || index;
  }

  private clearSuccessMessage(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  private getErrorMessage(error: any, fallback: string): string {
    if (error?.error?.message) return error.error.message;
    if (typeof error?.error === 'string' && error.error.trim()) return error.error;
    if (error?.message) return error.message;
    if (error?.status === 401) return 'Your session has expired. Please login again.';
    if (error?.status === 403) return 'You do not have permission to perform this action.';
    return fallback;
  }
}
