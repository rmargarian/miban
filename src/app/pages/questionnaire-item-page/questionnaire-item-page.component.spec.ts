import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireItemPageComponent } from './questionnaire-item-page.component';

describe('QuestionnaireItemPageComponent', () => {
  let component: QuestionnaireItemPageComponent;
  let fixture: ComponentFixture<QuestionnaireItemPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionnaireItemPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireItemPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
