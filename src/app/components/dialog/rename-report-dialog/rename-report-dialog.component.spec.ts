import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenameReportDialogComponent } from './rename-report-dialog.component';

describe('RenameReportDialogComponent', () => {
  let component: RenameReportDialogComponent;
  let fixture: ComponentFixture<RenameReportDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenameReportDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenameReportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
