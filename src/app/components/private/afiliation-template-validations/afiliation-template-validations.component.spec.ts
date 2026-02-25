import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfiliationTemplateValidationsComponent } from './afiliation-template-validations.component';

describe('AfiliationTemplateValidationsComponent', () => {
  let component: AfiliationTemplateValidationsComponent;
  let fixture: ComponentFixture<AfiliationTemplateValidationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AfiliationTemplateValidationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfiliationTemplateValidationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
