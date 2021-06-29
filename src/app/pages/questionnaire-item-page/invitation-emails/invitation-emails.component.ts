import { Component, OnInit, OnDestroy, ViewChild, Input, AfterViewInit } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { takeUntil, distinctUntilChanged, take } from 'rxjs/operators';
import { AgGridNg2 } from 'ag-grid-angular';
import { GridOptions } from 'ag-grid-community';
import { MatDialog, MatDialogRef } from '@angular/material';
import {
  AbstractControl,
  ValidationErrors,
  FormControl,
  Validators } from '@angular/forms';

declare var $: any;

import {
    RootStoreState,
    QuestionnaireStoreSelectors,
    QuestionnaireStoreActions
} from '@app/root-store';

import {
  QuestionnaireStatus, EmailTemplates, ReportGridTypes,
  SelectStatusesEnum, SortStatusesEnum } from '@app/enums';
import { UserRoutesEnum } from '@app/_user/enums';
import { Questionnaire, Keys, User, SendEmailTemplate } from '@app/models';
import {
  fromIsoDate,
  getFilteredParticipants,
  fillCorrespondingFiltersDataStorage,
  fillAllFiltersDataStorage,
  isFiltersEmpty,
  clearFiltersDataStorage,
  updateFilteredParticipants } from '@app/utils';
import { InformationDialogComponent, ConfirmationDialogComponent } from '@app/components';
import { QuestionnairesService, KeysService, ExportService } from '@app/services';
import { emailRegex } from '@app/contants';

@Component({
  selector: 'app-invitation-emails',
  templateUrl: './invitation-emails.component.html',
  styleUrls: ['./invitation-emails.component.scss']
})
export class InvitationEmailsComponent implements OnInit, OnDestroy, AfterViewInit {

  private _item: Questionnaire;
  @Input()
  set item(item: Questionnaire) {
    this._item = item;
    this.getKeys();
    this.getTemplates();
  }
  get item(): Questionnaire {
    return this._item;
  }

  @Input() allQuestionnaires: Questionnaire[] = [];
  @Input() isRes: boolean;
  @ViewChild('agGrid', { static: false }) agGrid: AgGridNg2;

  allKeys: Keys[] = [];
  keysControl = new FormControl(null, Validators.required);
  companyId: number;

  allData: User[] = [];
  rowData: User[] = [];
  filteredParticipants: User[] = [];
  columnDefs: any[];
  gridOptions: GridOptions;
  selectedRowsCount = 0;
  selectedUsersIds: number[] = [];

  selectStatuses: any[] = [];
  selectStatus = SelectStatusesEnum.INCOMPLETE;
  selectStatusControl = new FormControl();
  sortStatuses: any[] = [];
  sortStatus = SortStatusesEnum.FIRST;
  sortStatuseControl = new FormControl();

  emailControl = new FormControl();
  enabledSend: boolean = false;
  qControl = new FormControl();
  selsectedQid: number;
  templateInfo: string = '';

  remTemplates: SendEmailTemplate[] = [];
  invTemplates: SendEmailTemplate[] = [];
  resInvTemplates: SendEmailTemplate[] = [];
  invTemplate: SendEmailTemplate = null;
  remTemplate: SendEmailTemplate = null;
  resTemplate: SendEmailTemplate = null;

  filtersActive: boolean = true;
  lastFilterType: string = '';
  lastFilterTypeKey: string = '';

  allFilters = {
    p_location: [],
    p_date: [],
    p_groups: [],
    p_saved: []
  };

  appliedFilters = {
    p_location: [],
    p_date: [],
    p_groups: [],
    p_saved: []
  };

  pageX: number = 0;
  pageY: number = 0;
  templateType = EmailTemplates;
  gridFilters = ReportGridTypes;
  loading: boolean = false;
  showValidation: boolean = false;
  frameworkComponents: any;

  private destroySubject$: Subject<void> = new Subject();

