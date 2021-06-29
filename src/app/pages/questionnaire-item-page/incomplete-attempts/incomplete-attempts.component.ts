import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { AgGridNg2 } from 'ag-grid-angular';
import { GridOptions } from 'ag-grid-community';
import { Observable, Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';

import {
  RootStoreState,
  IncompleteAttemptStoreActions,
  IncompleteAttemptStoreSelectors
} from '@app/root-store';

import { SelectAllRendererComponent } from '@app/pages/participants/select-all-renderer/select-all-renderer.component';
import { fromIsoDate, getBrowserName, dateComparator, gridComparator } from '@app/utils';
import {
  IncompleteAttempt,
  Questionnaire
} from '@app/models';

import { IncompleteAttemptStatus } from '@app/enums';

@Component({
  selector: 'app-incomplete-attempts',
  templateUrl: './incomplete-attempts.component.html',
  styleUrls: ['./incomplete-attempts.component.scss']
})
export class IncompleteAttemptsComponent implements OnInit, OnDestroy {

  @ViewChild('agGrid', { static: false }) agGrid: AgGridNg2;
  @Input() questionnaire: Questionnaire;
  @Input() selectedIds: number[];

  attempts_count = 0;

  rowData: IncompleteAttempt[] = [];
  context: any;
  frameworkComponents: any;
  columnDefs: any[];
  gridOptions: GridOptions;
  selectedRowsCount = 0;

  isLoading$: Observable<boolean>;
  loading: boolean;
  private destroySubject$: Subject<void> = new Subject();

  constructor(private store$: Store<RootStoreState.State>) {
    this.context = { componentParent: this };
    this.frameworkComponents = {
      selectAllRenderer: SelectAllRendererComponent
    };

  }

  ngOnInit() {
    this.columnDefs = [
      {
        headerName: '#', width: 40, minWidth: 40, checkboxSelection: true, suppressMenu: true,
        sortable: false, resizable: false, pinned: true, headerComponent: 'selectAllRenderer'
      },
      {
        headerName: 'Date', minWidth: 60, field: 'createdAt', cellRenderer: this.dateFormatter,
        comparator: dateComparator, sort: 'desc'
      },
      { headerName: 'Status', minWidth: 60, field: 'status', cellRenderer: this.statusFormatter },
      { headerName: 'Country', minWidth: 60, field: 'country' },
      { headerName: 'State', minWidth: 60, field: 'state' },
      { headerName: 'City', minWidth: 60, field: 'city' },
      { headerName: 'IP', minWidth: 60, width: 60, field: 'ip' },
      { headerName: 'Browser', minWidth: 60, field: 'browser', cellRenderer: this.browserFormatter },
      { headerName: 'Responses', minWidth: 60, field: 'responses' }
    ];
    this.isLoading$ = this.store$.select(IncompleteAttemptStoreSelectors.selectIncompleteAttemptLoading);

    this.gridOptions = {
      rowData: null,
      onSelectionChanged: this.onSelectionChanged.bind(this),
      suppressLoadingOverlay: true,
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        comparator: gridComparator
      },
      onGridReady: () => {
        this.gridOptions.api.setColumnDefs(this.columnDefs);
        this.gridOptions.api.sizeColumnsToFit();
        if (this.rowData.length && !this.gridOptions.rowData) {
          this.renderGrid();
        }
      },
      onSortChanged: () => {
       // this.store$.dispatch(new UserStoreActions.SetSortColumnAction(<SortColumn>this.gridOptions.api.getSortModel()[0]));
      }
    };

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(IncompleteAttemptStoreSelectors.selectIncompleteAttemptAttempts)
    ).subscribe((attempts: IncompleteAttempt[]) => {
      if (!attempts) { return; }
      this.rowData = attempts;
      this.attempts_count = attempts.length;
      this.renderGrid();
    });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  private getSelectedRows() {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    return selectedData;
  }


  private renderGrid() {
    if (!this.gridOptions.api) {
      return;
    }
    this.gridOptions.api.setRowData(this.rowData);

    this.gridOptions.api.forEachNode((node) => {
      this.selectedIds.forEach((id: number) => {
        if (node.data.id === id) {
          node.setSelected(true);
        }
      });
    });

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

  private statusFormatter(params: any) {
    if (params.value === null) {
      return '';
    }
    return params.value === IncompleteAttemptStatus.COMPLETED ? 'completed' : 'started';
  }

  private browserFormatter(params: any) {
    if (params.value === null) {
      return 'unknown';
    }

    return getBrowserName(params.value);
  }

  onSelectionChanged(event) {
    this.selectedRowsCount = event.api.getSelectedNodes().length;
    if (this.selectedRowsCount) {
      const firstIndex = event.api.getSelectedNodes()[0].rowIndex;
      this.gridOptions.api.ensureIndexVisible(firstIndex);
    }
    const rowData = this.getSelectedRows();
    const ids = [];
    rowData.forEach((attempt: IncompleteAttempt) => {
      ids.push(attempt.id);
    });
    this.selectedIds = ids;
    this.store$.dispatch(new IncompleteAttemptStoreActions.SetSelectedIdsAction(ids));
  }

  selectDeselectAll(doSelect: boolean) {
    if (doSelect) {
      this.gridOptions.api.selectAll();
    } else {
      this.gridOptions.api.deselectAll();
    }
  }

}
