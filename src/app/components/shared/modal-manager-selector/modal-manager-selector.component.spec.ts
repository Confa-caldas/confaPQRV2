import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalManagerSelectorComponent } from './modal-manager-selector.component';

describe('ModalManagerSelectorComponent', () => {
  let component: ModalManagerSelectorComponent;
  let fixture: ComponentFixture<ModalManagerSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalManagerSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalManagerSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
