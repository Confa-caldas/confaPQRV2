import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAfiDocumentTypePersonComponent } from './modal-afi-document-type-person.component';

describe('ModalAfiDocumentTypePersonComponent', () => {
  let component: ModalAfiDocumentTypePersonComponent;
  let fixture: ComponentFixture<ModalAfiDocumentTypePersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalAfiDocumentTypePersonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalAfiDocumentTypePersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
