import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemVariablesComponent } from './system-variables.component';

describe('SystemVariablesComponent', () => {
  let component: SystemVariablesComponent;
  let fixture: ComponentFixture<SystemVariablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SystemVariablesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
