import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAfiliationAccountTypeComponent } from './modal-afiliation-account-type.component';

describe('ModalAfiliationAccountTypeComponent', () => {
  let component: ModalAfiliationAccountTypeComponent;
  let fixture: ComponentFixture<ModalAfiliationAccountTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalAfiliationAccountTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalAfiliationAccountTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
