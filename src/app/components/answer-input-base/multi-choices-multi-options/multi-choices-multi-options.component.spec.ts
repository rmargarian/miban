import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiChoicesMultiOptionsComponent } from './multi-choices-multi-options.component';

describe('MultiChoicesMultiOptionsComponent', () => {
  let component: MultiChoicesMultiOptionsComponent;
  let fixture: ComponentFixture<MultiChoicesMultiOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiChoicesMultiOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiChoicesMultiOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
