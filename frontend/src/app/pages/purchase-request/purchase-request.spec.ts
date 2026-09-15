import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseRequestPage } from './purchase-request';

describe('PurchaseRequestPage', () => {

  let component: PurchaseRequestPage;
  let fixture: ComponentFixture<PurchaseRequestPage>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [PurchaseRequestPage]
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseRequestPage);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
