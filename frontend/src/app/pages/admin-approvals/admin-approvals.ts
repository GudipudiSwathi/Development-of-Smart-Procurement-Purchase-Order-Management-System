import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AdminApprovalsService,
  ApprovalHierarchy,
  ApprovalHierarchyRequest,
  ApprovalUser,
  ApprovalDepartment
} from '../../services/admin-approvals';

import { AdminSidebar } from '../../components/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-approvals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './admin-approvals.html',
  styleUrl: './admin-approvals.css'
})
export class AdminApprovals implements OnInit {
  Math = Math;

  // =======================================================
  // DATA
  // =======================================================

  approvalHierarchies: ApprovalHierarchy[] = [];
  filteredHierarchies: ApprovalHierarchy[] = [];

  users: ApprovalUser[] = [];
  departments: ApprovalDepartment[] = [];

  selectedHierarchy: ApprovalHierarchy | null = null;
  hierarchyToDelete: ApprovalHierarchy | null = null;


  // =======================================================
  // UI STATE
  // =======================================================

  isLoading = true;
  isRefreshing = false;
  isSaving = false;
  isDeleting = false;

  showFormModal = false;
  showDetailsModal = false;
  showDeleteModal = false;

  isEditMode = false;

  successMessage = '';
  errorMessage = '';


  // =======================================================
  // SEARCH / FILTER
  // =======================================================

  searchTerm = '';
  selectedLevel = 'ALL';
  selectedStatus = 'ALL';


  // =======================================================
  // PAGINATION
  // =======================================================

  currentPage = 1;
  pageSize = 8;

  totalPages = 1;
  pageNumbers: number[] = [];

  paginatedHierarchies: ApprovalHierarchy[] = [];


  // =======================================================
  // FORM
  // =======================================================

  formData: ApprovalHierarchyRequest = {
    departmentId: null,
    approverUserId: null,
    level: null,
    approverRole: '',
    status: 'ACTIVE'
  };


  // =======================================================
  // STATISTICS
  // =======================================================

  totalHierarchies = 0;
  activeHierarchies = 0;
  inactiveHierarchies = 0;

  levelOneCount = 0;
  levelTwoCount = 0;
  levelThreeCount = 0;


  constructor(
    private approvalsService: AdminApprovalsService,
    private cdr: ChangeDetectorRef
  ) {}


  // =======================================================
  // INITIALIZATION
  // =======================================================

  ngOnInit(): void {
    this.loadAllData();
  }


  // =======================================================
  // LOAD ALL DATA
  // =======================================================

  loadAllData(): void {

    this.isLoading = true;
    this.errorMessage = '';

    let hierarchyLoaded = false;
    let usersLoaded = false;
    let departmentsLoaded = false;

    this.approvalsService.getAllApprovalHierarchies().subscribe({
      next: (data) => {

        this.approvalHierarchies = data || [];

        hierarchyLoaded = true;

        this.enrichHierarchies();
        this.calculateStatistics();
        this.applyFilters();

        this.finishInitialLoading(
          hierarchyLoaded,
          usersLoaded,
          departmentsLoaded
        );
      },

      error: (error) => {

        console.error(
          'Failed to load approval hierarchies:',
          error
        );

        this.errorMessage =
          this.getErrorMessage(
            error,
            'Unable to load approval hierarchy records.'
          );

        hierarchyLoaded = true;

        this.finishInitialLoading(
          hierarchyLoaded,
          usersLoaded,
          departmentsLoaded
        );
      }
    });


    this.approvalsService.getUsers().subscribe({
      next: (data) => {

        this.users = data || [];

        usersLoaded = true;

        this.enrichHierarchies();

        this.finishInitialLoading(
          hierarchyLoaded,
          usersLoaded,
          departmentsLoaded
        );
      },

      error: (error) => {

        console.error(
          'Failed to load users:',
          error
        );

        this.errorMessage =
          this.getErrorMessage(
            error,
            'Unable to load approver users.'
          );

        usersLoaded = true;

        this.finishInitialLoading(
          hierarchyLoaded,
          usersLoaded,
          departmentsLoaded
        );
      }
    });


    this.approvalsService.getDepartments().subscribe({
      next: (data) => {

        this.departments = data || [];

        departmentsLoaded = true;

        this.enrichHierarchies();

        this.finishInitialLoading(
          hierarchyLoaded,
          usersLoaded,
          departmentsLoaded
        );
      },

      error: (error) => {

        console.error(
          'Failed to load departments:',
          error
        );

        this.errorMessage =
          this.getErrorMessage(
            error,
            'Unable to load departments.'
          );

        departmentsLoaded = true;

        this.finishInitialLoading(
          hierarchyLoaded,
          usersLoaded,
          departmentsLoaded
        );
      }
    });
  }


