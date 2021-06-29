import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SbProfilesComponent } from './sb-profiles.component';

describe('SbProfilesComponent', () => {
  let component: SbProfilesComponent;
  let fixture: ComponentFixture<SbProfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbProfilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
