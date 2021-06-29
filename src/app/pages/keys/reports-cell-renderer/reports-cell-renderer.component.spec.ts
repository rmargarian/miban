import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsCellRendererComponent } from './reports-cell-renderer.component';

describe('ReportsCellRendererComponent', () => {
  let component: ReportsCellRendererComponent;
  let fixture: ComponentFixture<ReportsCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportsCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
