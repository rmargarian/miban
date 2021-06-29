import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { GridOptions, ColDef } from 'ag-grid-community';
import { Subject } from 'rxjs';

import { EmailCellRendererComponent } from '../email-cell-renderer/email-cell-renderer.component';
import { DateCellRendererComponent } from '../date-cell-renderer/date-cell-renderer.component';
import { NameCellRendererComponent } from '../name-cell-renderer/name-cell-renderer.component';
import { User, Keys } from '@app/models';
import { gridComparator } from '@app/utils';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit, OnDestroy {
  @Input() companyId: Keys;
  private _data: User[] = [];
  @Input()
  set data(data: User[]) {
    if (!data) { return; }
    const d = JSON.parse(JSON.stringify(data));
    const repeated: string[] = [];
    d.forEach((user: User, i: number) => {
      const obj = d.find((u: User, j: number) => j !== i && u.email === user.email);
      if (obj) { repeated.push(user.email); }
    });
    d.forEach((user: User, i: number) => {
      const obj = repeated.find((email: string) => email === user.email);
      if (obj) { user.isRepeated = true; }
    });
    this._data = d;
    this.renderGrid();
  }
  get data(): User[] {
    return this._data;
  }
  @Input() isResult: boolean = false;

  gridContainerId = 'grid_container';
  context: any;
  frameworkComponents: any;
  columnDefs: ColDef[] = [];
  gridOptions: GridOptions;
  private destroySubject$: Subject<void> = new Subject();

  constructor() {
    this.context = {componentParent: this};
    this.frameworkComponents = {
      emailCellRenderer: EmailCellRendererComponent,
      dateCellRenderer: DateCellRendererComponent,
      nameCellRenderer: NameCellRendererComponent
    };
  }

  ngOnInit() {
    this.gridContainerId += this.isResult ? 2 : 1;
    this.gridOptions = {
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: false,
        comparator: gridComparator
      },
      rowHeight: 22,
      headerHeight: 22,
      domLayout: 'autoHeight',
      onGridSizeChanged: () => {
        this.renderGrid();
      },
    };

    this.columnDefs = [
      {headerName: 'Name', field: 'first_name', minWidth: 60, cellRenderer: 'nameCellRenderer',
        cellClassRules: {'overflow-unset': () => true, 'required': this.checkIfEmpty}},
      {headerName: 'Last Name', field: 'last_name', minWidth: 60, cellRenderer: 'nameCellRenderer',
        cellClassRules: {'overflow-unset': () => true, 'required': this.checkIfEmpty}},
      {headerName: 'Email', field: 'email', minWidth: 60, width: 300, cellRenderer: 'emailCellRenderer',
        cellClassRules: {'overflow-unset': () => true,
        'required': this.checkIfEmpty, 'green': this.checkIfExists}},
      {headerName: 'Job Title', field: 'job_title', minWidth: 60},
      {headerName: 'Department', field: 'department', minWidth: 60},
      {headerName: 'Manager', field: 'manager_name', minWidth: 60},
      {headerName: 'Password', field: 'passwd', minWidth: 60},
      {headerName: 'Date', field: 'p_date', minWidth: 60,
        cellRenderer: 'dateCellRenderer', cellClassRules: {'overflow-unset': () => true}},
      {headerName: 'Location', field: 'p_location', minWidth: 60}
    ];
  }

  ngOnDestroy() {
    this.destroySubject$.next();
  }

  /**
   * Refresh grid
   */
  private renderGrid() {
    if (this.gridOptions && this.gridOptions.api) {
      if (this.data && this.data.length > 7) {
        document.getElementById(this.gridContainerId).style.height = '178px';
        this.gridOptions.api.setDomLayout('normal');
      } else {
        document.getElementById(this.gridContainerId).style.height = 'auto';
        this.gridOptions.api.setDomLayout('autoHeight');
      }
      this.gridOptions.api.refreshCells();
      this.gridOptions.api.sizeColumnsToFit();
    }
  }

  /**
   * Returns true if cell is empty
   * @param params (Object: ag-grid cell data)
   */
  checkIfEmpty(params: any): boolean {
    return params.value ? false : true;
  }

  /**
   * Returns true if email exists (user has 'id')
   * @param params (Object: ag-grid cell data)
   */
  checkIfExists(params: any): boolean {
    return params.data.id ? true : false;
  }

}
