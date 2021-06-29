import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeCellRendererComponent } from './type-cell-renderer.component';

describe('TypeCellRendererComponent', () => {
  let component: TypeCellRendererComponent;
  let fixture: ComponentFixture<TypeCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypeCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