  constructor(
    private store$: Store<RootStoreState.State>,
    private dialog: MatDialog,
    private keysService: KeysService,
    private exportService: ExportService,
    private questionnairesService: QuestionnairesService
  ) {
    this.emailControl = new FormControl('', [this.validateEmails.bind(this)]);

    this.templateInfo = "{SPONSORNAME} Key's sponsor name; \
    {MANAGERNAME} Manager Name; {FIRSTNAME} Participant's First Name; \
    {LASTNAME} Participant's Family Name; {FULLNAME} Participant's first and family name; \
    {PASSWORD} Participant's password; {RESULTS} Participant's % score (in case of a completed Assessment); \
    {PENAME} Profile/Assessment's title; {PEDESCRIP} Profile/Assessment's description; \
    {PEURL} Profile/Assessment's url; {REG_FORM_LINK} Direct url to the FE registration form; \
    {EMAIL} Participant's email; {KEY} Company's Key; {ADMINNAME} Key's Admin Name; \
    {ADMINEMAIL} Key's Admin Email; {CAREER_CATEGORY} User's Career Category; \
    {JOBTITLE} User's Job Title; {COUNTRY} User's country; {CITY} User's city; \
    {COMPLETED_LIST} participants who completed Profile/Assessment; \
    {RES_LINK} link to view Assessment results online (Implemented only for Result Emails templates and for Assessments 'Confirmation Email'); \
    Enimal Icons: {LION}, {LEOPARD}, {CHEETAH}, {HYENA}, {WOLF}";

    this.selectStatuses = [
      {title: SelectStatusesEnum.ALL, id: SelectStatusesEnum.ALL, enabled: true},
      {title: SelectStatusesEnum.INCOMPLETE, id: SelectStatusesEnum.INCOMPLETE, enabled: true},
      {title: SelectStatusesEnum.COMPLETE, id: SelectStatusesEnum.COMPLETE, enabled: true},
      {title: SelectStatusesEnum.NONE, id: SelectStatusesEnum.NONE, enabled: true}
    ];

    this.sortStatuses = [
      {title: SortStatusesEnum.FIRST, id: SortStatusesEnum.FIRST, enabled: true},
      {title: SortStatusesEnum.FAMILY, id: SortStatusesEnum.FAMILY, enabled: true},
      {title: SortStatusesEnum.COUNTRY, id: SortStatusesEnum.COUNTRY, enabled: true},
      {title: SortStatusesEnum.COMPLETION, id: SortStatusesEnum.COMPLETION, enabled: true}
    ];

    this.frameworkComponents = {

    };
  }

  ngOnInit() {
    this.lastFilterTypeKey = this.isRes ? 'lastFilterTypeRes' : 'lastFilterType';
    this.lastFilterType = sessionStorage.getItem(this.lastFilterTypeKey) || '';
    this.gridOptions = {
      rowData: this.rowData,
      columnDefs: this.columnDefs,
      onSelectionChanged: this.onSelectionChanged.bind(this),
      suppressLoadingOverlay: true,
      rowHeight: 22,
      headerHeight: 22,
      rowClassRules: {
        'timeout': this.checkIfTimeout.bind(this),
        'completed': this.checkIfCompleted.bind(this)
      },
      onGridSizeChanged: () => {
        if (this.gridOptions.api) {
          this.gridOptions.api.sizeColumnsToFit();
        }
      },
      onGridReady: () => {
        this.renderGrid();
      }
    };

    this.subscribeOnActions();

    this.keysControl.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(value => {
        this.setEnableSend();

        if (!value || value === this.companyId) return;

        const keyId = parseInt(value, 10);
        const obj: Keys = this.allKeys.find((key) => (key.id === value));
        if (obj.not_activated) {
          this.confirmActivation(obj.title, keyId);
          return;
        }
        this.keyChanged(keyId);
      });

    this.sortStatuseControl.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(value => {
        this.sortStatus = value;
        this.storeSortCriterium();
        if (!this.gridOptions.api) { return; }
        this.sort();
        this.gridOptions.api.setRowData(null);
        this.gridOptions.api.setRowData(this.rowData);
        this.gridOptions.api.sizeColumnsToFit();
        this.select();
      });

      this.selectStatusControl.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(value => {
        this.selectStatus = value;
        this.storeSelectCriterium();
        this.select(true);
      });

      this.qControl.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(value => {
        this.selsectedQid = value;
      });
    this.initiateSortAndSelect();
    this.initTemplatesIds();
  }

