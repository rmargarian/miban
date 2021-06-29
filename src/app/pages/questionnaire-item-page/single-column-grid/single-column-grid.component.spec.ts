import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleColumnGridComponent } from './single-column-grid.component';

describe('SingleColumnGridComponent', () => {
  let component: SingleColumnGridComponent;
  let fixture: ComponentFixture<SingleColumnGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleColumnGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleColumnGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
