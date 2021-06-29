import {Component, OnInit, OnChanges, Output, Input, ViewChild, EventEmitter, SimpleChanges} from '@angular/core';
import {AgGridNg2} from 'ag-grid-angular';
import {GridOptions} from 'ag-grid-community';

import {fromIsoDate, gridComparator} from '@app/utils';
import {ReportGridTypes} from '@app/enums';

@Component({
  selector: 'app-single-column-grid',
  templateUrl: './single-column-grid.component.html',
  styleUrls: ['./single-column-grid.component.scss']
})
export class SingleColumnGridComponent implements OnInit, OnChanges {

  @Input() type: string;
  @Input() headerTitle: string;
  @Input() disableGridSort: boolean;
  @Input() selectedRows: string[];
  @Input() rowMultiSelect: boolean = true;
  @Input() suppressHorizontalScroll: boolean = false;
  private _data: any[] = [];
  @Input()
  set data(data: any[]) {
    this._data = data;
    this.setDataSource();
  }

  get data(): any[] {
    return this._data;
  }

  @Output() filterChanged = new EventEmitter();

  @ViewChild('agGrid', { static: false }) agGrid: AgGridNg2;
  rowData: any[] = [];
  columnDefs: any[] = [];
  gridOptions: GridOptions;

  constructor() {
  }

  ngOnInit() {
    this.gridOptions = {
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        comparator: gridComparator
      },
      rowData: this.rowData,
      columnDefs: this.columnDefs,
      onRowClicked: this.onSelectionChanged.bind(this),
      suppressLoadingOverlay: true,
      rowHeight: 22,
      headerHeight: 22,
      onGridReady: () => {
        if (this.rowData.length && !this.gridOptions.rowData) {
          this.renderGrid();
        }
      }
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedRows && changes.selectedRows.currentValue && this.gridOptions) {
      this.setSelectedRows(changes.selectedRows.currentValue);
    }
  }

  /**
   * Initiates Grid data
   * If grid contains not Date format data (Locations/Groups/Saved from participants table)
   */
  private setDataSource() {
    this.rowData = [];
    this.data.forEach((value: any) => {
      if (value) {
        this.rowData.push({value: value});
      }

    });

    if (this.type === ReportGridTypes.LAST_ATTEMPT || this.type === ReportGridTypes.P_DATE) {
      this.columnDefs = [
        {
          headerName: this.headerTitle ? this.headerTitle : this.type,
          minWidth: 60,
          width: 138,
          field: 'value',
          sort: !this.disableGridSort ? 'desc' : undefined,
          cellRenderer: this.dateFormatter
        }
      ];
    } else {
      this.columnDefs = [
        {
          headerName: this.headerTitle ? this.headerTitle : this.type,
          minWidth: 60,
          width: 138,
          field: 'value',
          sort: !this.disableGridSort ? 'asc' : undefined
        }
      ];
    }

    if (this.gridOptions && this.gridOptions.api) {
      this.renderGrid();
    }
  }

  private isDateInArray(needle, haystack) {
    for (var i = 0; i < haystack.length; i++) {
      if (needle.getTime() === haystack[i].getTime()) {
        return true;
      }
    }
    return false;
  }

  private renderGrid() {
    this.gridOptions.api.setRowData(this.rowData);
    this.gridOptions.api.setColumnDefs(this.columnDefs);
    this.setSelectedRows(this.selectedRows);
  }

  private setSelectedRows(selectedRows) {
    this.gridOptions.api.forEachNode((node) => {
      node.setSelected(selectedRows.includes(node.data.value));
    });
  }

  onSelectionChanged(event) {
    this.filterChanged.emit({
      type: this.type,
      values: this.getSelectedRows(),
      isSelected: event.node.isSelected(),
      clickedRowData: event.data
    });
  }

  private getSelectedRows() {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    return selectedData;
  }

  /**
   * Returns Formated date from ISO to format('DD-MMM-YY')
   */
  private dateFormatter(param: any) {
    if (!param) return '';
    return fromIsoDate(param.value);
  }

}
