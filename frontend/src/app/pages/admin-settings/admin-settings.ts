import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminSidebar } from '../../components/admin-sidebar/admin-sidebar';

interface AdminSettingsModel {
  emailNotifications: boolean;
  approvalNotifications: boolean;
  paymentNotifications: boolean;
  procurementNotifications: boolean;

  compactTables: boolean;
  showStatistics: boolean;

  autoRefresh: boolean;
  autoRefreshInterval: number;

  defaultPageSize: number;

  currency: string;
  dateFormat: string;
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.css'
})
export class AdminSettings implements OnInit {

  /* =====================================================
     ADMIN INFORMATION
     ===================================================== */

  adminName: string =
    localStorage.getItem('username') || 'Administrator';

  adminRole: string =
    localStorage.getItem('role') || 'ADMIN';

  adminEmail: string =
    localStorage.getItem('adminEmail') || '';

  get adminInitial(): string {
    return this.adminName
      ? this.adminName.charAt(0).toUpperCase()
      : 'A';
  }


  /* =====================================================
     SETTINGS
     ===================================================== */

  settings: AdminSettingsModel = {
    emailNotifications: true,
    approvalNotifications: true,
    paymentNotifications: true,
    procurementNotifications: true,

    compactTables: false,
    showStatistics: true,

    autoRefresh: false,
    autoRefreshInterval: 5,

    defaultPageSize: 10,

    currency: 'INR',
    dateFormat: 'DD/MM/YYYY'
  };


  /* =====================================================
     UI STATE
     ===================================================== */

  activeSection: string = 'general';

  isSaving = false;

  successMessage = '';

  errorMessage = '';

  showResetConfirmation = false;

  lastSavedText = '';


  /* =====================================================
     CONSTRUCTOR / INIT
     ===================================================== */

  constructor() {}

  ngOnInit(): void {
    this.loadAdminInformation();
    this.loadSettings();
  }


  /* =====================================================
     ADMIN INFORMATION
     ===================================================== */

  loadAdminInformation(): void {

    this.adminName =
      localStorage.getItem('username') ||
      'Administrator';

    this.adminRole =
      localStorage.getItem('role') ||
      'ADMIN';

    this.adminEmail =
      localStorage.getItem('adminEmail') ||
      '';
  }


  /* =====================================================
     LOAD SETTINGS
     ===================================================== */

  loadSettings(): void {

    const savedSettings =
      localStorage.getItem('adminSettings');

    if (!savedSettings) {
      return;
    }

    try {

      const parsedSettings =
        JSON.parse(savedSettings);

      this.settings = {
        ...this.settings,
        ...parsedSettings
      };

    } catch (error) {

      console.error(
        'Unable to load saved admin settings:',
        error
      );

    }
  }


  /* =====================================================
     SAVE SETTINGS
     ===================================================== */

  saveSettings(): void {

    this.isSaving = true;

    this.successMessage = '';
    this.errorMessage = '';

    try {

      localStorage.setItem(
        'adminSettings',
        JSON.stringify(this.settings)
      );

      this.lastSavedText =
        `Last saved: ${this.formatCurrentTime()}`;

      this.successMessage =
        'Settings have been saved successfully.';

      setTimeout(() => {
        this.isSaving = false;
      }, 450);

      setTimeout(() => {
        this.successMessage = '';
      }, 3500);

    } catch (error) {

      console.error(
        'Unable to save admin settings:',
        error
      );

      this.isSaving = false;

      this.errorMessage =
        'Unable to save settings. Please try again.';
    }
  }


  /* =====================================================
     RESET SETTINGS
     ===================================================== */

  openResetConfirmation(): void {
    this.showResetConfirmation = true;
  }


  closeResetConfirmation(): void {
    this.showResetConfirmation = false;
  }


  resetSettings(): void {

    this.settings = {
      emailNotifications: true,
      approvalNotifications: true,
      paymentNotifications: true,
      procurementNotifications: true,

      compactTables: false,
      showStatistics: true,

      autoRefresh: false,
      autoRefreshInterval: 5,

      defaultPageSize: 10,

      currency: 'INR',
      dateFormat: 'DD/MM/YYYY'
    };

    localStorage.setItem(
      'adminSettings',
      JSON.stringify(this.settings)
    );

    this.lastSavedText =
      `Last saved: ${this.formatCurrentTime()}`;

    this.successMessage =
      'Settings have been restored to their default values.';

    this.showResetConfirmation = false;

    setTimeout(() => {
      this.successMessage = '';
    }, 3500);
  }


