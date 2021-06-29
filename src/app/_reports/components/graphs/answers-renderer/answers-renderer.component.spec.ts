import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswersRendererComponent } from './answers-renderer.component';

describe('AnswersRendererComponent', () => {
  let component: AnswersRendererComponent;
  let fixture: ComponentFixture<AnswersRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswersRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswersRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
