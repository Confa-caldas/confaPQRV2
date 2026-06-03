import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestTypeDocumentsComponent } from './request-type-documents.component';

describe('RequestTypeDocumentsComponent', () => {
  let component: RequestTypeDocumentsComponent;
  let fixture: ComponentFixture<RequestTypeDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestTypeDocumentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestTypeDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
