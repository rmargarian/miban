import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextAnswerInputComponent } from './text-answer-input.component';

describe('TextAnswerInputComponent', () => {
  let component: TextAnswerInputComponent;
  let fixture: ComponentFixture<TextAnswerInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextAnswerInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextAnswerInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
