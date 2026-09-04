import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfiliationAccountTypeComponent } from './afiliation-account-type.component';

describe('AfiliationAccountTypeComponent', () => {
  let component: AfiliationAccountTypeComponent;
  let fixture: ComponentFixture<AfiliationAccountTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AfiliationAccountTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfiliationAccountTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
