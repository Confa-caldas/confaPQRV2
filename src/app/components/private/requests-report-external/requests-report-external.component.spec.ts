import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsReportExternalComponent } from './requests-report-external.component';

describe('RequestsReportExternalComponent', () => {
  let component: RequestsReportExternalComponent;
  let fixture: ComponentFixture<RequestsReportExternalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestsReportExternalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestsReportExternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
