import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfiliationCertificateComponent } from './afiliation-certificate.component';

describe('AfiliationCertificateComponent', () => {
  let component: AfiliationCertificateComponent;
  let fixture: ComponentFixture<AfiliationCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AfiliationCertificateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfiliationCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
