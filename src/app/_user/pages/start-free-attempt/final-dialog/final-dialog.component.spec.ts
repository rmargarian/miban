import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalDialogComponent } from './final-dialog.component';

describe('RegDialogComponent', () => {
  let component: FinalDialogComponent;
  let fixture: ComponentFixture<FinalDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
