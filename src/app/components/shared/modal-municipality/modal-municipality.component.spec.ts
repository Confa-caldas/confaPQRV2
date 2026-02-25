import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMunicipalityComponent } from './modal-municipality.component';

describe('ModalMunicipalityComponent', () => {
  let component: ModalMunicipalityComponent;
  let fixture: ComponentFixture<ModalMunicipalityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalMunicipalityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalMunicipalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
