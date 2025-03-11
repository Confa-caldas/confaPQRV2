import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestFormInternalComponent } from './request-form-internal.component';

describe('RequestFormInternalComponent', () => {
  let component: RequestFormInternalComponent;
  let fixture: ComponentFixture<RequestFormInternalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestFormInternalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestFormInternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
