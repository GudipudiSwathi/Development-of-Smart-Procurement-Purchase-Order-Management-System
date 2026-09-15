import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRequestDetails } from './purchase-request-details';

describe('PurchaseRequestDetails', () => {
  let component: PurchaseRequestDetails;
  let fixture: ComponentFixture<PurchaseRequestDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseRequestDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseRequestDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
