import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAfiliationCertificateComponent } from './modal-afiliation-certificate.component';

describe('ModalAfiliationCertificateComponent', () => {
  let component: ModalAfiliationCertificateComponent;
  let fixture: ComponentFixture<ModalAfiliationCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalAfiliationCertificateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalAfiliationCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
