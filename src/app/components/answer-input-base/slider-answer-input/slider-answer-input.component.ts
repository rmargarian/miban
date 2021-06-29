import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AnswerInputBaseComponent } from '@app/components/answer-input-base/answer-input-base.component';
import { SliderMode } from '@app/enums/slider-type';
import { FormControl, AbstractControl } from '@angular/forms';
import { SliderTag } from '@app/components/answer-input-base/slider-answer-input/index';


@Component({
  selector: 'app-slider-answer-input',
  templateUrl: './slider-answer-input.component.html',
  styleUrls: ['./slider-answer-input.component.scss']
})
export class SliderAnswerInputComponent extends AnswerInputBaseComponent implements OnInit, OnDestroy {
  @Input() sliderMode;
  @Input() rangeInterval: number;
  @Input() rangeFromValue: number;
  @Input() rangeToValue: number;
  @Input() rangeFromTag;
  @Input() rangeToTag;
  @Input() displayLabels: boolean;
  @Input() displayValuesTooltips: boolean;
  @Input() displayValuesPercentage: boolean;
  @Input() sliderTags: SliderTag[];
  public innerControl: AbstractControl;
  public SliderMode = SliderMode;

  sliderLabelFormatter;

  private innerControlSub;

  ngOnInit() {
    this.checkSliderType(this.sliderMode);
    if (this.displayValuesPercentage) {
      this.sliderLabelFormatter = (v: any) => this.calcValueToPercentage(this.rangeFromValue, this.rangeToValue, v) + '%';
    } else if (this.sliderMode === SliderMode.CUSTOM) {
      this.sliderLabelFormatter = (v: any) => this.findValueFromLabels(v);
    } else {
      this.sliderLabelFormatter = (v) => {
        return v === 0 ? this.rangeFromValue : v;
      }
    }
  }

  private calcValueToPercentage(min, max, currentValue): string {
    if (currentValue === 0) {
      return '0';
    }
    const res = ((currentValue - min) * 100) / (max - min);
    return res.toFixed();

  }

  private findValueFromLabels(currentIndex: number): string {
    return this.sliderTags[currentIndex].value;
  }

  private checkSliderType(type: SliderMode) {
    switch (type) {
      case SliderMode.CUSTOM : {
        let value;
        if (this.control.value) {
          const indexTag = this.sliderTags.indexOf(this.control.value);
          if (indexTag !== -1) {
            value = indexTag;
          } else {
            console.error('FormControl value is not present in @Input() sliderTags array');
          }
        }

        this.innerControl = new FormControl(value);
        this.innerControlSub = this.innerControl.valueChanges.subscribe(val => {
          const sliderTag = this.sliderTags[val];
          this.control.setValue(sliderTag);
        });
        this.rangeFromValue = 0;
        this.rangeToValue = this.sliderTags.length - 1;
        this.rangeInterval = 1;
        break;
      }
      case SliderMode.RANGE: {
        this.innerControl = this.control;
        break;
      }
    }
  }

  ngOnDestroy() {
    if (this.innerControlSub) this.innerControlSub.unsubscribe();
  }
}
