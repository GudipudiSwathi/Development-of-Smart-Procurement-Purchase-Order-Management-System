import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminApprovals } from './admin-approvals';

describe('AdminApprovals', () => {
  let component: AdminApprovals;
  let fixture: ComponentFixture<AdminApprovals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminApprovals],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminApprovals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
