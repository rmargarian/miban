import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionsTabComponent } from './questions-tab.component';

describe('QuestionsTabComponent', () => {
  let component: QuestionsTabComponent;
  let fixture: ComponentFixture<QuestionsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionsTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
