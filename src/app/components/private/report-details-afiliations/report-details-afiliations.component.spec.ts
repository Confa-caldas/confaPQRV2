import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportDetailsAfiliationsComponent } from './report-details-afiliations.component';
import { MessageService } from 'primeng/api';

describe('ReportDetailsAfiliationsComponent', () => {
  let component: ReportDetailsAfiliationsComponent;
  let fixture: ComponentFixture<ReportDetailsAfiliationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportDetailsAfiliationsComponent],
      providers: [MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportDetailsAfiliationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
