import { Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { GridOptions, ColDef } from 'ag-grid-community';
import { MatDialog, MatDialogRef } from '@angular/material';
import { AgGridNg2 } from 'ag-grid-angular';
import { combineLatest, Subject, zip } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { distinctUntilChanged, takeUntil, map } from 'rxjs/operators';
import { KeysModalComponent } from './keys-modal/keys.modal.component';
import { SortColumn } from '@app/interfaces';

declare var $: any;

import {
  KeysService,
  UserService,
  AuthenticationService,
  AdminService,
  ExportService,
  TrainingCourseService,
  QuestionnairesService,
  DataService
} from '@app/services';

import {
  RootStoreState,
  SharedStoreSelectors,
  KeysStoreActions,
  KeysStoreSelectors,
  TrainingCourseStoreSelectors
} from '@app/root-store';

import { fromIsoDate, dateComparator, gridComparator } from '@app/utils';

import {
  CareerCategory,
  TrainingCourse,
  Country,
  Keys,
  Currency,
  Questionnaire,
  CountryState,
  SharedModel
} from '@app/models';

import {
  SearchInputComponent,
  ConfirmationDialogComponent,
  InformationDialogComponent, WarningDialogComponent
} from '@app/components';
import { FormControl } from '@angular/forms';

import { QuestionnairesByType } from '@app/interfaces';
import { ReportsCellRendererComponent } from '@app/pages/keys/reports-cell-renderer/reports-cell-renderer.component';

enum TransformType {
  toBoolean,
  toNumber
}

@Component({
  selector: 'app-keys',
  templateUrl: './keys.component.html',
  styleUrls: ['./keys.component.scss']
})

export class KeysComponent implements OnDestroy, OnInit {
  @ViewChild('search', { static: false }) search: SearchInputComponent;
  @ViewChild('agGrid', { static: false }) agGrid: AgGridNg2;

  public keysData: Keys[];
  private allKeys: Keys[];
  private shortKeys: Keys[] = [];
  public keysCountry: Country[];
  public keysTrainingCourses: TrainingCourse[];
  public keysCareerCategory: CareerCategory[];
  public keysCurrency: Currency[];
  public states: CountryState[] = [];
  public keysQuestionnaires: QuestionnairesByType;
  public filterFormControl: FormControl = new FormControl();
  public selectAll: boolean = false;
  public disableSelectAll: boolean = false;
  private gridApi;
  private gridColumnApi;
  private userDetail: any;
  public context: any;
  public dataForExport: any[];
  public companyQuests: any[];
  public pageX: number = 0;

  private filterValue: string;
  public loading = false;
  private destroySubject$: Subject<void> = new Subject();
  private sortColumn: SortColumn;
  frameworkComponents: any;

  columnDefs: ColDef[] = [];
  gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      comparator: gridComparator
    },
    onRowClicked: this.selectRow.bind(this),
    onRowDoubleClicked: this.editKey.bind(this),
    onModelUpdated: () => {
      if (this.keysData) {
        this.setSelectedRow();
      }
    },
    onSortChanged: () => {
      this.store$.dispatch(new KeysStoreActions.SetSortColumnAction(<SortColumn>this.gridOptions.api.getSortModel()[0]));
    }
  };
  selectedRow: any;
  displayedData: Keys[];

  constructor(private keyService: KeysService,
              private userService: UserService,
              public dialog: MatDialog,
              private questionnairesService: QuestionnairesService,
              public authService: AuthenticationService,
              public adminService: AdminService,
              public exportService: ExportService,
              private store$: Store<RootStoreState.State>,
              public trainingService: TrainingCourseService,
              private dataService: DataService) {

    this.context = {componentParent: this};

    this.frameworkComponents = {
      reportsCellRenderer: ReportsCellRendererComponent
    };

    questionnairesService.getAllQuestionnaires('["id","description", "title","type"]').subscribe((questionnaires: Questionnaire[]) => {
      this.keysQuestionnaires = this.questionnairesService.splitQuestionnairesByType(questionnaires);
    });

    this.userDetail = this.authService.getUserDetails();
    this.getSharedData();
  }

  ngOnInit() {
    this.columnDefs = [
      {headerName: 'Key', field: 'title', width: 170},
      {headerName: 'KeyName', field: 'company_key', width: 130},
      {
        headerName: 'Reports',
        field: 'reports',
        width: 170,
        cellRenderer: 'reportsCellRenderer',
        comparator: this.reportsComparator,
        cellClassRules: {'overflow-unset': () => true}
      },
      {headerName: 'Country', field: 'Country.name', width: 150},
      {headerName: 'Sponsors Name', field: 'sponsor_name', width: 170},
      {headerName: 'Training Course', field: 'TrainingCourse.name', width: 170},
      {headerName: 'Currency', field: 'Currency.currency', width: 120},
      {headerName: 'Reg', field: 'usersCount', width: 120},
      {headerName: 'Lc', field: 'lastActivity', width: 120, comparator: dateComparator, cellRenderer: this.dateFormatter}
    ];

    if (this.gridOptions.api) {
      this.renderGrid();
    }

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(KeysStoreSelectors.selectSelectedKey)
    ).subscribe((selectedKey: Keys) => {
      this.selectedRow = selectedKey;
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(KeysStoreSelectors.selectKeysShowAll)
    ).subscribe((selectAll: boolean) => {
      this.selectAll = selectAll;
      this.updateGrid();
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(KeysStoreSelectors.selectFilterValue)
    ).subscribe((filterValue: string) => {
      if (!this.filterValue && filterValue) {
        this.filterFormControl.setValue(filterValue);
        this.filterValue = filterValue;
      }
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(KeysStoreSelectors.selectSortColumn)
    ).subscribe((sortColumn: SortColumn) => {
      this.sortColumn = sortColumn;
    });

    combineLatest(
      this.store$.select(state => state.key.keysShortList),
      this.store$.select(state => state.key.keysFullList)
    )
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(([shortList, fullList]) => {
        if (shortList && fullList) {
          this.shortKeys = shortList;
          this.allKeys = fullList;
          this.updateGrid();
        }
      });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(KeysStoreSelectors.selectKeysError)
    ).subscribe((error) => {
      if (error) {
        this.openWarningDialog('Error', error);
      }
    });
  }

  private reportsComparator(value_a, value_b) {
    value_a = value_a ? value_a : [];
    value_b = value_b ? value_b : [];
    return value_a.length - value_b.length;
  }

  private updateGrid() {
    if (this.allKeys) {
      this.keysData = this.selectAll ? this.allKeys : this.shortKeys;
      this.displayedData = this.keysData;
      this.applyFilter(this.filterValue);
      this.updateSelectedKey();
      this.loading = false;
    }
  }

  private renderGrid() {
    this.gridOptions.api.setColumnDefs(this.columnDefs);
  }

  private updateSelectedKey() {
    if (!this.keysData || !this.selectedRow) { return; }
    const key = this.displayedData.find((k: Keys) => k.id === this.selectedRow.id);
    this.selectedRow = key;
  }

  /**
   * Get data shared across the app
   */
  private getSharedData() {
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(SharedStoreSelectors.selectAll)).subscribe((data: SharedModel) => {
        if (!data) { return; }
        this.keysCareerCategory = data.careers;
        this.keysCountry = data.countries;
        this.states = data.countriesStates;
        this.keysCurrency = JSON.parse(JSON.stringify(data.currencies));
        this.keysCurrency.forEach(function (curr) {
          curr.currency += ' ' + curr.currency_name;
        });
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(TrainingCourseStoreSelectors.selectAll))
      .subscribe((data: TrainingCourse[]) => {
        this.keysTrainingCourses = data;
      });
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    if (this.sortColumn) {
      this.gridOptions.api.setSortModel([this.sortColumn]);
    }
    this.renderGrid();
  }

  setSelectedRow() {
    if (this.selectedRow) {
      let selectedFound = false;
      this.gridOptions.api.forEachNode((node) => {
        if (node.data.id === this.selectedRow.id) {
          node.setSelected(true);
          selectedFound = true;
        }
      });
      if (!selectedFound) {
        this.selectedRow = undefined;
      }
    }
  }

   /**
   * Shows and hides message box
   */
  private showSelectionWarning() {
    const box = $('#msg_box');
    box.removeClass('hidden');
    box.removeClass('visuallyhidden');
    setTimeout(function () {
      box.addClass('visuallyhidden');
      box.one('transitionend', function(e) {
        box.addClass('hidden');
      });
    }, 20);
  }

  removeKey($event: MouseEvent) {
    if (!this.selectedRow) {
      this.pageX = $event.pageX - 150;
      if (this.pageX < 0 ) { this.pageX = 0; }
      this.showSelectionWarning();
      return;
    }
    if (this.selectedRow.usersCount > 0) {
      this.openWarningDialog('You can\'t delete user', 'Please remove all participants before deleting this Key');
    } else if (this.selectedRow.usersCount === 0) {
      const confirmationDialogRef = this.openDeleteConfirmationDialog();
      confirmationDialogRef.afterClosed()
        .subscribe(data => {
          if (data) {
            this.keyService.delete(this.selectedRow.id).subscribe(() => {
              this.refresh();
              //this.openInformationDialog('Key deleted');
            });
          }
        });
    }
  }

  getSelectedRows() {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    return selectedNodes.map(node => node.data);
  }

  exportParticipantsSummary($event) {
    if (!this.selectedRow) {
      this.pageX = $event.pageX - 150;
      if (this.pageX < 0 ) { this.pageX = 0; }
      this.showSelectionWarning();
      return;
    }
    this.loading = true;
    this.dataService.getCompanyById(this.selectedRow.id)
    .pipe(map(key => key))
    .subscribe((key) => {
      this.userService.getAllUsersByCompany(this.selectedRow.id).subscribe((resultTrig: any) => {
        this.dataForExport = resultTrig;
        this.questionnairesService.getQuestsByCompany(this.selectedRow.id).subscribe((data: any) => {
          this.companyQuests = data.companyQuests;
          this.loading = false;
          this.exportService.exportParticipantsSummary(this.companyQuests, [this.dataForExport], [key.title], key);
        });
      });
    });
  }

  exportBestNegotiators($event) {
    if (!this.selectedRow) {
      this.pageX = $event.pageX - 150;
      if (this.pageX < 0 ) { this.pageX = 0; }
      this.showSelectionWarning();
      return;
    }
    this.loading = true;
    this.keyService.exportBestNegotiators(this.selectedRow.id).subscribe((rowData: any) => {
      this.loading = false;
      this.exportService.exportBestNegotiators([rowData]);
    });
  }

  private applyFilter(filterValue: string) {
    if (filterValue) {
      this.displayedData = this.keysData.filter(keys => this.filterPredicate(keys, filterValue));
      if (!this.displayedData.length && !this.selectAll) {
        const filteredKeys = this.allKeys.filter(keys => this.filterPredicate(keys, filterValue));
        if (filteredKeys.length) {
          this.store$.dispatch(new KeysStoreActions.SetShowAllAction(true));
        }
      }
      /**Check if filterValue matches for some key from short list */
      const shortFilteredKeys = this.shortKeys.filter(keys => this.filterPredicate(keys, filterValue));
      if (shortFilteredKeys.length) {
        this.disableSelectAll = false;
      } else {
        this.disableSelectAll = true;
      }
    } else {
      this.displayedData = this.keysData.slice();
      this.disableSelectAll = false;
    }
  }

  filter(value: string) {
    this.filterValue = value;
    this.applyFilter(value);
    this.store$.dispatch(new KeysStoreActions.SetFilterValueAction(value));
  }

  toggleSelectAll(selectAll: boolean) {
    this.store$.dispatch(new KeysStoreActions.TriggerShowAllAction());
  }

  refresh() {
    this.loading = true;
    this.store$.dispatch(new KeysStoreActions.LoadSharedRequestAction());
  }

  selectRow(row) {
    this.selectedRow = row.data;
    this.store$.dispatch(new KeysStoreActions.SetSelectedKeyAction(this.selectedRow));
  }

  addKey() {
    const dialogRef = this.openDialog(null, 'Create new Key ', 'add');
    dialogRef.afterClosed().pipe(takeUntil(this.destroySubject$)).subscribe((data: Keys) => {
      if (data) {
        this.formatRequestKey(data);
        this.keyService.create(data).subscribe(() => {
          this.refresh();
          //this.openInformationDialog('Key saved');
        });
      }
    });
  }

  /**
   * Transform binary data(0, 1) from database to boolean to use in checkboxes and back.
   * @param obj
   * @param {string[]} prefixes
   * @param {TransformType} transformType
   */
  transformFields(obj: any, prefixes: string[], transformType: TransformType) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && this.isPrefixedKey(key, prefixes)) {
        switch (transformType) {
          case TransformType.toBoolean :
            obj[key] = this.convertNumberToBoolean(obj[key]);
            break;
          case TransformType.toNumber :
            obj[key] = this.convertBooleanToNumber(obj[key]);
            break;
        }
      }
    }
  }

  isPrefixedKey(key: string, prefixes: string[]): boolean {
    for (let i = 0; i < prefixes.length; i++) {
      if (key.indexOf(prefixes[i]) > -1) {
        return true;
      }
    }
    return false;
  }

  convertBooleanToNumber(value: boolean): number {
    return value === true ? 1 : 0;
  }

  convertNumberToBoolean(value: number): boolean {
    return value === 1;
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  editKey(key: any) {
    const keyData = Object.assign({}, key.data);
    this.transformFields(keyData, ['edit', 'show', 'mn'], TransformType.toBoolean);
    const dialogRef = this.openDialog(keyData, 'Edit Key', 'edit');
    dialogRef.afterClosed().pipe(takeUntil(this.destroySubject$)).subscribe((data: Keys) => {
      if (data) {
        this.formatRequestKey(data);
        this.keyService.update(data).subscribe(() => {
          this.refresh();
          //this.openInformationDialog('Key saved');
        });
      }
    });
  }

  clone($event) {
    if (!this.selectedRow) {
      this.pageX = $event.pageX - 150;
      if (this.pageX < 0 ) { this.pageX = 0; }
      this.showSelectionWarning();
      return;
    }
    const key = {data: this.selectedRow};
    this.transformFields(key, ['edit', 'show', 'mn'], TransformType.toBoolean);
    const dialogRef = this.openDialog(key.data, 'Clone Key', 'clone');
    dialogRef.afterClosed().pipe(takeUntil(this.destroySubject$)).subscribe((data: Keys) => {
      if (data) {
        data.id = undefined;
        data.questionnaires = data.profiles.concat(data.assessments).concat(data.feedbacks);
        this.keyService.create(data).subscribe(() => {
          this.refresh();
          //this.openInformationDialog('Key Cloned');
        });
      } else {
        this.transformFields(key.data, ['edit', 'show', 'mn'], TransformType.toNumber);
      }
    });
  }

  private openDialog(key: Keys, header: string, type: string): MatDialogRef<any> {
    if (!key) {
      key = <Keys>{};
    }
    return this.dialog.open(KeysModalComponent, <any> {
      width: '620px',
      data: {
        key: key,
        header: header,
        type: type,
        countries: this.keysCountry,
        career_category: this.keysCareerCategory,
        training_courses: this.keysTrainingCourses,
        currency: this.keysCurrency,
        questionnaires: this.keysQuestionnaires,
        states: this.states
      }
    });
  }

  private openDeleteConfirmationDialog(): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '400px',
      data: {
        text: 'Are you sure you want to delete selected key?'
      }
    });
  }

  private openWarningDialog(title: string, text: string): MatDialogRef<any> {
    return this.dialog.open(WarningDialogComponent, <any> {
      data: {
        title: title,
        text: text
      }
    });
  }

  private openInformationDialog(text: string, time?: number): MatDialogRef<any> {
    return this.dialog.open(InformationDialogComponent, <any>{
      data: {
        title: 'Information',
        text: text,
        time: time
      }
    });
  }

  /**
   * Filter callback that filters a key row by company_key and title fields
   * @param {Keys} keyData
   * @param {string} filterValue
   * @returns {boolean}
   */
  private filterPredicate(keyData: Keys, filterValue: string): boolean {
    const dataStr = (keyData.company_key + keyData.title).toLowerCase();
    const transformedFilter = filterValue.trim().toLowerCase();
    return dataStr.indexOf(transformedFilter) !== -1;
  }

  /**
   * Format some fields to a format that backend accepts
   * @param {Keys} data
   * @returns {Keys}
   */
  private formatRequestKey(data: Keys): Keys {
    this.transformFields(data, ['edit', 'show', 'mn'], TransformType.toNumber);
    data.questionnaires = data.profiles.concat(data.assessments).concat(data.feedbacks);
    return data;
  }

  private dateFormatter(params: any) {
    if (!params.value) {
      return '';
    }
    return fromIsoDate(params.value);
  }
}
