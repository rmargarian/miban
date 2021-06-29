import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

import { Keys } from '@app/models';
import { emailRegex } from '@app/contants';

/**
 * Component renders emails in uploaded participants grid
 */
@Component({
  selector: 'app-email-cell-renderer',
  templateUrl: './email-cell-renderer.component.html',
  styleUrls: ['./email-cell-renderer.component.scss']
})
export class EmailCellRendererComponent implements ICellRendererAngularComp {

  params: any;
  companyId: Keys;
  value: string = '';
  tooltip: string = '';
  tooltipClass: string = '';
  differentKey: boolean = false;
  isRepeated: boolean = false;
  invalidField: boolean = false;

  constructor() { }

  agInit(params: any): void {
    this.params = params;
    this.value = params.data.email;
    this.companyId = params.context.componentParent.companyId;
    if (params.data.company) {
      const company = params.data.company;
      this.tooltip = `Belongs to "${company.company_key}"`;
      if (this.companyId !== company.id) {
        this.differentKey = true;
      }
    }

    const email = params.data.email;
    this.tooltipClass = 'no-wrap';
    if (params.data.isRepeated) {
      this.isRepeated = true;
      this.tooltip = 'Repeated email';
    } else if (email && !emailRegex.test(email)) {
      this.invalidField = true;
      this.tooltip = 'Invalid email';
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
