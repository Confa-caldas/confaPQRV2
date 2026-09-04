import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfiliationCompanyComponent } from './afiliation-company.component';

describe('AfiliationCompanyComponent', () => {
  let component: AfiliationCompanyComponent;
  let fixture: ComponentFixture<AfiliationCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AfiliationCompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfiliationCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
