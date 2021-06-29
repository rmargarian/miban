import { Component, Input, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { ButtonComponent } from '../button.component';

@Component({
  selector: 'app-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['../button.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IconButtonComponent extends ButtonComponent implements AfterViewInit {

  @Input() iconClass: string;
  @Input() faIconClass: string;
  @Input() imgSrc: string;
  @Input() label: string;
  @Input() tooltipPosition: string;
  @Input() pressed: boolean;

  ngAfterViewInit() {
    setTimeout(() => {
      this.tooltipDelay = 1000;
    });
  }
  /**
   * To prevent the button from receiving focus on click
   * @param $event (MouseEvent)
   */
  mouseDown($event: MouseEvent) {
    $event.preventDefault();
  }
}
