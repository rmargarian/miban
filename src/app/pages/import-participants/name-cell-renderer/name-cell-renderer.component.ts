import { Component } from '@angular/core';
import { ICellRendererAngularComp, ITooltipAngularComp  } from 'ag-grid-angular';

import { nameRegex } from '@app/contants';

/**
 * Component renders emails in uploaded participants grid
 */
@Component({
  selector: 'app-name-cell-renderer',
  templateUrl: './name-cell-renderer.component.html',
  styleUrls: ['./name-cell-renderer.component.scss']
})
export class NameCellRendererComponent implements ICellRendererAngularComp, ITooltipAngularComp  {
  params: any;
  value: string = '';
  tooltip: string = '';
  tooltipClass: string = '';
  invalidField: boolean = false;

  constructor() { }

  agInit(params: any): void {
    this.params = params;

    if (!params.value) { return; }

    this.value = params.value;
    if (!nameRegex.test(this.value)) {
      this.invalidField = true;
      this.tooltip = 'Only [a-z,A-Z, -\' and space] are allowed';
      this.tooltipClass = 'error-tooltip no-wrap';
    }
  }

  /**
   * Required for implementation ICellRendererAngularComp interface
   */
  refresh(): boolean {
    return false;
  }

}
