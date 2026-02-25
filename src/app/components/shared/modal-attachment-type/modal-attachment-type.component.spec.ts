import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAttachmentTypeComponent } from './modal-attachment-type.component';

describe('ModalAttachmentTypeComponent', () => {
  let component: ModalAttachmentTypeComponent;
  let fixture: ComponentFixture<ModalAttachmentTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalAttachmentTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalAttachmentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
