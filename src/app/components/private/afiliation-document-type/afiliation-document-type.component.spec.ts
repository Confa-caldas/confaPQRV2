import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfiliationDocumentTypeComponent } from './afiliation-document-type.component';

describe('AfiliationDocumentTypeComponent', () => {
  let component: AfiliationDocumentTypeComponent;
  let fixture: ComponentFixture<AfiliationDocumentTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AfiliationDocumentTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfiliationDocumentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
