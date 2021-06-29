import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit {
  @Input() rangeInterval: number;
  @Input() rangeFromValue: number;
  @Input() rangeToValue: number;
  @Input() displayValuesTooltips: boolean;
  @Input() control: AbstractControl;
  @Input() labelFormatter = (v) => v;

  ngOnInit() {
  }
}

