import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

import { fromIsoDate } from '@app/utils';

/**
 * Component renders emails in uploaded participants grid
 */
@Component({
  selector: 'app-date-cell-renderer',
  templateUrl: './date-cell-renderer.component.html',
  styleUrls: ['./date-cell-renderer.component.scss']
})
export class DateCellRendererComponent implements ICellRendererAngularComp {
  params: any;
  value = '';
  tooltip = '';
  invalidField: boolean = false;

  constructor() { }

  agInit(params: any): void {
    this.params = params;

    if (!params.value) { return; }

    if (params.context.componentParent.isResult) {
      this.value = this.dateFormatter(params);
      return;
    }

    this.value = params.data.p_date;
    const parts = params.data.p_date.toString().split('/');
    const timestamp = Date.parse(parts[1] + '/' + parts[0] + '/' + parts[2]);
    if (isNaN(timestamp)) {
      this.invalidField = true;
      this.tooltip = 'Date must have d/m/Y format';
    }
  }

  /**
   * Returns Formated date from ISO to format('DD-MMM-YY')
   * @param params (Grid element)
   */
  private dateFormatter(params: any) {
    if (!params.value) {
      return '';
    }
    return fromIsoDate(params.value);
  }

  /**
   * Required for implementation ICellRendererAngularComp interface
   */
  refresh(): boolean {
    return false;
  }

}
