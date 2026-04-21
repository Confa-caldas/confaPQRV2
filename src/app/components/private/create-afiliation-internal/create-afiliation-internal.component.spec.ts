import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';

import { CreateAfiliationInternalComponent } from './create-afiliation-internal.component';
import { BodyResponse } from '../../../models/shared/body-response.inteface';
import { DocumentTypeCompanyList, DocumentTypePersonList } from '../../../models/users.interface';
import { AfiliacionInternaService } from '../../../services/afiliacion-interna.service';
import { Users } from '../../../services/users.service';

describe('CreateAfiliationInternalComponent', () => {
  let component: CreateAfiliationInternalComponent;
  let fixture: ComponentFixture<CreateAfiliationInternalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CreateAfiliationInternalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Title, useValue: { setTitle: () => {} } },
        MessageService,
        {
          provide: AfiliacionInternaService,
          useValue: {
            validarEmpresa: () =>
              of({
                code: 200,
                message: 'OK',
                data: {
                  exitoso: true,
                  puedeContinuar: true,
                  mensaje: null,
                  datosEmpresa: { razonSocial: 'Empresa prueba' },
                },
              }),
            validarTrabajador: () =>
              of({
                code: 200,
                message: 'OK',
                data: {
                  puedeContinuar: true,
                  datosFormulario: { personalInfo: {} },
                  camposVisibles: {},
                },
              }),
          },
        },
        {
          provide: Users,
          useValue: {
            getDocumentoTypeCompanyListPagination: () =>
              of<BodyResponse<DocumentTypeCompanyList[]>>({
                code: 200,
                data: [],
                message: '0',
              }),
            getDocumentoTypePersonListPagination: () =>
              of<BodyResponse<DocumentTypePersonList[]>>({
                code: 200,
                data: [],
                message: '0',
              }),
            getGeneroList: () => of({ code: 200, data: [], message: '0' }),
            getEstadoCivilList: () => of({ code: 200, data: [], message: '0' }),
            getDepartmentList: () => of({ code: 200, data: [], message: '0' }),
            getMunicipalityListPagination: () => of({ code: 200, data: [], message: '0' }),
          },
        },
      ],
    }).compileComponents();
    
    fixture = TestBed.createComponent(CreateAfiliationInternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
