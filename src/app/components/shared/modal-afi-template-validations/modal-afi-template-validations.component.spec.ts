import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAfiTemplateValidationsComponent } from './modal-afi-template-validations.component';

describe('ModalAfiTemplateValidationsComponent', () => {
  let component: ModalAfiTemplateValidationsComponent;
  let fixture: ComponentFixture<ModalAfiTemplateValidationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalAfiTemplateValidationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalAfiTemplateValidationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
