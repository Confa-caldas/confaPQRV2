import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTypePersonComponent } from './document-type-person.component';

describe('DocumentTypePersonComponent', () => {
  let component: DocumentTypePersonComponent;
  let fixture: ComponentFixture<DocumentTypePersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentTypePersonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DocumentTypePersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