  // =======================================================
  // LOADING COMPLETION
  // =======================================================

  private finishInitialLoading(
    hierarchyLoaded: boolean,
    usersLoaded: boolean,
    departmentsLoaded: boolean
  ): void {

    if (
      hierarchyLoaded &&
      usersLoaded &&
      departmentsLoaded
    ) {

      this.isLoading = false;

      this.enrichHierarchies();
      this.calculateStatistics();
      this.applyFilters();

      this.cdr.detectChanges();
    }
  }


  // =======================================================
  // ENRICH DISPLAY DATA
  // =======================================================

  enrichHierarchies(): void {

    this.approvalHierarchies =
      this.approvalHierarchies.map((hierarchy) => {

        const user =
          this.users.find(
            u => u.userId === hierarchy.approverUserId
          );

        const department =
          this.departments.find(
            d => d.departmentId === hierarchy.departmentId
          );

        return {
          ...hierarchy,

          approverName:
            user?.username ||
            `User #${hierarchy.approverUserId ?? '-'}`,

          approverEmail:
            user?.email || '',

          departmentName:
            hierarchy.departmentId === null
              ? 'Centralized'
              : (
                department?.departmentName ||
                `Department #${hierarchy.departmentId}`
              )
        };
      });
  }


  // =======================================================
  // STATISTICS
  // =======================================================

  calculateStatistics(): void {

    this.totalHierarchies =
      this.approvalHierarchies.length;

    this.activeHierarchies =
      this.approvalHierarchies.filter(
        h =>
          this.normalizeStatus(h.status) === 'ACTIVE'
      ).length;

    this.inactiveHierarchies =
      this.approvalHierarchies.filter(
        h =>
          this.normalizeStatus(h.status) === 'INACTIVE'
      ).length;

    this.levelOneCount =
      this.approvalHierarchies.filter(
        h => h.level === 1
      ).length;

    this.levelTwoCount =
      this.approvalHierarchies.filter(
        h => h.level === 2
      ).length;

    this.levelThreeCount =
      this.approvalHierarchies.filter(
        h => h.level === 3
      ).length;
  }


  // =======================================================
  // REFRESH
  // =======================================================

  refreshApprovals(): void {

    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.approvalsService.getAllApprovalHierarchies().subscribe({

      next: (data) => {

        this.approvalHierarchies = data || [];

        this.enrichHierarchies();
        this.calculateStatistics();
        this.applyFilters();

        this.isRefreshing = false;

        this.successMessage =
          'Approval hierarchy refreshed successfully.';

        this.cdr.detectChanges();

        this.clearSuccessMessage();
      },

      error: (error) => {

        console.error(
          'Failed to refresh approval hierarchy:',
          error
        );

        this.isRefreshing = false;

        this.errorMessage =
          this.getErrorMessage(
            error,
            'Unable to refresh approval hierarchy.'
          );

        this.cdr.detectChanges();
      }
    });
  }


  // =======================================================
  // SEARCH
  // =======================================================

  onSearch(): void {

    this.currentPage = 1;

    this.applyFilters();
  }


  // =======================================================
  // LEVEL FILTER
  // =======================================================

  onLevelChange(): void {

    this.currentPage = 1;

    this.applyFilters();
  }


  // =======================================================
  // STATUS FILTER
  // =======================================================

  onStatusChange(): void {

    this.currentPage = 1;

    this.applyFilters();
  }


  // =======================================================
  // APPLY FILTERS
  // =======================================================

