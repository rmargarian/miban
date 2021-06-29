import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireAddPageComponent } from './questionnaire-add-page.component';

describe('QuestionnaireAddPageComponent', () => {
  let component: QuestionnaireAddPageComponent;
  let fixture: ComponentFixture<QuestionnaireAddPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionnaireAddPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireAddPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
