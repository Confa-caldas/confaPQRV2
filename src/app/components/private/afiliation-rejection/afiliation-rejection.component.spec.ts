import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Users } from '../../../services/users.service';
import { AfiliationRejectionComponent } from './afiliation-rejection.component';

describe('AfiliationRejectionComponent', () => {
  let component: AfiliationRejectionComponent;
  let fixture: ComponentFixture<AfiliationRejectionComponent>;

  beforeEach(async () => {
    const usersSpy = jasmine.createSpyObj('Users', ['getAfiMotivoRechazoListPagination']);
    usersSpy.getAfiMotivoRechazoListPagination.and.returnValue(
      of({ code: 200, data: [], message: '0' })
    );
    await TestBed.configureTestingModule({
      declarations: [AfiliationRejectionComponent],
      providers: [{ provide: Users, useValue: usersSpy }, MessageService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    
    fixture = TestBed.createComponent(AfiliationRejectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
