import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalSuccessfulTransferComponent } from './modal-successful-transfer.component';

describe('ModalSuccessfulTransferComponent', () => {
  let component: ModalSuccessfulTransferComponent;
  let fixture: ComponentFixture<ModalSuccessfulTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalSuccessfulTransferComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalSuccessfulTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
