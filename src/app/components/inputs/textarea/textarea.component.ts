import { Component, Input, AfterViewInit } from '@angular/core';
import { InputComponent } from '../input.component';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss', '../input.component.scss']
})
export class TextareaComponent extends InputComponent implements AfterViewInit {
  @Input() rowsCount = 4;
  @Input() labelText: string;

  stripHtml(title: string) {
    const temporalDivElement = document.createElement('div');
    temporalDivElement.innerHTML = title;
    return temporalDivElement.textContent || temporalDivElement.innerText || '';
  }

  ngAfterViewInit() {
    if (this.focus) {
      setTimeout(() => {
        (<any>this.inputElement.nativeElement).focus();
      });
    }
  }
}
