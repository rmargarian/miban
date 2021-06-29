import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectKeyToMoveComponent } from './select-key-to-move.component';

describe('SelectKeyToMoveComponent', () => {
  let component: SelectKeyToMoveComponent;
  let fixture: ComponentFixture<SelectKeyToMoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectKeyToMoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectKeyToMoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
