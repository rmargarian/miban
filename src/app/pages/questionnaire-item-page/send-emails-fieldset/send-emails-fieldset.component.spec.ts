import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendEmailsFieldsetComponent } from './send-emails-fieldset.component';

describe('SendEmailsFieldsetComponent', () => {
  let component: SendEmailsFieldsetComponent;
  let fixture: ComponentFixture<SendEmailsFieldsetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendEmailsFieldsetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendEmailsFieldsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
