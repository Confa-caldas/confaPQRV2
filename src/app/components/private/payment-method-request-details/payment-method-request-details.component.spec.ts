import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodRequestDetailsComponent } from './payment-method-request-details.component';

describe('PaymentMethodRequestDetailsComponent', () => {
  let component: PaymentMethodRequestDetailsComponent;
  let fixture: ComponentFixture<PaymentMethodRequestDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentMethodRequestDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentMethodRequestDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