  applyFilters(): void {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    this.filteredHierarchies =
      this.approvalHierarchies.filter(
        hierarchy => {

          const matchesSearch =
            !search ||
            String(
              hierarchy.approvalHierarchyId ?? ''
            ).includes(search) ||
            String(
              hierarchy.approverUserId ?? ''
            ).includes(search) ||
            String(
              hierarchy.departmentId ?? ''
            ).includes(search) ||
            (hierarchy.approverName || '')
              .toLowerCase()
              .includes(search) ||
            (hierarchy.approverEmail || '')
              .toLowerCase()
              .includes(search) ||
            (hierarchy.departmentName || '')
              .toLowerCase()
              .includes(search) ||
            (hierarchy.approverRole || '')
              .toLowerCase()
              .includes(search);


          const matchesLevel =
            this.selectedLevel === 'ALL' ||
            String(hierarchy.level) ===
            this.selectedLevel;


          const matchesStatus =
            this.selectedStatus === 'ALL' ||
            this.normalizeStatus(
              hierarchy.status
            ) === this.selectedStatus;


          return (
            matchesSearch &&
            matchesLevel &&
            matchesStatus
          );
        }
      );

    this.updatePagination();
  }


  // =======================================================
  // CLEAR FILTERS
  // =======================================================

  clearFilters(): void {

    this.searchTerm = '';
    this.selectedLevel = 'ALL';
    this.selectedStatus = 'ALL';

    this.currentPage = 1;

    this.applyFilters();
  }


  // =======================================================
  // PAGINATION
  // =======================================================

