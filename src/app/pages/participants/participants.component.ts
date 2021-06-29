import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { AgGridNg2 } from 'ag-grid-angular';
import { GridOptions } from 'ag-grid-community';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, take, distinctUntilChanged, debounceTime, map } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';

declare var $: any;

import {
  RootStoreState,
  UserStoreActions,
  UserStoreSelectors,
  SharedStoreSelectors,
  TrainingCourseStoreSelectors,
  TrainingCourseStoreActions,
  RouteStoreActions,
  KeysStoreActions
} from '@app/root-store';
import {
  StatusRendererComponent,
  ChangeStatusComponent,
  SelectAllRendererComponent,
  AddParticipantDialogComponent,
  UpdateFieldsComponent
} from './';
import {
  ConfirmationDialogComponent,
  InformationDialogComponent,
  SelectDialogComponent
} from '@app/components';
import { SelectKeyToMoveComponent } from '@app/components/dialog/select-key-to-move/select-key-to-move.component';

import {
  UserService,
  ExportService,
  KeysService,
  AdminService,
  AuthenticationService,
  DataService,
  QuestionnairesService
} from '@app/services';
import { fromIsoDate, setAcronym, checkIfNotOneStatusExists,
  dateComparator, dateStringComparator, gridComparator, isColumnEmpty } from '@app/utils';
import {
  User,
  Questionnaire,
  CareerCategory,
  TrainingCourse,
  Country,
  Currency,
  Keys,
  CountryState,
  SharedModel
} from '@app/models';

import { QuestionnaireStatus, RoutesEnum, RolesEnum } from '@app/enums';
import { SortColumn } from '@app/interfaces';
import { SortOptions } from '@app/enums';

@Component({
  selector: 'app-participants',
  templateUrl: './participants.component.html',
  styleUrls: ['./participants.component.scss']
})
export class ParticipantsComponent implements OnInit, OnDestroy {
  @ViewChild('agGrid', { static: false }) agGrid: AgGridNg2;

  emailInUse = false;
  companyId: number;
  users_count = 0;

  rowData: User[] = [];
  context: any;
  frameworkComponents: any;
  companyQuests: Questionnaire[];
  columnDefs: any[];
  gridOptions: GridOptions;
  userDetail: any;
  selectedRowsCount = 0;
  selectedIds: number[] = [];

  selectedKey: Keys;
  keysOptions = [];
  allKeys: Keys[] = [];
  shortKeys: Keys[] = [];
  filterFormControl: FormControl = new FormControl();
  keysControl: FormControl = new FormControl();

  participantsControl: FormControl = new FormControl();
  participantsOptions: any[] = [];

  showAll$: Observable<boolean>;
  showAll: boolean = false;
  countText: string = 'Participants';

  careers: CareerCategory[] = [];
  trainings: TrainingCourse[] = [];
  countries: Country[] = [];
  currencies: Currency[] = [];
  states: CountryState[] = [];

  pageX: number = 0;

  private sortColumn: SortColumn;
  private deffSortColumn: SortColumn = {
    colId: 'first_name',
    sort: SortOptions.ASC
  };

  isLoading$: Observable<boolean>;
  loading: boolean;
  private destroySubject$: Subject<void> = new Subject();

  constructor(private store$: Store<RootStoreState.State>,
              private userService: UserService,
              private dialog: MatDialog,
              private exportService: ExportService,
              private keysService: KeysService,
              private adminService: AdminService,
              private authService: AuthenticationService,
              private questionnaireService: QuestionnairesService,
              private dataService: DataService) {
    this.context = {componentParent: this};
    this.frameworkComponents = {
      statusRenderer: StatusRendererComponent,
      selectAllRenderer: SelectAllRendererComponent
    };
    this.sortColumn = this.deffSortColumn;
  }

  ngOnInit() {
    this.userDetail = this.authService.getUserDetails();
    this.getSharedData();

    this.gridOptions = {
      rowData: null,
      onRowDoubleClicked: this.editUser.bind(this),
      onSelectionChanged: this.onSelectionChanged.bind(this),
      suppressLoadingOverlay: true,
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        comparator: gridComparator
      },
      rowClassRules: {
        'not_one_completed': this.checkIfNotOneCompleted,
        'invalid': this.checkIfInvalid.bind(this)
      },
      onGridReady: () => {
        if (this.rowData.length && !this.gridOptions.rowData) {
          this.renderGrid();
        }
      },
      onSortChanged: () => {
        this.store$.dispatch(new UserStoreActions.SetSortColumnAction(<SortColumn>this.gridOptions.api.getSortModel()[0]));
      }
    };

