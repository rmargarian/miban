import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderAnswerComponent } from './order-answer.component';

describe('OrderAnswerComponent', () => {
  let component: OrderAnswerComponent;
  let fixture: ComponentFixture<OrderAnswerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderAnswerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
