import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../button.component';

@Component({
  selector: 'app-text-button',
  templateUrl: './text-button.component.html',
  styleUrls: ['../button.component.scss']
})
export class TextButtonComponent extends ButtonComponent {
  @Input() text: string;

  /**
   * To prevent the button from receiving focus on click
   * @param $event (MouseEvent)
   */
  mouseDown($event: MouseEvent) {
    //$event.preventDefault();
  }
}
