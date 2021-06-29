import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncompleteAttemptsComponent } from './incomplete-attempts.component';

describe('IncompleteAttemptsComponent', () => {
  let component: IncompleteAttemptsComponent;
  let fixture: ComponentFixture<IncompleteAttemptsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncompleteAttemptsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncompleteAttemptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
