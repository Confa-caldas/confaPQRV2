import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodRequestComponent } from './payment-method-request.component';

describe('PaymentMethodRequestComponent', () => {
  let component: PaymentMethodRequestComponent;
  let fixture: ComponentFixture<PaymentMethodRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentMethodRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentMethodRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
