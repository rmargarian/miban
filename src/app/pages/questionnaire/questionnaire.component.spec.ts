import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnairePageComponent } from './questionnaire.component';

describe('ProfilesComponent', () => {
  let component: QuestionnairePageComponent;
  let fixture: ComponentFixture<QuestionnairePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionnairePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnairePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
