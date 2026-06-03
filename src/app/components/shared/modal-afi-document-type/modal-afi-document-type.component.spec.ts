import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAfiDocumentTypeComponent } from './modal-afi-document-type.component';

describe('ModalAfiDocumentTypeComponent', () => {
  let component: ModalAfiDocumentTypeComponent;
  let fixture: ComponentFixture<ModalAfiDocumentTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalAfiDocumentTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalAfiDocumentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
