import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDocumentTypePersonComponent } from './modal-document-type-person.component';

describe('ModalDocumentTypePersonComponent', () => {
  let component: ModalDocumentTypePersonComponent;
  let fixture: ComponentFixture<ModalDocumentTypePersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalDocumentTypePersonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalDocumentTypePersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
