import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGestionarActivacionEmpresaComponent } from './modal-gestionar-activacion-empresa.component';

describe('ModalGestionarActivacionEmpresaComponent', () => {
  let component: ModalGestionarActivacionEmpresaComponent;
  let fixture: ComponentFixture<ModalGestionarActivacionEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalGestionarActivacionEmpresaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalGestionarActivacionEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
