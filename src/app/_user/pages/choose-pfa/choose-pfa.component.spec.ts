import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoosePFAComponent } from './choose-pfa.component';

describe('ChoosePFAComponent', () => {
  let component: ChoosePFAComponent;
  let fixture: ComponentFixture<ChoosePFAComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChoosePFAComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoosePFAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
