import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiChoicesSingleOptionComponent } from './multi-choices-single-option.component';

describe('MultiChoicesSingleOptionComponent', () => {
  let component: MultiChoicesSingleOptionComponent;
  let fixture: ComponentFixture<MultiChoicesSingleOptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiChoicesSingleOptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiChoicesSingleOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
