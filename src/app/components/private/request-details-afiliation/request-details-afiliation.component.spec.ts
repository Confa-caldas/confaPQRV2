import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestDetailsAfiliationComponent } from './request-details-afiliation.component';

describe('RequestDetailsAfiliationComponent', () => {
  let component: RequestDetailsAfiliationComponent;
  let fixture: ComponentFixture<RequestDetailsAfiliationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestDetailsAfiliationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestDetailsAfiliationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