  /* =====================================================
     SECTION NAVIGATION
     ===================================================== */

  selectSection(section: string): void {

    this.activeSection = section;

    this.successMessage = '';
    this.errorMessage = '';
  }


  /* =====================================================
     PROFILE
     ===================================================== */

  saveProfile(): void {

    const trimmedEmail =
      this.adminEmail.trim();

    if (
      trimmedEmail &&
      !this.isValidEmail(trimmedEmail)
    ) {

      this.errorMessage =
        'Please enter a valid email address.';

      return;
    }

    if (trimmedEmail) {

      localStorage.setItem(
        'adminEmail',
        trimmedEmail
      );

    } else {

      localStorage.removeItem('adminEmail');
    }

    this.successMessage =
      'Profile information has been saved.';

    setTimeout(() => {
      this.successMessage = '';
    }, 3500);
  }


  /* =====================================================
     NOTIFICATION SETTINGS
     ===================================================== */

  toggleEmailNotifications(): void {

    this.settings.emailNotifications =
      !this.settings.emailNotifications;

    this.saveSettings();
  }


  toggleApprovalNotifications(): void {

    this.settings.approvalNotifications =
      !this.settings.approvalNotifications;

    this.saveSettings();
  }


  togglePaymentNotifications(): void {

    this.settings.paymentNotifications =
      !this.settings.paymentNotifications;

    this.saveSettings();
  }


  toggleProcurementNotifications(): void {

    this.settings.procurementNotifications =
      !this.settings.procurementNotifications;

    this.saveSettings();
  }


  /* =====================================================
     DISPLAY SETTINGS
     ===================================================== */

  toggleCompactTables(): void {

    this.settings.compactTables =
      !this.settings.compactTables;

    this.saveSettings();
  }


  toggleStatistics(): void {

    this.settings.showStatistics =
      !this.settings.showStatistics;

    this.saveSettings();
  }


  /* =====================================================
     AUTO REFRESH
     ===================================================== */

  toggleAutoRefresh(): void {

    this.settings.autoRefresh =
      !this.settings.autoRefresh;

    this.saveSettings();
  }


  onRefreshIntervalChange(): void {

    if (
      this.settings.autoRefreshInterval < 1
    ) {
      this.settings.autoRefreshInterval = 1;
    }

    if (
      this.settings.autoRefreshInterval > 60
    ) {
      this.settings.autoRefreshInterval = 60;
    }

    this.saveSettings();
  }


  /* =====================================================
     PAGE SIZE
     ===================================================== */

  onPageSizeChange(): void {

    const allowedSizes = [
      5,
      10,
      20,
      25,
      50
    ];

    if (
      !allowedSizes.includes(
        Number(this.settings.defaultPageSize)
      )
    ) {
      this.settings.defaultPageSize = 10;
    }

    this.saveSettings();
  }


  /* =====================================================
     FORMAT SETTINGS
     ===================================================== */

  onCurrencyChange(): void {
    this.saveSettings();
  }


  onDateFormatChange(): void {
    this.saveSettings();
  }


  /* =====================================================
     UTILITY METHODS
     ===================================================== */

  formatCurrentTime(): string {

    return new Intl.DateTimeFormat(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    ).format(new Date());
  }


  isValidEmail(email: string): boolean {

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
  }


  clearMessages(): void {

    this.successMessage = '';
    this.errorMessage = '';
  }


  getSettingsStatus(): string {

    const enabledNotifications =
      Number(this.settings.emailNotifications) +
      Number(this.settings.approvalNotifications) +
      Number(this.settings.paymentNotifications) +
      Number(this.settings.procurementNotifications);

    if (enabledNotifications === 4) {
      return 'All notifications enabled';
    }

    if (enabledNotifications === 0) {
      return 'Notifications disabled';
    }

    return `${enabledNotifications} notification preferences enabled`;
  }


  getDisplayModeLabel(): string {

    return this.settings.compactTables
      ? 'Compact'
      : 'Comfortable';
  }


  getAutoRefreshLabel(): string {

    if (!this.settings.autoRefresh) {
      return 'Disabled';
    }

    return `Every ${this.settings.autoRefreshInterval} minutes`;
  }

}
