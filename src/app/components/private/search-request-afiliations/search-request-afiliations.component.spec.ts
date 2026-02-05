import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchRequestAfiliationsComponent } from './search-request-afiliations.component';

describe('SearchRequestAfiliationsComponent', () => {
  let component: SearchRequestAfiliationsComponent;
  let fixture: ComponentFixture<SearchRequestAfiliationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchRequestAfiliationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchRequestAfiliationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
