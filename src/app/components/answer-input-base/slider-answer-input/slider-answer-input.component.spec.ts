import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderAnswerInputComponent } from './slider-answer-input.component';

describe('SliderAnswerInputComponent', () => {
  let component: SliderAnswerInputComponent;
  let fixture: ComponentFixture<SliderAnswerInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SliderAnswerInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderAnswerInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