    /** Subscriptions */

    this.initiateStatesFromStore();
    this.initiateGrid();

    this.keysControl.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(value => {
        if (value === this.companyId) {
          return;
        }
        this.setCompanyId(value);
        this.sortColumn = this.deffSortColumn;
        this.store$.dispatch(new UserStoreActions.SetSortColumnAction(this.deffSortColumn));
      });

    this.participantsControl.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(value => {
        if (!value) { return; }
        const user: User = this.participantsOptions.find(us => us.id === value);
        this.setKeyAndSelectUser(user);
      });
    }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  private setCompanyId(value: number) {
    if (value) {
      this.companyId = value;
      this.store$.dispatch(new UserStoreActions.SetCompanyIdAction(value));
      this.refreshKey();
    }

    this.store$.dispatch(new RouteStoreActions.Navigate({
      role: RolesEnum.ADMIN,
      path: RoutesEnum.PARTICIPANTS,
      param: value ? value.toString() : ''
    }));
  }

  private initiateStatesFromStore() {
    this.isLoading$ = this.store$.select(UserStoreSelectors.selectUserLoading);
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(UserStoreSelectors.selectUserError)
    ).subscribe((error) => {
      if (error) {
        this.loading = false;
        this.openInformationDialog(error.message, 'Error');
      }
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(UserStoreSelectors.selectSortColumn)
    ).subscribe((sortColumn: SortColumn) => {
      this.sortColumn = sortColumn;
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      take(1),
      select(UserStoreSelectors.selectUserShowAll)
    ).subscribe((state: boolean) => {
      this.showAll = state;
      this.setKeysOptions();
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(UserStoreSelectors.selectUserSelectedIds)
    ).subscribe((state: number[]) => {
      this.selectedIds = state;
      if (state) {
        this.selectedRowsCount = state.length;
      }
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(UserStoreSelectors.selectUserCompanyId)
    ).subscribe((state: number) => {
      if (!state) {
        return;
      }
      this.companyId = state;
      this.keysControl.setValue(this.companyId);
      this.dataService.getCompanyById(this.companyId).subscribe((key: Keys) => {
        this.selectedKey = key;
      });
      this.checkIfKeyInList();
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(UserStoreSelectors.selectFilterValue)
    ).subscribe((filterValue: string) => {
      if (filterValue) {
        this.filterFormControl.setValue(filterValue);
      }
    });
  }

  /**
   * Check if selected company id belongs to one of the key in keysOptions list.
   * If not: set 'showAll' to true, set keysOptions to fullList of keys.
   */
  private checkIfKeyInList() {
    if (!this.showAll && this.keysOptions.length) {
      const obj = this.keysOptions.find(key => key.id === this.companyId);
      if (!obj) {
        this.showAll = true;
        this.setKeysOptions();
        this.store$.dispatch(new UserStoreActions.TriggerShowAllAction());
      }
    }
  }

  private setKeysOptions() {
    const keysOptions = this.showAll ? this.allKeys : this.shortKeys;
    keysOptions.forEach(key => {
      key.value = key.title + ` (${key.company_key})`;
    });

    this.keysOptions = keysOptions;
  }

  private initiateGrid() {
    combineLatest(
      this.store$.select(state => state.user.users),
      this.store$.select(state => state.user.companyQuests)
    )
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(([userList, qList]) => {
        if (userList && qList) {
          this.companyQuests = (<any>qList).companyQuests ? JSON.parse(JSON.stringify((<any>qList).companyQuests)) : [];
          this.rowData = JSON.parse(JSON.stringify(userList));
          this.users_count = userList.length;
          this.setDataSource();
        }
      });
  }

  /**
   * Get data needed for add/edit dialogs
   */
  private getSharedData() {
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(SharedStoreSelectors.selectAll)).subscribe((data: SharedModel) => {
        if (!data) { return; }
        this.careers = data.careers;
        this.countries = data.countries;
        this.states = data.countriesStates;
        this.currencies = JSON.parse(JSON.stringify(data.currencies));
        this.currencies.forEach(function (curr) {
          curr.currency += ' ' + curr.currency_name;
        });
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(TrainingCourseStoreSelectors.selectAll))
      .subscribe((data: TrainingCourse[]) => {
        this.trainings = data;
      });

    this.getAllKeys();
  }

  private getAllKeys() {
    this.loading = true;
    combineLatest(
      this.store$.select(state => state.key.keysShortList),
      this.store$.select(state => state.key.keysFullList)
    )
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(([shortList, fullList]) => {
        if (shortList && fullList) {
          this.shortKeys = JSON.parse(JSON.stringify(shortList));
          this.allKeys = JSON.parse(JSON.stringify(fullList));
          this.setKeysOptions();
          this.keysControl.setValue(this.companyId);
          this.loading = false;
        }
      });
  }

  goToParentRoute() {
    this.companyId = undefined;
    this.store$.dispatch(new RouteStoreActions.Navigate({
      role: RolesEnum.ADMIN,
      path: RoutesEnum.PARTICIPANTS,
      param: ''
    }));
  }

  /**
   * Set data to fill grid table
   */
  private setDataSource() {
    this.columnDefs = [
      {
        headerName: '#', width: 40, checkboxSelection: true, suppressMenu: true,
        sortable: false, resizable: false, pinned: true, headerComponent: 'selectAllRenderer'
      },
      {headerName: 'First Name', width: 135, minWidth: 60, field: 'first_name'},
      {headerName: 'Last Name', width: 135, minWidth: 60, field: 'last_name'},
      {headerName: 'Email', width: 180, minWidth: 60, field: 'email'}
    ];
    this.companyQuests.forEach((value: Questionnaire) => {
      if (checkIfNotOneStatusExists(value.id, this.rowData)) {
        return;
      }
      let acronym = value.abbreviation;
      if (!acronym) {
        acronym = setAcronym(value.title);
      }
      this.columnDefs.push({
        headerName: acronym, width: 130, minWidth: 90,
        id: value.id, title: value.title, data: this.rowData, cellRenderer: 'statusRenderer',
        suppressMenu: true,
        valueGetter: this.statusComparator,
        getQuickFilterText: () => '',
        cellClassRules: {'overflow-unset': () => true}
      });
    });

    if (!isColumnEmpty(this.rowData, 'p_date')) {
      this.columnDefs.push({
        headerName: 'Date', width: 110, field: 'p_date', cellRenderer: this.dateFormatter,
        comparator: dateStringComparator,
        getQuickFilterText: () => ''
      });
    }
    if (!isColumnEmpty(this.rowData, 'p_location')) {
      this.columnDefs.push({headerName: 'Location', width: 110, field: 'p_location', getQuickFilterText: () => ''});
    }
    if (!isColumnEmpty(this.rowData, 'p_groups')) {
      this.columnDefs.push({headerName: 'Groups', width: 110, field: 'p_groups', getQuickFilterText: () => ''});
    }
    if (!isColumnEmpty(this.rowData, 'p_saved')) {
      this.columnDefs.push({headerName: 'Saved', width: 110, field: 'p_saved', getQuickFilterText: () => ''});
    }
    if (!isColumnEmpty(this.rowData, 'job_title')) {
      this.columnDefs.push({headerName: 'Job Title', width: 110, field: 'job_title', getQuickFilterText: () => ''});
    }
    if (!isColumnEmpty(this.rowData, 'manager_name')) {
      this.columnDefs.push({headerName: 'Manager', width: 110, field: 'manager_name', getQuickFilterText: () => ''});
    }
    if (!isColumnEmpty(this.rowData, 'department')) {
      this.columnDefs.push({headerName: 'Department', width: 110, field: 'department', getQuickFilterText: () => ''});
    }
    if (!isColumnEmpty(this.rowData, 'country.name')) {
      this.columnDefs.push({headerName: 'Country', width: 110, field: 'country.name', getQuickFilterText: () => ''});
    }
    if (!isColumnEmpty(this.rowData, 'state_name')) {
      this.columnDefs.push({headerName: 'State', width: 110, field: 'state_name', getQuickFilterText: () => ''});
    }
    if (!isColumnEmpty(this.rowData, 'curr.currency')) {
      this.columnDefs.push({headerName: 'Currency', width: 110, field: 'curr.currency', getQuickFilterText: () => ''});
    }
    if (!isColumnEmpty(this.rowData, 'notes')) {
      this.columnDefs.push({headerName: 'Notes', width: 110, field: 'notes', getQuickFilterText: () => ''});
    }
    if (!isColumnEmpty(this.rowData, 'last_attempt')) {
      this.columnDefs.push({
        headerName: 'L Login', width: 110, field: 'last_attempt',
        cellRenderer: this.dateFormatter, cellClass: 'color-blue',
        comparator: dateComparator,
        getQuickFilterText: () => ''
      });
    }
    if (!isColumnEmpty(this.rowData, 'last_location')) {
      this.columnDefs.push({headerName: 'L Location', width: 115, field: 'last_location', getQuickFilterText: () => ''});
    }
    if (!isColumnEmpty(this.rowData, 'ip')) {
      this.columnDefs.push({headerName: 'IP', width: 130, field: 'ip', getQuickFilterText: () => ''});
    }

    if (this.gridOptions.api) {
      this.renderGrid();
    }
  }

  private renderGrid() {
    this.gridOptions.api.setRowData(this.rowData);
    this.gridOptions.api.resetQuickFilter();
    this.gridOptions.api.setColumnDefs([]);
    this.gridOptions.api.setColumnDefs(this.columnDefs);

    this.gridOptions.api.forEachNode((node) => {
      this.selectedIds.forEach((id: number) => {
        if (node.data.id === id) {
          node.setSelected(true);
        }
      });
    });

    if (this.filterFormControl) {
      this.gridOptions.api.setQuickFilter(this.filterFormControl.value);
    }

    if (this.sortColumn) {
      this.gridOptions.api.setSortModel([this.sortColumn]);
      this.gridOptions.columnApi.getColumn(this.sortColumn.colId).setSort(this.sortColumn.sort);
    }
  }

  private statusComparator(params) {
    const attempts = params.data.attempts.filter((a) => a.questionnaire_id === params.colDef.id);
    const limit = params.data.u_q_limit.filter((a) => a.id_questionnaire === params.colDef.id);
    let attempts_limit = 1;
    if (limit.length > 0) {
      attempts_limit = limit[0].attempts_limit;
    }
    if (attempts_limit > 1 && attempts.length) {
      return '';
    } else if (attempts.length === 1) {
      const attempt = attempts[0];
      switch (attempt.status) {
        case QuestionnaireStatus.OPEN:
        case QuestionnaireStatus.REOPENED:
          return 'open';
        case QuestionnaireStatus.STARTED_REGISTER:
          return attempt.answers.length > 0 ? 'started' : 'register';
        case QuestionnaireStatus.COMPLETED:
          return'completed';
        case QuestionnaireStatus.TIMEOUT:
          return 'timedout';
        default:
          return 'z';
      }
    } else {
      return 'z';
    }
  }

  /**
   * Check if User has completed at least one Questionnaire
   * @param params (Grid element)
   */
  checkIfNotOneCompleted(params: any): boolean {
    for (const attempt of params.data.attempts) {
      if (attempt.status === QuestionnaireStatus.COMPLETED
        || attempt.status === QuestionnaireStatus.REOPENED // TODO: Clarify
      ) {
        return false;
      }
    }
    return true;
  }

  checkIfInvalid(params: any): boolean {
    if (params.data.email === 'invalid') {
      return true;
    }
    return false;
  }

  private setKeyAndSelectUser(user: User) {
    if (!user.company) { return; }
    this.setCompanyId(user.company.id);
    this.store$.dispatch(new UserStoreActions.SetSelectedIdsAction([user.id]));
    this.participantsOptions = [];
  }

  /**
   * Returns Formated date from ISO to format('DD-MMM-YY')
   * @param params (Grid element)
   */
  private dateFormatter(params: any) {
    if (!params.value) {
      return '';
    }
    //const date = new Date(params.value);
    return fromIsoDate(params.value);
  }

  selectDeselectAll(doSelect: boolean) {
    if (doSelect) {
      this.gridOptions.api.selectAll();
    } else {
      this.gridOptions.api.deselectAll();
    }
  }

  private getSelectedRows() {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    return selectedData;
  }

  /**
   * Shows and hides message box
   */
  private showSelectionWarning() {
    const box = $('#msg_box');
    box.removeClass('hidden');
    box.removeClass('visuallyhidden');
    window.setTimeout(() => {
      box.addClass('visuallyhidden');
      box.one('transitionend', (e) => {
        box.addClass('hidden');
      });
    }, 20);
  }

  /** Events */

  findParticipants($event: Event) {
    const value = (<HTMLInputElement>$event.target).value;
    if (!value || value.length < 2) {
      this.participantsOptions = [];
      return;
    }

    this.userService.getUsersByValue(value)
    .pipe(debounceTime(700))
    .subscribe((users: User[]) => {
      users.forEach((user: any) => {
        user.value = '';
        if (user.company) {
          user.value = '(' + user.company.company_key + ') ';
        }
        user.value += user.first_name + ' ' + user.last_name + ' ' + user.email;
      });
      this.participantsOptions = users;
      if (users.length === 1) {
        this.setKeyAndSelectUser(users[0]);
      }
    }, error => {
      this.openInformationDialog(error.message, 'Error');
    });
  }

  onSelectionChanged(event) {
    this.selectedRowsCount = event.api.getSelectedNodes().length;
    if (this.selectedRowsCount) {
      const firstIndex = event.api.getSelectedNodes()[0].rowIndex;
      this.gridOptions.api.ensureIndexVisible(firstIndex);
    }
    const rowData = this.getSelectedRows();
    const ids = [];
    rowData.forEach((user: User) => {
      ids.push(user.id);
    });
    this.selectedIds = ids;
    this.store$.dispatch(new UserStoreActions.SetSelectedIdsAction(ids));

    this.countText = this.selectedIds.length > 1 ? 'Selected' : 'Participants';
  }

  /**
   * Find all records matching search criteria
   * @param  $event HTMLInputElement
   */
  onQuickFilterChanged($event: Event) {
    this.store$.dispatch(new UserStoreActions.SetFilterValueAction((<HTMLInputElement>$event.target).value));
    this.gridOptions.api.setQuickFilter((<HTMLInputElement>$event.target).value);
  }

  onShowAll() {
    this.showAll = !this.showAll;
    this.setKeysOptions();
    this.store$.dispatch(new UserStoreActions.TriggerShowAllAction());
  }

  refresh() {
    this.refreshKey();
    this.store$.dispatch(new TrainingCourseStoreActions.LoadRequestAction());
    this.store$.dispatch(new KeysStoreActions.LoadSharedRequestAction());
  }

  refreshKey() {
    if (this.companyId) {
      this.store$.dispatch(
        new UserStoreActions.LoadRequestAction(this.companyId)
      );
    }
  }

  /**
   * Open "Create new Participant" dialog
   */
  addUser() {
    const dialogRef = this.openAddParticipantDialog(null, 'Create New Participant', 'add');
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((data: any) => {
        if (data) {
          this.dataService.createUser(data).subscribe((user: User) => {
            if (this.companyId === data.company_id) {
              this.refreshKey();
            }
          });
        }
      });
  }

  removeUsers($event) {
    if (this.selectedRowsCount === 0) {
      this.pageX = $event.pageX - 150;
      if (this.pageX < 0 ) { this.pageX = 0; }
      this.showSelectionWarning();
      return;
    }

    const rowData = this.getSelectedRows();
    const ids = [];
    rowData.forEach((user: User) => {
      ids.push(user.id);
    });
    const text = 'Are you sure you want to delete ' + rowData.length + ' Participants?';
    const dialogRef = this.openConfirmationDialog(text);
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((data: any) => {
        if (data) {
          this.userService.deleteUsersById(ids).subscribe((response: String) => {
            this.refreshKey();
          }, error => {
            this.openInformationDialog(error.message, 'Error');
          });
        }
      });
  }

  /**
   * Open "Edit Participant" dialog
   * @param selection (selected row)
   */
  editUser(selection: any) {
    const dialogRef = this.openAddParticipantDialog(selection.data, 'Edit Participant', 'edit');
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((data: any) => {
        if (data) {
          this.dataService.updateUser(data).subscribe((user: User) => {
            this.refreshKey();
          });
        }
      });
  }

  /**
   * Clear search filter
   */
  onClear() {
    this.store$.dispatch(new UserStoreActions.SetFilterValueAction(('')));
    this.gridOptions.api.setQuickFilter('');
  }

  /**
   * Download table data of selected Users
   */
  exportSummary($event) {
    if (this.selectedRowsCount === 0) {
      this.pageX = $event.pageX - 150;
      if (this.pageX < 0 ) { this.pageX = 0; }
      this.showSelectionWarning();
      return;
    }
    this.store$.dispatch(new UserStoreActions.LoadingAction(true));

    this.dataService.getCompanyById(this.companyId)
    .pipe(map(key => key))
    .subscribe((key) => {
      this.userService.getAllUsersByCompany(this.companyId).subscribe((users: any) => {
        const userIds = this.getUserIds(this.getSelectedRows());
        const dataForExport = users.filter((user: User) => {
          return userIds.find((id) => id === user.id);
        });
        this.questionnaireService.getQuestsByCompany(this.companyId).subscribe((data: any) => {
          this.exportService.exportParticipantsSummary(data.companyQuests, [dataForExport], [key.title], key);
          this.store$.dispatch(new UserStoreActions.LoadingAction(false));
        });
      });
    });
  }

  /**
   * Download table data + Questionnaires comments of selected Users
   */
  exportBestNegotiators($event) {
    if (this.selectedRowsCount === 0) {
      this.pageX = $event.pageX - 150;
      if (this.pageX < 0 ) { this.pageX = 0; }
      this.showSelectionWarning();
      return;
    }
    this.store$.dispatch(new UserStoreActions.LoadingAction(true));
    const userIds = this.getUserIds(this.getSelectedRows());
    this.keysService.exportBestNegotiators(this.companyId, userIds)
    .subscribe((bestNegotiatorsExport: any) => {
      this.exportService.exportBestNegotiators([bestNegotiatorsExport]);
      this.store$.dispatch(new UserStoreActions.LoadingAction(false));
    }, error => {
      this.store$.dispatch(new UserStoreActions.LoadingAction(false));
      this.openInformationDialog(error, 'Error');
    });
  }

  /**
   * Download table data + Questionnaires questions and answers of selected Users
   */
  exportDetailed($event) {
    if (this.selectedRowsCount === 0) {
      this.pageX = $event.pageX - 150;
      if (this.pageX < 0 ) { this.pageX = 0; }
      this.showSelectionWarning();
      return;
    }
    this.loading = true;
    const userIds = this.getUserIds(this.getSelectedRows());
    this.questionnaireService.getCompletedQuestionnaires(userIds, [this.companyId])
      .subscribe(completedQuests => {
        this.loading = false;
        const dialog = this.openSelectDialog(completedQuests);
        dialog.afterClosed().subscribe(selectedQuestionnaireId => {
          if (selectedQuestionnaireId) {
            this.store$.dispatch(new UserStoreActions.LoadingAction(true));
            this.keysService.exportParticipantsResponses(this.companyId, selectedQuestionnaireId, userIds)
              .subscribe(response => {
                this.store$.dispatch(new UserStoreActions.LoadingAction(false));
                this.exportService.exportParticipantsResponses(response);
              }, error => {
                this.store$.dispatch(new UserStoreActions.LoadingAction(false));
                this.openInformationDialog(error.message, 'Error');
              });
          }
        });
      });
  }

  getUserIds(selectedRows) {
    const userIds = [];
    selectedRows.forEach(row => {
      userIds.push(row.id);
    });
    return userIds;
  }

  /**
   * Change status of Questionnaires of selected Users
   */
  changeSelectedStatus($event) {
    if (this.selectedRowsCount === 0) {
      this.pageX = $event.pageX - 150;
      if (this.pageX < 0 ) { this.pageX = 0; }
      this.showSelectionWarning();
      return;
    }

    const rowData = this.getSelectedRows();
    const ids = [];
    rowData.forEach((user: User) => {
      ids.push(user.id);
    });

    const dialogRef = this.openChangeStatusDialog(rowData);
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((data: any) => {
        if (data) {
          const body = {ids: ids, data: data};
          this.userService.updateUsersQuestionnaireAttemptsLimit(body).subscribe(() => {
            this.refreshKey();
          }, error => {
            this.openInformationDialog(error.message, 'Error');
          });
        }
      });
  }

  /**
   * Updata 'Location', 'Date', 'Date2', 'Saved' and 'Groups' fields of selected Users.
   * Needs to pass following params to server:
   * {ids: selected users ids, date: ..., date2: ..., groups: ..., saved: ..., location: ...,
   * isClearDate2: if true clears Date2 for all selected participants}
   */
  updateSelectedFields($event) {
    if (this.selectedRowsCount === 0) {
      this.pageX = $event.pageX - 150;
      if (this.pageX < 0 ) { this.pageX = 0; }
      this.showSelectionWarning();
      return;
    }

    const rowData = this.getSelectedRows();
    const ids = [];
    rowData.forEach((user: User) => {
      ids.push(user.id);
    });

    const dialogRef = this.openUpdateFieldsDialog('Update fields for selected participants', rowData);
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((data: any) => {
        if (data) {
          const body = {
            ids: ids,
            date: data.form.p_date,
            date2: data.form.p_date2,
            groups: data.form.p_groups,
            saved: data.form.p_saved,
            location: data.form.p_location,
            isClearDate2: data.isClearDate2
          };
          this.userService.updateUsersFields(body).subscribe((users: void | User[]) => {
            this.refreshKey();
          });
        }
      });
  }

  moveUsersToOtherKey($event) {
    if (this.selectedRowsCount === 0) {
      this.pageX = $event.pageX - 150;
      if (this.pageX < 0 ) { this.pageX = 0; }
      this.showSelectionWarning();
      return;
    }

    const rowData = this.getSelectedRows();
    const ids = [];
    rowData.forEach((user: User) => {
      ids.push(user.id);
    });

    const dialogRef = this.openSelectKeyToMoveDialog(this.allKeys, this.companyId, 'Move to other company');
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(selectedNextCompanyId => {
        if (selectedNextCompanyId) {
          this.userService.moveUsers({userIds: ids, companyId: selectedNextCompanyId}).subscribe(() => {
            this.refreshKey();
          });
        }
      });
  }

  private openSelectKeyToMoveDialog(keys: any[], currentCompanyId: number, header: string): MatDialogRef<any> {
    return this.dialog.open(SelectKeyToMoveComponent, <any> {
      width: '500px',
      data: {
        header: header,
        currentCompanyId: currentCompanyId,
        keys: keys
      }
    });
  }

  private openAddParticipantDialog(user: User, header: string, type: string): MatDialogRef<any> {
    return this.dialog.open(AddParticipantDialogComponent, <any>{
      disableClose: true,
      width: '550px',
      data: {
        user: user,
        keys: this.allKeys,
        companyQuests: this.companyQuests || [],
        careers: this.careers,
        trainings: this.trainings,
        countries: this.countries,
        states: this.states,
        currencies: this.currencies,
        companyId: this.companyId,
        header: header,
        type: type
      }
    });
  }

  private openUpdateFieldsDialog(header: string, users: User[]): MatDialogRef<any> {
    return this.dialog.open(UpdateFieldsComponent, <any>{
      width: '550px',
      data: {
        header: header,
        users: users
      }
    });
  }

  private openSelectDialog(questionnaires): MatDialogRef<any> {
    return this.dialog.open(SelectDialogComponent, <any>{
      width: '550px',
      data: {
        header: 'Export Detailed Participant Responses',
        info: questionnaires
      }
    });
  }

  private openChangeStatusDialog(users: User[]): MatDialogRef<any> {
    return this.dialog.open(ChangeStatusComponent, <any>{
      width: '550px',
      data: {
        users: users,
        companyQuests: this.companyQuests
      }
    });
  }

  private openConfirmationDialog(text: string): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '450px',
      data: {
        text: text
      }
    });
  }

  private openInformationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(InformationDialogComponent, <any>{
      data: {
        title: title,
        text: text,
        noTimer: true
      }
    });
  }

}
