import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeKeyPageComponent } from './change-key-page.component';

describe('ChangeKeyPageComponent', () => {
  let component: ChangeKeyPageComponent;
  let fixture: ComponentFixture<ChangeKeyPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeKeyPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeKeyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
