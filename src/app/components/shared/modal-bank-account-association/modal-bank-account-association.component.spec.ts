import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBankAccountAssociationComponent } from './modal-bank-account-association.component';

describe('ModalBankAccountAssociationComponent', () => {
  let component: ModalBankAccountAssociationComponent;
  let fixture: ComponentFixture<ModalBankAccountAssociationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalBankAccountAssociationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalBankAccountAssociationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
