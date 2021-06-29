import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerInputBaseComponent } from './answer-input-base.component';

describe('AnswerInputBaseComponent', () => {
  let component: AnswerInputBaseComponent;
  let fixture: ComponentFixture<AnswerInputBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswerInputBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerInputBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
