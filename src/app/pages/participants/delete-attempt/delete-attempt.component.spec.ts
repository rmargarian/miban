import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAttemptComponent } from './delete-attempt.component';

describe('DeleteAttemptComponent', () => {
  let component: DeleteAttemptComponent;
  let fixture: ComponentFixture<DeleteAttemptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteAttemptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteAttemptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
