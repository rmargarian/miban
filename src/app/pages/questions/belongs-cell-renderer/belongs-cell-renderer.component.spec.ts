import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BelongsCellRendererComponent } from './belongs-cell-renderer.component';

describe('BelongsCellRendererComponent', () => {
  let component: BelongsCellRendererComponent;
  let fixture: ComponentFixture<BelongsCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BelongsCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BelongsCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
