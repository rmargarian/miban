import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageUnfoundComponent } from './page-unfound.component';

describe('PageUnfoundComponent', () => {
  let component: PageUnfoundComponent;
  let fixture: ComponentFixture<PageUnfoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageUnfoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageUnfoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
