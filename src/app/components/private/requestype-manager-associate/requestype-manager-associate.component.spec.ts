import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestypeManagerAssociateComponent } from './requestype-manager-associate.component';

describe('RequestypeManagerAssociateComponent', () => {
  let component: RequestypeManagerAssociateComponent;
  let fixture: ComponentFixture<RequestypeManagerAssociateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestypeManagerAssociateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestypeManagerAssociateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
