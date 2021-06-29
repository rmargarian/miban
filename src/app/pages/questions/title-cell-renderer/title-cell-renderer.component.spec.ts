import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleCellRendererComponent } from './title-cell-renderer.component';

describe('TitleCellRendererComponent', () => {
  let component: TitleCellRendererComponent;
  let fixture: ComponentFixture<TitleCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TitleCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TitleCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
