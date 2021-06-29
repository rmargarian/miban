import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationEmailsComponent } from './invitation-emails.component';

describe('InvitationEmailsComponent', () => {
  let component: InvitationEmailsComponent;
  let fixture: ComponentFixture<InvitationEmailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvitationEmailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitationEmailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