  ngAfterViewInit() {
    this.initiateFilteredUsers();
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  /**
   * Sibscribes (one time) on sort and select states
   */
  private initiateSortAndSelect() {
    if (this.isRes) {
      combineLatest(
        this.store$.select(state => state.questionnaire.resSelectCriterium),
        this.store$.select(state => state.questionnaire.resSortCriterium)
      )
        .pipe(take(1))
        .subscribe(([selectCriterium, sortCriterium]) => {
          this.selectStatus = selectCriterium;
          this.sortStatus = sortCriterium;
          this.selectStatusControl.setValue(selectCriterium);
          this.sortStatuseControl.setValue(sortCriterium);
        });
    } else {
      combineLatest(
        this.store$.select(state => state.questionnaire.selectCriterium),
        this.store$.select(state => state.questionnaire.sortCriterium)
      )
        .pipe(take(1))
        .subscribe(([selectCriterium, sortCriterium]) => {
          this.selectStatus = selectCriterium;
          this.sortStatus = sortCriterium;
          this.selectStatusControl.setValue(selectCriterium);
          this.sortStatuseControl.setValue(sortCriterium);
        });
    }
  }

   /**
   * Sibscribes (one time) on filtered users state
   */
  private initiateFilteredUsers() {
    if (this.isRes) {
      this.store$.pipe(
        distinctUntilChanged(),
        take(1),
        select(QuestionnaireStoreSelectors.selectResFilteredUsers))
        .subscribe((users: User[]) => {
          this.filteredParticipants = JSON.parse(JSON.stringify(users));
          this.applyFiltersToGrid();
      });
      this.store$.pipe(
        distinctUntilChanged(),
        take(1),
        select(QuestionnaireStoreSelectors.selectResAppliedFilters))
        .subscribe((filters: any[]) => {
          this.appliedFilters = JSON.parse(JSON.stringify(filters));
          this.applyFiltersToGrid();
      });
    } else {
      this.store$.pipe(
        distinctUntilChanged(),
        take(1),
        select(QuestionnaireStoreSelectors.selectFilteredUsers))
        .subscribe((users: User[]) => {
          this.filteredParticipants = JSON.parse(JSON.stringify(users));
          this.applyFiltersToGrid();
      });
      this.store$.pipe(
        distinctUntilChanged(),
        take(1),
        select(QuestionnaireStoreSelectors.selectAppliedFilters))
        .subscribe((filters: any[]) => {
          this.appliedFilters = JSON.parse(JSON.stringify(filters));
          this.applyFiltersToGrid();
      });
    }
  }

  /**
   * Sibscribes (one time) on inv/rem/inv_res templates states
   */
  private initTemplatesIds() {
    this.store$.pipe(
      distinctUntilChanged(),
      take(1),
      select(QuestionnaireStoreSelectors.selectInvTemplate))
      .subscribe((template: SendEmailTemplate) => {
        this.invTemplate = template;
    });
    this.store$.pipe(
      distinctUntilChanged(),
      take(1),
      select(QuestionnaireStoreSelectors.selectRemTemplate))
      .subscribe((template: SendEmailTemplate) => {
        this.remTemplate = template;
    });
    this.store$.pipe(
      distinctUntilChanged(),
      take(1),
      select(QuestionnaireStoreSelectors.selectResTemplate))
      .subscribe((template: SendEmailTemplate) => {
        this.resTemplate = template;
    });
  }

  confirmActivation(keyName: string, keyId: number) {
    const text = 'The key "' + keyName + '" needs to have this profile/assessment/feedback activated. Do you wish to do this now?';
    const dialogRef = this.openConfirmationDialog(text, 'Confirm Activation');
    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroySubject$))
    .subscribe((data: any) => {
      if (data) {
        this.keysService.activateQuestionnaire({cId: keyId, qId: this.item.id})
        .subscribe(() => {
          this.companyId = keyId;
          this.selectedRowsCount = 0;
          this.getKeys();
          this.keyChanged(keyId);
        }, err => {
          this.openInformationDialog(err.message, 'Error');
        });
      } else {
        if (this.companyId) this.keysControl.setValue(this.companyId);
        else this.keysControl.reset();
      }
    });
  }

  private keyChanged(keyId: number) {
    // Reset data
    this.selectedUsersIds = [];
    this.selectedRowsCount = 0;
    this.rowData = [];
    this.enabledSend = false;
    clearFiltersDataStorage(this.appliedFilters);
    this.lastFilterType = '';
    this.lastFilterTypeKey = '';

    if (this.isRes) {
      this.store$.dispatch(new QuestionnaireStoreActions.SetResAppliedFilters({
        p_location: [],
        p_date: [],
        p_groups: [],
        p_saved: []
      }));
      this.store$.dispatch(new QuestionnaireStoreActions.SetResFilteredUsers([]));
      this.store$.dispatch(new QuestionnaireStoreActions.SetResSelectedUsersIds([]));
    } else {
      this.store$.dispatch(new QuestionnaireStoreActions.SetAppliedFilters({
        p_location: [],
        p_date: [],
        p_groups: [],
        p_saved: []
      }));
      this.store$.dispatch(new QuestionnaireStoreActions.SetFilteredUsers([]));
      this.store$.dispatch(new QuestionnaireStoreActions.SetSelectedUsersIds([]));
    }


    if (this.isRes) {
      this.store$.dispatch(new QuestionnaireStoreActions.LoadResUsersRequestAction(keyId));
      this.store$.dispatch(new QuestionnaireStoreActions.SetResCompanyIdAction(keyId));
    } else {
      this.store$.dispatch(new QuestionnaireStoreActions.LoadUsersRequestAction(keyId));
      this.store$.dispatch(new QuestionnaireStoreActions.SetCompanyIdAction(keyId));
    }
    this.loading = true;
  }

  private subscribeOnActions() {
    if (this.isRes) {
      this.store$.pipe(
        distinctUntilChanged(),
        takeUntil(this.destroySubject$),
        select(QuestionnaireStoreSelectors.selectResSelectedUsersIds)
      ).subscribe((state: number[]) => {
        this.selectedUsersIds = state;
        if (state) {
          this.selectedRowsCount = state.length;
        }
      });
      this.store$.pipe(
        distinctUntilChanged(),
        takeUntil(this.destroySubject$),
        select(QuestionnaireStoreSelectors.selectResUsers))
        .subscribe((users: User[]) => {
          if (users) {
            this.allData = JSON.parse(JSON.stringify(users));
            this.rowData = JSON.parse(JSON.stringify(users));
            this.updateFiltersAndUsers();
          }
          this.loading = false;
      });

      this.store$.pipe(
        distinctUntilChanged(),
        takeUntil(this.destroySubject$),
        select(QuestionnaireStoreSelectors.selectResCompanyId))
        .subscribe((id: number) => {
          this.companyId = id;
          this.selectedRowsCount = 0;
          if (id) {
            this.keysControl.setValue(this.companyId);
          }
      });
    } else {
      this.store$.pipe(
        distinctUntilChanged(),
        takeUntil(this.destroySubject$),
        select(QuestionnaireStoreSelectors.selectSelectedUsersIds)
      ).subscribe((state: number[]) => {
        this.selectedUsersIds = state;
        if (state) {
          this.selectedRowsCount = state.length;
        }
      });
      this.store$.pipe(
        distinctUntilChanged(),
        takeUntil(this.destroySubject$),
        select(QuestionnaireStoreSelectors.selectUsers))
        .subscribe((users: User[]) => {
          if (users) {
            this.allData = JSON.parse(JSON.stringify(users));
            this.rowData = JSON.parse(JSON.stringify(users));
            this.updateFiltersAndUsers();
          }
          this.loading = false;
      });

      this.store$.pipe(
        distinctUntilChanged(),
        takeUntil(this.destroySubject$),
        select(QuestionnaireStoreSelectors.selectCompanyId))
        .subscribe((id: number) => {
          this.companyId = id;
          this.selectedRowsCount = 0;
          if (id) {
            this.keysControl.setValue(this.companyId);
          }
      });
    }

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(QuestionnaireStoreSelectors.selectErrorState))
      .subscribe((error: any) => {
        if (error) {
          this.loading = false;
          this.openInformationDialog(error.message, 'Error');
        }
    });
  }

   /**
   * Set data to fill grid table
   */
  private setDataSource() {
    this.rowData.forEach((user: User) => {
      user.full_data = (user.first_name || '') + ' ' + (user.last_name || '') +
        ' - ' + (user.email || '');
      if (user.country_id) {
        user.full_data += ' - ' + (<any>user).country.name;
      }
      if (user.p_location) {
        user.full_data += ', ' + user.p_location;
      }
      if (user.p_date) {
        user.full_data += ', ' + this.dateFormatter(user.p_date);
      }
      if (user.p_date2) {
        user.full_data += ', ' + this.dateFormatter(user.p_date2);
      }
      if (user.p_groups) {
        user.full_data += ', ' + user.p_groups;
      }
      if (user.p_saved) {
        user.full_data += ', ' + user.p_saved;
      }
    });

    this.columnDefs = [
      {
        headerName: '#', width: 33, maxWidth: 33, suppressMenu: true,
        sortable: false, resizable: false, pinned: true, checkboxSelection: true,
      },
      {
        headerName: 'Participants', minWidth: 60, field: 'full_data',
        cellClassRules: { 'crossed_out': this.checkIfCrossedOut.bind(this) }
      }
    ];

    if (this.gridOptions && this.gridOptions.api) {
      this.renderGrid();
    }
  }

  private renderGrid() {
    this.sort();
    this.gridOptions.api.setRowData(this.rowData);
    this.gridOptions.api.setColumnDefs(this.columnDefs);
    this.gridOptions.api.sizeColumnsToFit();

    this.select();
  }

  private select(isSelectRadioAction?: boolean) {
    if (!this.gridOptions.api) { return; }

    if (!this.selectedUsersIds.length || isSelectRadioAction) {
      switch (this.selectStatus) {
        case SelectStatusesEnum.ALL:
          this.selectDeselectAll(true);
        break;
        case SelectStatusesEnum.NONE:
          this.selectDeselectAll(false);
        break;
        case SelectStatusesEnum.INCOMPLETE:
          this.selectAllIncompleted();
        break;
        case SelectStatusesEnum.COMPLETE:
          this.selectAllCompleted();
        break;
        default:
          this.selectAllIncompleted();
      }
      const rowData = this.getSelectedRows();
      const ids = [];
      rowData.forEach((user: User) => {
        ids.push(user.id);
      });
      this.selectedUsersIds = ids;

      if (this.isRes) {
        this.store$.dispatch(new QuestionnaireStoreActions.SetResSelectedUsersIds(ids));
      } else {
        this.store$.dispatch(new QuestionnaireStoreActions.SetSelectedUsersIds(ids));
      }
    } else {
      this.gridOptions.api.forEachNode((node) => {
        this.selectedUsersIds.forEach((id: number) => {
          if (node.data.id === id) {
            node.setSelected(true, false, true);
          }
        });
      });
    }

    this.selectedRowsCount = this.agGrid.api.getSelectedNodes().length;
    this.setEnableSend();
  }

  private sort() {
    switch (this.sortStatus) {
      case SortStatusesEnum.FIRST:
        this.rowData.sort((a, b) => (a.first_name.localeCompare(b.first_name)));
      break;
      case SortStatusesEnum.FAMILY:
        this.rowData.sort((a, b) => {
          const first = a.last_name ? a.last_name : 'A';
          const second = b.last_name ? b.last_name : 'Z';
          return first.localeCompare(second);
        });
      break;
      case SortStatusesEnum.COUNTRY:
        this.rowData.sort((a, b) => {
          const first = (<any>a).country ? (<any>a).country.name : 'A';
          const second = (<any>b).country ? (<any>b).country.name : 'Z';
          return first.localeCompare(second);
        });
      break;
      case SortStatusesEnum.COMPLETION:
        this.rowData.sort((a, b) => {
          let first = new Date('1970-01-01 00:00:00');
          let second = new Date('1970-01-01 00:00:00');
          for (const attempt of (<any>a).attempts) {
            if (attempt.questionnaire_id === this._item.id) {
              first = new Date(attempt.end_date);
              break;
            }
          }
          for (const attempt of (<any>b).attempts) {
            if (attempt.questionnaire_id === this._item.id) {
              second = new Date(attempt.end_date);
              break;
            }
          }
          return second.getTime() - first.getTime();
        });
      break;
      default:
        this.rowData.sort((a, b) => (a.first_name.localeCompare(b.first_name)));
    }
  }

  private selectAllCompleted () {
    this.gridOptions.api.forEachNode((node) => {
      let completed = false;
      node.setSelected(false, false, true);
      node.data.attempts.forEach((attempt) => {
        if (attempt.questionnaire_id === this._item.id &&
          (attempt.status === QuestionnaireStatus.COMPLETED)) {
            completed = true;
        }
      });
      if (completed) { node.setSelected(true, false, true); }
      else { node.setSelected(false, false, true); }
    });
  }

  private selectAllIncompleted () {
    this.gridOptions.api.forEachNode((node) => {
      let completed = false;
      let active = true;
      node.setSelected(false, false, true);
      node.data.attempts.forEach((attempt) => {
        if (attempt.questionnaire_id === this._item.id &&
          (attempt.status === QuestionnaireStatus.COMPLETED)) {
            completed = true;
        }
      });
      for (const contact of node.data.u_q_contact) {
        if (contact.id_questionnaire === this._item.id && contact.contact === '0') {
          active = false;
        }
      }
      if (!completed && active) { node.setSelected(true, false, true); }
      else { node.setSelected(false, false, true); }
    });
  }

  private selectDeselectAll(doSelect: boolean) {
    if (doSelect) {
      this.gridOptions.api.selectAll();
      this.selectStatus = SelectStatusesEnum.ALL;
    } else {
      this.gridOptions.api.deselectAll();
      this.selectStatus = SelectStatusesEnum.NONE;
    }
  }

  private getSelectedRows() {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    return selectedData;
  }

  validateEmails(control: AbstractControl): ValidationErrors  {
    if (control.value === '') {
      if (!this.selectedRowsCount || !this.keysControl.value) this.enabledSend = false;
      return null;
    }

    let emails = control.value.replace(/\s/g, ',').replace(';', ',').split(',');
    emails = emails.filter(item => item !== '');
    const regex = emailRegex;

    for (let i = 0; i < emails.length; i++) {
      if (emails[i] === '' || !regex.test(emails[i])) {
        this.enabledSend = false;
        return { invalid_emails: {email: emails[i]} };
      }
    }

    if (!this.keysControl.value) {
      this.enabledSend = false;
      return null;
    }

    this.enabledSend = true;
    return null;
  }

  private getKeys() {
    this.keysService.getSortedByActivity(this.item.id).subscribe((keys: any[]) => {
      const activity = [];
      const no_activity = [];
      const created = [];
      const d = new Date();
      d.setMonth(d.getMonth() - 9);

      keys.forEach((key: Keys) => {
        const activated = (<any>key)['company-questionnaire-maps'].length > 0;
        key.not_activated = !activated;
        key.title += ' (' + key.company_key + ')';
        if ((<any>key).attemptsCount > 0) {
          (<any>key).typeStr = 'Participant activity < 9 months';
          activity.unshift(key);
        } else if (new Date(key.date_create) > d) {
          (<any>key).typeStr = 'Created < 9 months, no activity';
          created.unshift(key);
        } else if (activated) {
          (<any>key).typeStr = 'Activated, no activity < 9 months';
          no_activity.unshift(key);
        }
      });
      this.allKeys = [...activity, ...created, ...no_activity];
    }, err => {
      this.openInformationDialog(err.message, 'Error');
    });
  }

  getTemplates() {
    this.questionnairesService.getTemplatesByQuestId(this._item.id)
    .subscribe((templates: SendEmailTemplate[]) => {
      const remTemplates = [];
      const invTemplates = [];
      const resInvTemplates = [];
      templates.forEach((t: SendEmailTemplate) => {
        if (t.email_type === EmailTemplates.REM) {
          remTemplates.push(t);
        } else if (t.email_type === EmailTemplates.INV) {
          invTemplates.push(t);
        } else if (t.email_type === EmailTemplates.INV_RES) {
          resInvTemplates.push(t);
        }
      });

      this.remTemplates = remTemplates;
      this.invTemplates = invTemplates;
      this.resInvTemplates = resInvTemplates;
    });
  }

  reset() {
    this.keysControl.reset();
    this.qControl.reset();
    this.emailControl.setValue('');
    if (this.gridOptions && this.gridOptions.api) { this.gridOptions.api.setRowData(null); }
    this.selectedRowsCount = 0;
    this.companyId = NaN;
    this.rowData = [];
    this.enabledSend = false;
  }

  refresh() {
    this.getKeys();
    this.getTemplates();
    if (this.companyId) {
      if (this.isRes) {
        this.store$.dispatch(new QuestionnaireStoreActions.LoadResUsersRequestAction(this.companyId));
      } else {
        this.store$.dispatch(new QuestionnaireStoreActions.LoadUsersRequestAction(this.companyId));
      }
      this.loading = true;
    }
  }

  checkIfTimeout(params: any): boolean {
    for (const attempt of params.data.attempts) {
      if (attempt.questionnaire_id === this._item.id &&
        (attempt.status === QuestionnaireStatus.TIMEOUT)
      ) {
        return true;
      }
    }
    return false;
  }

  checkIfCompleted(params: any): boolean {
    for (const attempt of params.data.attempts) {
      if (attempt.questionnaire_id === this._item.id &&
        (attempt.status === QuestionnaireStatus.COMPLETED)
      ) {
        return true;
      }
    }
    return false;
  }

  checkIfCrossedOut(params: any): boolean {
    for (const contact of params.data.u_q_contact) {
      if (contact.id_questionnaire === this._item.id && contact.contact === '0') {
        return true;
      }
    }
    return false;
  }

  private storeFilteredUsers() {
    const filtered = JSON.parse(JSON.stringify(this.filteredParticipants));
    if (this.isRes) {
      this.store$.dispatch(new QuestionnaireStoreActions.SetResFilteredUsers(filtered));
    } else {
      this.store$.dispatch(new QuestionnaireStoreActions.SetFilteredUsers(filtered));
    }
  }

  private storeAppliedFilters() {
    const filters = JSON.parse(JSON.stringify(this.appliedFilters));
    if (this.isRes) {
      this.store$.dispatch(new QuestionnaireStoreActions.SetResAppliedFilters(filters));
    } else {
      this.store$.dispatch(new QuestionnaireStoreActions.SetAppliedFilters(filters));
    }
  }

  private storeSelectCriterium() {
    if (this.isRes) {
      this.store$.dispatch(new QuestionnaireStoreActions.SetResSelectCriterium(this.selectStatus));
    } else {
      this.store$.dispatch(new QuestionnaireStoreActions.SetSelectCriterium(this.selectStatus));
    }
  }

  private storeSortCriterium() {
    if (this.isRes) {
      this.store$.dispatch(new QuestionnaireStoreActions.SetResSortCriterium(this.sortStatus));
    } else {
      this.store$.dispatch(new QuestionnaireStoreActions.SetSortCriterium(this.sortStatus));
    }
  }

  /**
   * Returns Formated date from ISO to format('DD-MMM-YY')
   */
  private dateFormatter(param: any) {
    if (!param) return '';
    return fromIsoDate(param);
  }

  private setEnableSend() {
    if (this.agGrid.api) { this.selectedRowsCount = this.agGrid.api.getSelectedNodes().length; }

    if (this.emailControl.invalid || !this.keysControl.value || (!this.selectedRowsCount && !this.emailControl.value)) {
      this.enabledSend = false;
    } else {
      this.enabledSend = true;
    }
  }

  /** Events */

  onSelectionChanged(event) {
    this.setEnableSend();
    const rowData = this.getSelectedRows();
    const ids = [];
    rowData.forEach((user: User) => {
      ids.push(user.id);
    });

    this.selectedUsersIds = ids;

    if (this.isRes) {
      this.store$.dispatch(new QuestionnaireStoreActions.SetResSelectedUsersIds(ids));
    } else {
      this.store$.dispatch(new QuestionnaireStoreActions.SetSelectedUsersIds(ids));
    }
  }

  /**
   * If template is chosen, at least one user is chosen or entered valid emails:
   *  - calls sendEmails method.
   * @param $event (param from child component, contains SendEmailTemplate object)
   */
  onSend($event) {
    this.showValidation = true;
    const template = $event.template;
    if (!template || this.emailControl.invalid
      || (!this.selectedRowsCount && !this.emailControl.value)) { return; }

    this.sendEmails(template);
  }

  groupValueFn = (item) => {
    return {groupName: item};
  }

  /**
   * Sends to api service all needed data to send emails to users.
   * @param template (selected template)
   */
  private sendEmails(template: SendEmailTemplate) {
    this.loading = true;
    const rowData = this.getSelectedRows();
    let userIds = '';
    rowData.forEach((user: User) => {
      userIds += user.id + ',';
    });
    const key = this.allKeys.find((k: Keys) => (k.id === this.companyId));

    if (this.isRes) {
      this.questionnairesService.sendResultEmails(template, userIds, key, this.item)
      .subscribe((count) => {
        this.loading = false;
        const msg = count + '  emails sent.';
        this.openInformationDialog(msg, 'Information');
      }, err => {
        this.loading = false;
        this.openInformationDialog(err.message, 'Error');
      });

      return;
    }

    this.questionnairesService
    .sendEmails(
      template,
      userIds,
      key,
      this.item,
      UserRoutesEnum.AUTHENTICATE,
      this.emailControl.value).subscribe((count) => {
      this.loading = false;
      const msg = count + '  emails sent.';
      this.openInformationDialog(msg, 'Information');
    }, err => {
      this.loading = false;
      this.openInformationDialog('SOME emails were not send. ERROR: ' + err.message, 'Error');
    });
  }

  onCopy() {
    if (!this.selsectedQid) return;

    this.questionnairesService.getTemplatesByQuestId(this.selsectedQid)
    .subscribe((templates: SendEmailTemplate[]) => {
      let templatesIds = '';

      for (let i = 0; i < templates.length; i++) {
        const t: SendEmailTemplate = templates[i];

        if ((!this.isRes && t.email_type === EmailTemplates.INV_RES) ||
            (this.isRes && t.email_type !== EmailTemplates.INV_RES)) {
            continue;
        }
        let obj: SendEmailTemplate;
        if (t.email_type === EmailTemplates.REM) {
          obj = this.remTemplates.find((key) => (key.email_desc === t.email_desc));
        } else if (t.email_type === EmailTemplates.INV) {
          obj = this.invTemplates.find((key) => (key.email_desc === t.email_desc));
        } else if (t.email_type === EmailTemplates.INV_RES) {
          obj = this.resInvTemplates.find((key) => (key.email_desc === t.email_desc));
        }
        if (!obj) {
          templatesIds += t.id + ',';
        }
      }

      if (templatesIds.length === 0) {
        this.openInformationDialog('Templates were not copied since selected templates already in list', 'Templates already in list');
        return;
      }

      this.loading = true;

      this.questionnairesService.copyTemplates({ids: templatesIds, quest_id: this.item.id})
      .subscribe((resp: number) => {
        this.loading = false;
        this.getTemplates();
        this.openInformationDialog((resp) + ' templates were copied', 'Copy Success');
      }, err => {
        this.loading = false;
        this.openInformationDialog(err.message, 'Error');
      });
    });
  }

  triggerFilterActive() {
    this.filtersActive = !this.filtersActive;
    this.applyFiltersToGrid();
  }

  /**
   * Stores chosen template into the root store.
   * @param type (tab type)
   * @param template (SendEmailTemplate)
   */
  templateUpdated(type: EmailTemplates, template: SendEmailTemplate) {
    switch (type) {
      case EmailTemplates.INV:
        this.store$.dispatch(new QuestionnaireStoreActions.SetInvTemplateAction(template));
        break;
      case EmailTemplates.REM:
        this.store$.dispatch(new QuestionnaireStoreActions.SetRemTemplateAction(template));
        break;
      case EmailTemplates.INV_RES:
        this.store$.dispatch(new QuestionnaireStoreActions.SetResTemplateAction(template));
        break;
    }
  }

  /**Filters methods */
  /**
   * Fills appropriate array of selected filters.
   * Sets currentFilter value.
   * Stores filtered participants to root store.
   * @param $event (
   * - type: filter criterium (date, location, ...)
   * - values: list of filters selected for this criterium
   * - event.clickedRowData.value
   * - isSelected: boolean (true if selected, false if deselected)
   */
  public onFilterChanged(event) {
    /**
     * Refresh filters if picked new filter with click
     */
    if (event.isSelected && event.values.length === 1) {
      clearFiltersDataStorage(this.appliedFilters);
    }
    this.appliedFilters[event.type] = event.values.map(v => v.value);

    this.filteredParticipants = getFilteredParticipants(
      this.allData,
      this.appliedFilters,
      event.type,
      event.isSelected ? this.appliedFilters[event.type] : [event.clickedRowData.value],
      event.isSelected
    );

    this.lastFilterType = event.type;
    sessionStorage.setItem(this.lastFilterTypeKey, this.lastFilterType);
    this.addCorrespondingFilters(event.type);
    this.applyFiltersToGrid();

    this.storeFilteredUsers();
    this.storeAppliedFilters();
  }

  /**
   * Applies filters to participants grid.
   */
  private applyFiltersToGrid() {
    if (!isFiltersEmpty(this.appliedFilters) && this.filtersActive) {
      this.rowData = this.filteredParticipants;
    } else {
      this.rowData = this.allData.slice();
    }
    this.setDataSource();
  }

  private addCorrespondingFilters(currentFilterKey: string) {
    fillCorrespondingFiltersDataStorage(this.filteredParticipants, this.appliedFilters, currentFilterKey);
  }

  /**
   * Fills arrays of allFilters object.
   * Sorts each filter column.
   */
  private updateFiltersAndUsers() {
    fillAllFiltersDataStorage(this.rowData, this.allFilters);

    const wereFiltersEmpty = isFiltersEmpty(this.appliedFilters);
    this.updateAppliedFilters();
    if (!wereFiltersEmpty) { this.storeAppliedFilters(); }

    if (!isFiltersEmpty(this.appliedFilters)) {

      /*this.filteredParticipants = updateFilteredParticipants(
        this.allData,
        this.appliedFilters)
      ;*/

      this.filteredParticipants = getFilteredParticipants(
        this.allData,
        this.appliedFilters,
        this.lastFilterType,
        this.appliedFilters[this.lastFilterType],
        true
      );
      this.storeFilteredUsers();
    }

    this.applyFiltersToGrid();
    this.setDataSource();
  }

  /**
   * Removes value from previously selected filters if this value was deleted or modified.
   * E.g. if "Location1" was selected and then deleted in participant's settings (and only one
   * participant had "Location1" location)
   */
  private updateAppliedFilters() {
    const appliedFiltersKeys = Object.keys(this.appliedFilters);
    appliedFiltersKeys.forEach(key => {
      this.appliedFilters[key] = this.appliedFilters[key].filter((value) => {
        return this.allFilters[key].find((v) => v === value);
      });
    });
  }
/**********************************End Filters methods ***************************************************************************/

  getUserIds(selectedRows) {
    const userIds = [];
    selectedRows.forEach(row => {
      userIds.push(row.id);
    });
    return userIds;
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

  /**
   * Download table data + Questionnaires questions and answers of selected Users
   */
  exportDetailed($event) {
    if (this.selectedRowsCount === 0) {
      this.pageX = $event.clientX - 150;
      this.pageY = $event.pageY + 50;
      if (this.pageX < 0 ) { this.pageX = 0; }
      this.showSelectionWarning();
      return;
    }
    this.loading = true;
    const userIds = this.getUserIds(this.getSelectedRows());
    this.keysService.exportParticipantsResponses(this.companyId, this.item.id, userIds)
      .subscribe(response => {
        this.loading = false;
        this.exportService.exportParticipantsResponses(response);
      }, error => {
        this.loading = true;
        this.openInformationDialog(error.message, 'Error');
      });
  }

  private openConfirmationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '500px',
      data: {
        title: title,
        text: text
      }
    });
  }

  private openInformationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(InformationDialogComponent, <any>{
      width: '400px',
      data: {
        title: title,
        text: text,
        noTimer: true
      }
    });
  }

}
