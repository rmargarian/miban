import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartFreeAttemptComponent } from './start-free-attempt.component';

describe('StartFreeAttemptComponent', () => {
  let component: StartFreeAttemptComponent;
  let fixture: ComponentFixture<StartFreeAttemptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartFreeAttemptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartFreeAttemptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
