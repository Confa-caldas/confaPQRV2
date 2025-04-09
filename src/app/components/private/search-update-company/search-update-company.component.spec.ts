import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchUpdateCompanyComponent } from './search-update-company.component';

describe('SearchUpdateCompanyComponent', () => {
  let component: SearchUpdateCompanyComponent;
  let fixture: ComponentFixture<SearchUpdateCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchUpdateCompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchUpdateCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
