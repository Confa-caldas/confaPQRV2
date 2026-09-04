import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAssignAfiliationSelectorComponent } from './modal-assign-afiliation-selector.component';

describe('ModalAssignAfiliationSelectorComponent', () => {
  let component: ModalAssignAfiliationSelectorComponent;
  let fixture: ComponentFixture<ModalAssignAfiliationSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalAssignAfiliationSelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalAssignAfiliationSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