  updatePagination(): void {

    this.totalPages =
      Math.max(
        1,
        Math.ceil(
          this.filteredHierarchies.length /
          this.pageSize
        )
      );

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const startIndex =
      (this.currentPage - 1) *
      this.pageSize;

    const endIndex =
      startIndex +
      this.pageSize;

    this.paginatedHierarchies =
      this.filteredHierarchies.slice(
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
        Math.floor(maxVisiblePages / 2)
      );

    let end =
      Math.min(
        this.totalPages,
        start + maxVisiblePages - 1
      );

    if (
      end - start + 1 <
      maxVisiblePages
    ) {

      start =
        Math.max(
          1,
          end - maxVisiblePages + 1
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

    if (this.currentPage > 1) {

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


  // =======================================================
  // OPEN ADD MODAL
  // =======================================================

  openAddModal(): void {

    this.isEditMode = false;

    this.selectedHierarchy = null;

    this.formData = {
      departmentId: null,
      approverUserId: null,
      level: 1,
      approverRole: 'Department Manager',
      status: 'ACTIVE'
    };

    this.successMessage = '';
    this.errorMessage = '';

    this.showFormModal = true;
  }


  // =======================================================
  // OPEN EDIT MODAL
  // =======================================================

  openEditModal(
    hierarchy: ApprovalHierarchy
  ): void {

    this.isEditMode = true;

    this.selectedHierarchy = hierarchy;

    this.formData = {
      departmentId:
        hierarchy.departmentId ?? null,

      approverUserId:
        hierarchy.approverUserId ?? null,

      level:
        hierarchy.level ?? null,

      approverRole:
        hierarchy.approverRole || '',

      status:
        this.normalizeStatus(
          hierarchy.status
        )
    };

    this.successMessage = '';
    this.errorMessage = '';

    this.showFormModal = true;
  }


  // =======================================================
  // CLOSE FORM MODAL
  // =======================================================

  closeFormModal(): void {

    if (this.isSaving) {
      return;
    }

    this.showFormModal = false;

    this.selectedHierarchy = null;

    this.resetForm();
  }


  // =======================================================
  // RESET FORM
  // =======================================================

  resetForm(): void {

    this.formData = {
      departmentId: null,
      approverUserId: null,
      level: 1,
      approverRole: 'Department Manager',
      status: 'ACTIVE'
    };

    this.isEditMode = false;
  }


  // =======================================================
  // LEVEL CHANGE
  // =======================================================

  onFormLevelChange(): void {

    const level =
      Number(this.formData.level);


    if (level === 1) {

      if (
        !this.formData.approverRole ||
        this.formData.approverRole ===
        'Finance' ||
        this.formData.approverRole ===
        'Procurement Head'
      ) {

        this.formData.approverRole =
          'Department Manager';
      }

    } else if (level === 2) {

      this.formData.departmentId = null;

      this.formData.approverRole =
        'Finance';

    } else if (level === 3) {

      this.formData.departmentId = null;

      this.formData.approverRole =
        'Procurement Head';
    }
  }


  // =======================================================
  // SAVE
  // =======================================================

  saveApprovalHierarchy(): void {

    this.errorMessage = '';
    this.successMessage = '';


    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!this.formData.level) {

      this.errorMessage =
        'Approval level is required.';

      return;
    }


    const level =
      Number(this.formData.level);


    if (![1, 2, 3].includes(level)) {

      this.errorMessage =
        'Approval level must be 1, 2 or 3.';

      return;
    }


    if (!this.formData.approverUserId) {

      this.errorMessage =
        'Please select an approver.';

      return;
    }


    if (
      level === 1 &&
      !this.formData.departmentId
    ) {

      this.errorMessage =
        'Department is required for Level 1 Manager.';

      return;
    }


    if (!this.formData.approverRole.trim()) {

      this.errorMessage =
        'Approver role is required.';

      return;
    }


    // -------------------------------------------------------
    // CENTRALIZED LEVELS
    // -------------------------------------------------------

    const request: ApprovalHierarchyRequest = {
      departmentId:
        level === 1
          ? this.formData.departmentId
          : null,

      approverUserId:
      this.formData.approverUserId,

      level,

      approverRole:
        this.formData.approverRole.trim(),

      status:
        this.formData.status || 'ACTIVE'
    };


    this.isSaving = true;


    // -------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------

    if (
      this.isEditMode &&
      this.selectedHierarchy?.approvalHierarchyId
    ) {

      this.approvalsService
        .updateApprovalHierarchy(
          this.selectedHierarchy.approvalHierarchyId,
          request
        )
        .subscribe({

          next: (saved) => {

            this.replaceHierarchy(saved);

            this.isSaving = false;
            this.showFormModal = false;

            this.calculateStatistics();
            this.applyFilters();

            this.successMessage =
              'Approval hierarchy updated successfully.';

            this.cdr.detectChanges();

            this.clearSuccessMessage();
          },

          error: (error) => {

            console.error(
              'Failed to update approval hierarchy:',
              error
            );

            this.isSaving = false;

            this.errorMessage =
              this.getErrorMessage(
                error,
                'Unable to update approval hierarchy.'
              );

            this.cdr.detectChanges();
          }
        });

      return;
    }


    // -------------------------------------------------------
    // CREATE
    // -------------------------------------------------------

    this.approvalsService
      .createApprovalHierarchy(request)
      .subscribe({

        next: (saved) => {

          this.approvalHierarchies = [
            ...this.approvalHierarchies,
            saved
          ];

          this.enrichHierarchies();

          this.isSaving = false;
          this.showFormModal = false;

          this.calculateStatistics();

          this.currentPage = 1;

          this.applyFilters();

          this.successMessage =
            'Approval hierarchy created successfully.';

          this.cdr.detectChanges();

          this.clearSuccessMessage();
        },

        error: (error) => {

          console.error(
            'Failed to create approval hierarchy:',
            error
          );

          this.isSaving = false;

          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to create approval hierarchy.'
            );

          this.cdr.detectChanges();
        }
      });
  }


  // =======================================================
  // REPLACE UPDATED RECORD
  // =======================================================

  replaceHierarchy(
    updated: ApprovalHierarchy
  ): void {

    this.approvalHierarchies =
      this.approvalHierarchies.map(
        hierarchy =>
          hierarchy.approvalHierarchyId ===
          updated.approvalHierarchyId
            ? updated
            : hierarchy
      );

    this.enrichHierarchies();
  }


  // =======================================================
  // VIEW DETAILS
  // =======================================================

  viewDetails(
    hierarchy: ApprovalHierarchy
  ): void {

    this.selectedHierarchy =
      hierarchy;

    this.showDetailsModal = true;
  }


  // =======================================================
  // CLOSE DETAILS
  // =======================================================

  closeDetails(): void {

    this.showDetailsModal = false;

    this.selectedHierarchy = null;
  }


  // =======================================================
  // DELETE CONFIRMATION
  // =======================================================

  confirmDelete(
    hierarchy: ApprovalHierarchy
  ): void {

    this.hierarchyToDelete =
      hierarchy;

    this.errorMessage = '';

    this.showDeleteModal = true;
  }


  // =======================================================
  // CLOSE DELETE MODAL
  // =======================================================

  closeDeleteModal(): void {

    if (this.isDeleting) {
      return;
    }

    this.showDeleteModal = false;

    this.hierarchyToDelete = null;
  }


  // =======================================================
  // DELETE
  // =======================================================

  deleteApprovalHierarchy(): void {

    if (
      !this.hierarchyToDelete?.approvalHierarchyId
    ) {
      return;
    }

    const id =
      this.hierarchyToDelete.approvalHierarchyId;

    this.isDeleting = true;
    this.errorMessage = '';


    this.approvalsService
      .deleteApprovalHierarchy(id)
      .subscribe({

        next: () => {

          this.approvalHierarchies =
            this.approvalHierarchies.filter(
              hierarchy =>
                hierarchy.approvalHierarchyId !== id
            );

          this.isDeleting = false;
          this.showDeleteModal = false;
          this.hierarchyToDelete = null;

          this.calculateStatistics();

          this.applyFilters();

          this.successMessage =
            'Approval hierarchy deleted successfully.';

          this.cdr.detectChanges();

          this.clearSuccessMessage();
        },

        error: (error) => {

          console.error(
            'Failed to delete approval hierarchy:',
            error
          );

          this.isDeleting = false;

          this.errorMessage =
            this.getErrorMessage(
              error,
              'Unable to delete approval hierarchy.'
            );

          this.cdr.detectChanges();
        }
      });
  }


  // =======================================================
  // LEVEL LABEL
  // =======================================================

  getLevelLabel(
    level: number | null
  ): string {

    switch (level) {

      case 1:
        return 'Level 1';

      case 2:
        return 'Level 2';

      case 3:
        return 'Level 3';

      default:
        return 'Unknown';
    }
  }


  // =======================================================
  // LEVEL DESCRIPTION
  // =======================================================

  getLevelDescription(
    level: number | null
  ): string {

    switch (level) {

      case 1:
        return 'Department Manager';

      case 2:
        return 'Central Finance';

      case 3:
        return 'Procurement Head';

      default:
        return 'Unknown approval level';
    }
  }


  // =======================================================
  // LEVEL CSS CLASS
  // =======================================================

  getLevelClass(
    level: number | null
  ): string {

    switch (level) {

      case 1:
        return 'level-one';

      case 2:
        return 'level-two';

      case 3:
        return 'level-three';

      default:
        return 'level-unknown';
    }
  }


  // =======================================================
  // STATUS
  // =======================================================

  normalizeStatus(
    status: string | null | undefined
  ): string {

    return (status || '')
      .trim()
      .toUpperCase();
  }


  getStatusLabel(
    status: string | null | undefined
  ): string {

    switch (
      this.normalizeStatus(status)
      ) {

      case 'ACTIVE':
        return 'Active';

      case 'INACTIVE':
        return 'Inactive';

      default:
        return 'Unknown';
    }
  }


  getStatusClass(
    status: string | null | undefined
  ): string {

    switch (
      this.normalizeStatus(status)
      ) {

      case 'ACTIVE':
        return 'status-active';

      case 'INACTIVE':
        return 'status-inactive';

      default:
        return 'status-unknown';
    }
  }


  // =======================================================
  // USER HELPERS
  // =======================================================

  getApproverName(
    userId: number | null
  ): string {

    if (!userId) {
      return 'Not assigned';
    }

    const user =
      this.users.find(
        u => u.userId === userId
      );

    return (
      user?.username ||
      `User #${userId}`
    );
  }


  getApproverEmail(
    userId: number | null
  ): string {

    if (!userId) {
      return '';
    }

    const user =
      this.users.find(
        u => u.userId === userId
      );

    return user?.email || '';
  }


  // =======================================================
  // TRACK BY
  // =======================================================

  trackByHierarchyId(
    index: number,
    hierarchy: ApprovalHierarchy
  ): number {

    return (
      hierarchy.approvalHierarchyId ??
      index
    );
  }


  trackByUserId(
    index: number,
    user: ApprovalUser
  ): number {

    return user.userId ?? index;
  }


  trackByDepartmentId(
    index: number,
    department: ApprovalDepartment
  ): number {

    return (
      department.departmentId ??
      index
    );
  }


  // =======================================================
  // ERROR MESSAGE
  // =======================================================

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
      return 'You do not have permission to perform this action.';
    }


    return fallback;
  }


  // =======================================================
  // SUCCESS MESSAGE
  // =======================================================

  clearSuccessMessage(): void {

    setTimeout(() => {

      this.successMessage = '';

      this.cdr.detectChanges();

    }, 4500);
  }

}
