import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDocumentTypeComponent } from './modal-document-type.component';

describe('ModalDocumentTypeComponent', () => {
  let component: ModalDocumentTypeComponent;
  let fixture: ComponentFixture<ModalDocumentTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalDocumentTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalDocumentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
