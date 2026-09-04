import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAfiCompanyComponent } from './modal-afi-company.component';

describe('ModalAfiCompanyComponent', () => {
  let component: ModalAfiCompanyComponent;
  let fixture: ComponentFixture<ModalAfiCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalAfiCompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalAfiCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
