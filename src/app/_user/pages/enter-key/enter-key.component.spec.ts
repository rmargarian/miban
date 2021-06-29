import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterKeyComponent } from './enter-key.component';

describe('EnterKeyComponent', () => {
  let component: EnterKeyComponent;
  let fixture: ComponentFixture<EnterKeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterKeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
