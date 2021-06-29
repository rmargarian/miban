import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumericAnswerInputComponent } from './numeric-answer-input.component';

describe('NumericAnswerInputComponent', () => {
  let component: NumericAnswerInputComponent;
  let fixture: ComponentFixture<NumericAnswerInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumericAnswerInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumericAnswerInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
