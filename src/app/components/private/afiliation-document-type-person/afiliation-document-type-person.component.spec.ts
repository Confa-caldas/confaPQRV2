import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfiliationDocumentTypePersonComponent } from './afiliation-document-type-person.component';

describe('AfiliationDocumentTypePersonComponent', () => {
  let component: AfiliationDocumentTypePersonComponent;
  let fixture: ComponentFixture<AfiliationDocumentTypePersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AfiliationDocumentTypePersonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfiliationDocumentTypePersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
