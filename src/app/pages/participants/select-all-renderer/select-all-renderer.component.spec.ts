import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectAllRendererComponent } from './select-all-renderer.component';

describe('SelectAllRendererComponent', () => {
  let component: SelectAllRendererComponent;
  let fixture: ComponentFixture<SelectAllRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectAllRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectAllRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
