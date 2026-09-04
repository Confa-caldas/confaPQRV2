import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchRequestAfiMassiveComponent } from './search-request-afi-massive.component';

describe('SearchRequestAfiMassiveComponent', () => {
  let component: SearchRequestAfiMassiveComponent;
  let fixture: ComponentFixture<SearchRequestAfiMassiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchRequestAfiMassiveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchRequestAfiMassiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
