import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-select-all-renderer',
  templateUrl: './select-all-renderer.component.html',
  styleUrls: ['./select-all-renderer.component.scss']
})
export class SelectAllRendererComponent implements ICellRendererAngularComp {
  params: any;
  checked = false;

  constructor() { }

  agInit(params: any): void {
    this.params = params;
  }

  /**
   * Call this.selectDeselectAll() method from ParticipantsComponent
   */
  invokeParentMethod() {
    this.params.context.componentParent.selectDeselectAll(this.checked);
  }

  onClicked($event: Event) {
    this.checked = !this.checked;
    this.invokeParentMethod();
  }

  /**
   * Required for implementation ICellRendererAngularComp interface
   */
  refresh(): boolean {
    return false;
  }

}
