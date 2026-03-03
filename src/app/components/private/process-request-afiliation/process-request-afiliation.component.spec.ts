import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessRequestAfiliationComponent } from './process-request-afiliation.component';

describe('ProccessRequestAfiliationComponent', () => {
  let component: ProcessRequestAfiliationComponent;
  let fixture: ComponentFixture<ProcessRequestAfiliationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcessRequestAfiliationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProcessRequestAfiliationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
