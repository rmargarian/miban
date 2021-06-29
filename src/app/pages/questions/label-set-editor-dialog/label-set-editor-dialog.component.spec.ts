import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelSetEditorDialogComponent } from './label-set-editor-dialog.component';

describe('LabelSetEditorDialogComponent', () => {
  let component: LabelSetEditorDialogComponent;
  let fixture: ComponentFixture<LabelSetEditorDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelSetEditorDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelSetEditorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
