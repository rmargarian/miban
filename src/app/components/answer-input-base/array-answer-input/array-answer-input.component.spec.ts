import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrayAnswerInputComponent } from './array-answer-input.component';

describe('ArrayAnswerInputComponent', () => {
  let component: ArrayAnswerInputComponent;
  let fixture: ComponentFixture<ArrayAnswerInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArrayAnswerInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArrayAnswerInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
