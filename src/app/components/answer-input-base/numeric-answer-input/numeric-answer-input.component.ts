import { Component, Input, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { AnswerInputBaseComponent } from '@app/components/answer-input-base/answer-input-base.component';
import { FormControl } from '@angular/forms';
import { InputComponent } from '@app/components/inputs/input.component';

@Component({
  selector: 'app-numeric-answer-input',
  templateUrl: './numeric-answer-input.component.html',
  styleUrls: ['./numeric-answer-input.component.scss']
})
export class NumericAnswerInputComponent extends AnswerInputBaseComponent implements AfterViewInit, OnDestroy {

  @Input() currencyFormat: boolean;
  @ViewChild('inputComponent', { static: false }) inputComponent: InputComponent;

  ngAfterViewInit() {
    this.formatWithDots = this.formatWithDots.bind(this);
    this.inputComponent.inputElement.nativeElement.addEventListener('keydown', this.formatWithDots);
  }

  ngOnDestroy() {
    this.inputComponent.inputElement.nativeElement.removeEventListener('keydown', this.formatWithDots);
  }

  formatWithDots(e: KeyboardEvent) {
    // only if numbers or Backspace
    if (e.key.replace(/^[0-9]+$/g, '').length === 0 || e.keyCode === 8) {
      // The implementation of comma separators for currency
      // doesn't finished yet (After entering a number cursor jumps into the end of the value)
      return;
      if (!this.currencyFormat) return;

      setTimeout(() => {
        let value = (<HTMLInputElement>e.target).value;
        let dotFounded = true;
        while (dotFounded) {
          const dotIndex = value.indexOf(',');
          if (dotIndex !== -1) {
            const valueArr = value.split('');
            valueArr.splice(dotIndex, 1);
            value = valueArr.join('');
          } else {
            dotFounded = false;
          }
        }

        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        (<FormControl>this.control).setValue(value);
      });
    } else if (
      // Allow: backspace, delete, tab, escape, enter
      [46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+Z, Command+A
      ((e.keyCode === 65 || e.keyCode === 67 || e.keyCode === 90) && (e.ctrlKey === true || e.metaKey === true)) ||
      // Allow: home, end, left, right, down, up
      (e.keyCode >= 35 && e.keyCode <= 40)
    ) {
      // Prevent
    } else if (!e.key.replace(/[^\w\s]/gi, '').length 
           || (e.keyCode >= 60 && e.keyCode <= 90)
           || e.which === 163 || e.keyCode === 32) {
      e.preventDefault();
    }
  }
}
