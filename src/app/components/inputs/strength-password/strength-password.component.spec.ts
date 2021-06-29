import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrengthPasswordComponent } from './strength-password.component';

describe('StrengthPasswordComponent', () => {
  let component: StrengthPasswordComponent;
  let fixture: ComponentFixture<StrengthPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrengthPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrengthPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
