import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInputDocumentComponent } from './modal-input-document.component';

describe('ModalInputDocumentComponent', () => {
  let component: ModalInputDocumentComponent;
  let fixture: ComponentFixture<ModalInputDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalInputDocumentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalInputDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
