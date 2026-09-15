import { Component } from '@angular/core';
import { Router } from '@angular/router';

type WorkflowStep = 'request' | 'approval' | 'tracking';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {

  selectedStep: WorkflowStep = 'request';

  constructor(
    private router: Router
  ) {}


  // =====================================================
  // NAVIGATION
  // =====================================================

  goToLogin(): void {
    this.router.navigate(['/login']);
  }


  goToRegister(): void {
    this.router.navigate(['/register']);
  }


  // =====================================================
  // INTERACTIVE WORKFLOW
  // =====================================================

  selectWorkflowStep(step: WorkflowStep): void {

    this.selectedStep = step;

    console.log(
      'WORKFLOW STEP SELECTED:',
      step
    );
  }


  // =====================================================
  // WORKFLOW CONTENT
  // =====================================================

  getWorkflowTitle(): string {

    switch (this.selectedStep) {

      case 'request':
        return 'Create a purchase request';

      case 'approval':
        return 'Review and approve';

      case 'tracking':
        return 'Track the request';

      default:
        return '';
    }
  }


  getWorkflowDescription(): string {

    switch (this.selectedStep) {

      case 'request':
        return 'Employees select products, choose quantities and submit a request for approval.';

      case 'approval':
        return 'The request moves through the approval workflow where authorized users can approve or reject it.';

      case 'tracking':
        return 'Once submitted, employees can follow the request status from approval through completion.';

      default:
        return '';
    }
  }


  getWorkflowAction(): string {

    switch (this.selectedStep) {

      case 'request':
        return 'Select products → Set quantity → Submit';

      case 'approval':
        return 'Review request → Approve / Reject';

      case 'tracking':
        return 'View status → Follow progress';

      default:
        return '';
    }
  }

}
