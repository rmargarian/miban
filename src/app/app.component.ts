import { Component } from '@angular/core';
import { TooltipService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'PFA';

  constructor(private tooltipService: TooltipService) {
    this.tooltipService.init();
  }
}
