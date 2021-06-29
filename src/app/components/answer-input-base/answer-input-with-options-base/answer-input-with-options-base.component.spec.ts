import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerInputWithOptionsBaseComponent } from './answer-input-with-options-base.component';

describe('AnswerInputWithOptionsBaseComponent', () => {
  let component: AnswerInputWithOptionsBaseComponent;
  let fixture: ComponentFixture<AnswerInputWithOptionsBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswerInputWithOptionsBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerInputWithOptionsBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
