import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupPageFreeComponent } from './group-page-free.component';

describe('GroupPageFreeComponent', () => {
  let component: GroupPageFreeComponent;
  let fixture: ComponentFixture<GroupPageFreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupPageFreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupPageFreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
