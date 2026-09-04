import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountAssociationComponent } from './bank-account-association.component';

describe('BankAccountAssociationComponent', () => {
  let component: BankAccountAssociationComponent;
  let fixture: ComponentFixture<BankAccountAssociationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BankAccountAssociationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BankAccountAssociationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
