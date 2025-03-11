import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRequestInternalComponent } from './create-request-internal.component';

describe('CreateRequestInternalComponent', () => {
  let component: CreateRequestInternalComponent;
  let fixture: ComponentFixture<CreateRequestInternalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateRequestInternalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateRequestInternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
