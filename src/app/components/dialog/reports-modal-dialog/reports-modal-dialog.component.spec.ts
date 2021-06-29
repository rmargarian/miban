import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsModalDialogComponent } from './reports-modal-dialog.component';

describe('PreviewModalDialogComponent', () => {
  let component: ReportsModalDialogComponent;
  let fixture: ComponentFixture<ReportsModalDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportsModalDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsModalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
