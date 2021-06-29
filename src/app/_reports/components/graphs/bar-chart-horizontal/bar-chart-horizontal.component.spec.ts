import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChartHorizontalComponent } from './bar-chart-horizontal.component';

describe('BarChartHorizontalComponent', () => {
  let component: BarChartHorizontalComponent;
  let fixture: ComponentFixture<BarChartHorizontalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BarChartHorizontalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarChartHorizontalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
