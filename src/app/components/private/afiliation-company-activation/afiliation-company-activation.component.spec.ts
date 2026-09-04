import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfiliationCompanyActivationComponent } from './afiliation-company-activation.component';

describe('AfiliationCompanyActivationComponent', () => {
  let component: AfiliationCompanyActivationComponent;
  let fixture: ComponentFixture<AfiliationCompanyActivationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AfiliationCompanyActivationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AfiliationCompanyActivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
