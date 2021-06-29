import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphTypeCellRendererComponent } from './graph-type-cell-renderer.component';

describe('GraphTypeCellRendererComponent', () => {
  let component: GraphTypeCellRendererComponent;
  let fixture: ComponentFixture<GraphTypeCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphTypeCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphTypeCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
