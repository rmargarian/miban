import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs/index';
import { takeUntil, switchMap } from 'rxjs/operators';
import { ColDef, GridOptions } from 'ag-grid-community';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

import * as fs from 'file-saver';

import {
  AdminService,
  AuthenticationService,
  ExportService,
  KeysService,
  QuestionnairesService } from '@app/services';
import { ReportGridTypes, QuestionnaireStatus, QuestionnaireType } from '@app/enums';
import { ReportsService } from '@app/_reports/services';
import { fromIsoDate,
  gridComparator,
  dateComparator,
  dateStringComparator,
  getFilteredParticipants,
  fillAllFiltersDataStorage,
  isFiltersEmpty,
  clearFiltersDataStorage } from '@app/utils';
import { User } from '@app/models';
import { InformationDialogComponent, ConfirmationDialogComponent } from '@app/components';
import {
  CreatedReportsDialogComponent
} from '@app/_reports/components/created-reports-dialog/created-reports-dialog.component';
import { GraphsBaseComponent } from '@app/_reports/components/graphs/graphs-base/graphs-base.component';
import { SvgToImgService } from '@app/services/svg-to-img.service';
import { ReportRendererComponent } from '@app/_reports/components/report-renderer/report-renderer.component';
import { MoreTextToEmailDialogComponent } from '@app/_reports/components/more-text-to-email-dialog/more-text-to-email-dialog.component';
import { StatusRendererComponent } from '@app/_reports/components/report-renderer/status-renderer/status-renderer.component';

interface FiltersFields {
  state_name: string[];
  city: string[];
  last_attempt: string[];
  country: string[];
  career: string[];
  department: string[];
  job_title: string[];
  p_location: string[];
  p_date: string[];
  p_saved: string[];
  p_groups: string[];
}

@Component({
  selector: 'app-generate-report',
  templateUrl: './generate-report.component.html',
  styleUrls: ['./generate-report.component.scss']
})
export class GenerateReportComponent implements OnInit, OnDestroy {

  @ViewChild('reportRenderer', { static: false }) reportRenderer: ReportRendererComponent;

  form: FormGroup;
  private destroySubject$: Subject<void> = new Subject();
  gridFilters = ReportGridTypes;
  gridOptions: GridOptions;
  gridApi;
  frameworkComponents: any;
  rowData: any[] = [];
  filteredParticipants: User[] = [];
  rowsCount: number = 0;
  allQuestionnaires = [];
  keys: any[];
  selectedKeysIds: number[] = [];
  isForEmail: boolean = false;

  colour = '#94AE0A';
  colours: any[] = [];

  public companies;
  public nameOfQuestionnaire: string;
  public reportName: string;

  fullList: any[] = [];
  allData: any[] = [];
  selectionTick: boolean = false;
  isSelectedAllParticipants: boolean = true;
  showCompletedOnly: boolean = false;

  moreTextToEmail: string = '';

  allFilters: FiltersFields = {
    state_name: [],
    city: [],
    last_attempt: [],
    country: [],
    career: [],
    department: [],
    job_title: [],
    p_location: [],
    p_date: [],
    p_saved: [],
    p_groups: []
  };

  appliedFilters: FiltersFields = {
    state_name: [],
    city: [],
    last_attempt: [],
    country: [],
    career: [],
    department: [],
    job_title: [],
    p_location: [],
    p_date: [],
    p_saved: [],
    p_groups: []
  };

  columnDefs: ColDef[] = [];

  loading: boolean;
  userDetail: any;
  generatedReport: any;

  splitedHeader: any[];
  gridUsers: any[] = [];
  largeAgGridTemplate: number;

  graphs: GraphsBaseComponent[] = [];

  constructor(protected formBuilder: FormBuilder,
              private questionnaireService: QuestionnairesService,
              private reportService: ReportsService,
              public dialog: MatDialog,
              private adminService: AdminService,
              private keysService: KeysService,
              private authService: AuthenticationService,
              private svgToImgService: SvgToImgService,
              private exportService: ExportService,
              public sanitizer: DomSanitizer) {
    this.loading = true;
    this.questionnaireService.getAllQuestionnaires('["id","description", "title","type"]')
      .subscribe(questionnaires => {
        this.loading = true;
        const questionnairesSorted = this.questionnaireService.splitQuestionnairesByType(questionnaires);
        this.allQuestionnaires = questionnairesSorted.profiles.concat(questionnairesSorted.assessments, questionnairesSorted.feedbacks);

        this.loading = false;
      });
    this.frameworkComponents = {
      statusRenderer: StatusRendererComponent
    };

    this.setCollDefs();

    this.gridOptions = {
      rowHeight: 25,
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: false,
        comparator: gridComparator
      },
      onRowSelected: () => {
        this.rowsCount = this.gridOptions.api.getSelectedRows().length;
      }
    };

    this.colours = [{value: '#94AE0A'}, {value: '#0094D8'}];
  }

  ngOnInit() {
    this.userDetail = this.authService.getUserDetails();
    this.form = this.formBuilder.group({
      'questionnaire': [, Validators.required],
      'keys': [, Validators.required],
      'show_all_keys': [true],
      'emails': [],
      'report_name': [],
      'names': [1],
      'cloud': [true],
      'hide_empty': [false]
    });

    this.form.controls['questionnaire'].valueChanges.subscribe(() => {
      this.loading = true;
      if (this.form.controls['show_all_keys'].value === true) {
        this.getAllCompaniesByQuestId();
      } else {
        this.getCompaniesByQuestIdWithCompletedQuest();
      }
      this.generatedReport = null;
      this.setCollDefs();
    });

    this.form.controls['keys'].valueChanges.subscribe(selectedKeysIds => {
      this.selectedKeysIds = selectedKeysIds;
      this.reload();
    });

    this.form.controls['show_all_keys'].valueChanges.subscribe(showAll => {
      this.loading = true;
      if (showAll) {
        this.getAllCompaniesByQuestId();
      } else {
        this.getCompaniesByQuestIdWithCompletedQuest();
      }
    });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  private setCollDefs() {
    this.columnDefs = [
      {headerName: 'First Name', field: 'first_name', minWidth: 40},
      {headerName: 'Last Name', field: 'last_name', minWidth: 40},
      {headerName: '',
        width: 38,
        minWidth: 38,
        field: 'attempts',
        suppressMenu: true,
        comparator: this.statusComparator,
        cellRenderer: 'statusRenderer',
        cellClassRules: {'overflow-unset': () => true}
      },
      {headerName: 'Job Title', field: 'job_title', minWidth: 40}];

      if (this.form) {
        const qId = this.form.controls['questionnaire'].value;
        if (qId === 124) {
          this.columnDefs.push({headerName: 'Organization', field: 'organization', minWidth: 40});
        }
      }

      const tail = [
      {headerName: 'Department', field: 'department', minWidth: 40},
      {headerName: 'Country', field: 'country.name', minWidth: 40},
      {headerName: 'City', field: 'city'},
      {headerName: 'Completion', field: 'end_date', minWidth: 40, cellRenderer: this.dateFormatter, sort: 'desc', comparator: dateComparator},
      {headerName: 'Location', field: 'p_location', minWidth: 40},
      {headerName: 'Date', field: 'p_date', minWidth: 40, cellRenderer: this.dateFormatter, comparator: dateStringComparator},
      {headerName: 'Groups', field: 'p_groups', minWidth: 40},
      {headerName: 'Saved', field: 'p_saved', minWidth: 40}
    ];

    this.columnDefs = this.columnDefs.concat(tail);

    if (this.gridOptions && this.gridOptions.api) {
      this.gridOptions.api.setColumnDefs(this.columnDefs);
      this.gridApi.sizeColumnsToFit();
    }
  }

  groupValueFn = (item) => {
    switch (item) {
      case 2:
        return {groupName: 'Profiles'};
      case 3:
        return {groupName: 'Feedbacks'};
      case 1:
        return {groupName: 'Assessments'};
    }
  }

  private statusComparator(value_a, value_b) {
    return value_a[0].status - value_b[0].status;
  }

  public onFilterChanged(event) {
    /**
     * Refresh filters if picked new filter with click
     */
    if (event.isSelected && event.values.length === 1) {
      clearFiltersDataStorage(this.appliedFilters);
    }
    this.appliedFilters[event.type] = event.values.map(v => v.value);
    this.filteredParticipants = getFilteredParticipants(
      this.fullList,
      this.appliedFilters,
      event.type,
      event.isSelected ? this.appliedFilters[event.type] : [event.clickedRowData.value],
      event.isSelected
    );
    this.applyFilters();
    this.sortFiltersData();
  }

  /**
   * Applies filters to participants grid.
   */
  private applyFilters() {
    this.appliedFilters = this.getFiltersFieldsOfParticipants(this.filteredParticipants);
    this.setRawData();
  }

  private setRawData() {
    let rowData = JSON.parse(JSON.stringify(this.fullList));
    if (!isFiltersEmpty(this.appliedFilters)) {
      rowData = JSON.parse(JSON.stringify(this.filteredParticipants));
    }

    if (this.showCompletedOnly) {
      const completed = rowData.filter(user => user.attempts[0].status === QuestionnaireStatus.COMPLETED);
      this.rowData = completed;
    } else {
      this.rowData = rowData;
    }
  }

  private sortFiltersData() {
    for (const key in this.allFilters) {
      if (this.allFilters.hasOwnProperty(key)) {
        if (key === 'p_date') {
          this.allFilters[key].sort(function (d1, d2) {
            return new Date(d1).getTime() - new Date(d2).getTime();
          });
        } else {
          this.allFilters[key].sort();
        }
        this.allFilters[key].sort((filterValueA, filterValueB) => {
          const selectedFilters = this.appliedFilters[key];
          const isASelected: any = selectedFilters.indexOf(filterValueA) !== -1;
          const isBSelected: any = selectedFilters.indexOf(filterValueB) !== -1;
          return isBSelected - isASelected;
        });
      }
      this.allFilters[key] = this.allFilters[key].slice();
    }
  }

  private getFiltersFieldsOfParticipants(users: User[]): FiltersFields {
    const filtersFields: FiltersFields = {
      state_name: [],
      city: [],
      last_attempt: [],
      country: [],
      career: [],
      department: [],
      job_title: [],
      p_location: [],
      p_date: [],
      p_saved: [],
      p_groups: []
    };

    fillAllFiltersDataStorage(users, filtersFields);
    return filtersFields;
  }

  private dateFormatter(param: any): string {
    if (!param) {
      return '';
    }
    return param.value ? fromIsoDate(param.value) : '';
  }

  selectAll(listName: string) {
    this.loading = true;
    let event;
    if (this.isSelectedAll(this.appliedFilters[listName], this.allFilters[listName])) {
      this.appliedFilters[listName] = [];
      event = {
        clickedRowData: {value: ''},
        isSelected: false,
        type: listName,
        values: []
      };
      this.onFilterChanged(event);
    } else {
      this.appliedFilters[listName] = this.allFilters[listName];
      event = {
        clickedRowData: {value: ''},
        isSelected: true,
        type: listName,
        values: this.allFilters[listName].map(item => {
          return {value: item};
        })
      };
      this.onFilterChanged(event);
    }
    this.loading = false;
  }

  public isSelectedAll(selectedList: string[], entireList: string[]): boolean {
    selectedList = selectedList.map(obj => JSON.stringify(obj)).sort();
    entireList = entireList.map(obj => JSON.stringify(obj)).sort();

    return JSON.stringify(selectedList) === JSON.stringify(entireList);
  }

  public selectParticipants() {
    if (!this.gridApi) {
      return;
    }
    this.gridApi.forEachNode(node => {
      node.setSelected(true);
    });
  }

  /**
   * Resets applied filters to empty arrays.
   * Fills arrays of allFilters object.
   * Sorts each filter column.
   * Initiates 'rowData' for users grid.
   */
  private initFiltersAndUsers() {
    this.resetAppliedFilters();
    fillAllFiltersDataStorage(this.fullList, this.allFilters);
    this.sortFiltersData();
    this.rowData = this.allData.slice();
  }

  private resetAppliedFilters() {
    const enabledFiltersKeys = Object.keys(this.appliedFilters);
    enabledFiltersKeys.forEach(key => {
      this.appliedFilters[key] = [];
    });
  }

  public selectAllParticipants() {
    this.isSelectedAllParticipants = !this.isSelectedAll(this.getSelectedRows(), this.rowData);
    this.gridApi.forEachNode(node => {
      node.setSelected(this.isSelectedAllParticipants);
    });
  }

  public getSelectedParticipants(): any[] {
    return this.gridApi.getSelectedRows().map(user => {
      return user.id;
    });
  }

  public switchParticipantsGridSelectionMode() {
    this.selectionTick = !this.selectionTick;
    this.gridOptions.rowMultiSelectWithClick = !this.selectionTick;
  }

  public switchSelectCompletedOnly() {
    this.showCompletedOnly = !this.showCompletedOnly;
    this.setRawData();
  }

  private setReportData(generatedReport) {
    this.generatedReport = generatedReport;
    this.companies = this.generatedReport.companies;
    this.nameOfQuestionnaire = this.generatedReport.questionnaire.title;
    this.generatedReport.reportQuestionnaire = {
      type: this.generatedReport.questionnaire.questionnaireType,
      title: this.generatedReport.questionnaire.title
    };
    this.generatedReport.showDelegates = this.form.controls['names'].value ? 'on' : null;
    this.generatedReport.showCloud = this.form.controls['cloud'].value ? 'on' : null;
    this.generatedReport.hideEmptyResponses = this.form.controls['hide_empty'].value ? 'on' : null;
    this.generatedReport.color = this.colour;
    this.reportName = this.generatedReport.name;
    this.splitedHeader = undefined;
    this.gridUsers = undefined;
  }

  public submit() {
    this.isForEmail = false;
    if (this.getSelectedParticipants().length === 0) return;

    this.loading = true;
    this.generatedReport = undefined;
    this.graphs = [];
    this.reportService.generateReport(this.form.controls['keys'].value,
      this.getSelectedParticipants(), this.form.controls['questionnaire'].value)
      .subscribe(generatedReport => {
        this.setReportData(generatedReport);
        this.loading = false;
      }, err => {
        this.loading = false;
        this.openInformationDialog(err.message, 'Error');
      });
  }

  public createReport() {
    this.isForEmail = false;
    this.loading = true;
    this.generatedReport = undefined;

    this.reportService.generateReport(this.form.controls['keys'].value,
      this.getSelectedParticipants(), this.form.controls['questionnaire'].value)
      .subscribe(generatedReport => {
        this.setReportData(generatedReport);
        this.reportService.createReport(
          this.form.controls['keys'].value,
          this.form.controls['questionnaire'].value,
          this.form.controls['report_name'].value,
          this.getRandomizedWrittenResponses())
          .subscribe(reports => {
            this.loading = false;
            const dialogRef = this.openNewCreatedReportsDialog([reports[0]]);
          }, err => {
            this.loading = false;
            this.openInformationDialog(err.message, 'Error');
          });
      }, err => {
        this.loading = false;
        this.openInformationDialog(err.message, 'Error');
      });
  }

  /**
   * Returns generatedReport with randomized written responses for all 'Profiles'
   * for saved client reports,
   * so that managers won't have an easy time figuring out who said what
   */
  private getRandomizedWrittenResponses(): any {
    if (this.generatedReport.questionnaire.questionnaireType !== QuestionnaireType.PROFILE) {
      return JSON.stringify(this.generatedReport);
    }
    const generatedReport = JSON.parse(JSON.stringify(this.generatedReport));
    generatedReport.questionnaire.groups.forEach(group => {
      group.questions.forEach(question => {
        if (question.comments && question.comments.length) {
          this.shuffle(question.comments);
        }
        if (question.answers && question.answers.length) {
          this.shuffle(question.answers);
        }
      });
    });

    return JSON.stringify(generatedReport);
  }

  private shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  public getUnique(list: string[]): string[] {
    const arr = [];
    for (let i = 0; i < list.length; i++) {
      if (!arr.includes(list[i])) {
        arr.push(list[i]);
      }
    }
    return arr;
  }

  public onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  public reload() {
    this.rowsCount = 0;
    const selectedKeysIds = this.selectedKeysIds;
    if (selectedKeysIds && selectedKeysIds.length > 0) {
      this.loading = true;
      this.reportService.getUsersByKeysAndQuestionnaire(selectedKeysIds, this.form.controls['questionnaire'].value)
        .subscribe(allData => {
          allData.forEach((user) => {
            (<any>user).end_date = (user.attempts && user.attempts.length) ?
              user.attempts[0].end_date : undefined;
          });
          this.fullList = JSON.parse(JSON.stringify(allData));
          this.allData = JSON.parse(JSON.stringify(allData));
          if (this.showCompletedOnly) {
            this.allData = this.fullList.filter(user => user.attempts[0].status === QuestionnaireStatus.COMPLETED);
          }
          this.generatedReport = undefined;
          this.initFiltersAndUsers();
          this.loading = false;
        });
    } else {
      this.fullList = [];
      this.allData = [];
      this.initFiltersAndUsers();
    }
  }

  public exportBestNegotiators(): void {
    if (this.getSelectedRows().length === 0) {
      return;
    }
    this.loading = true;
    const userIds = this.getUserIds(this.getSelectedRows());
    const companyIds = this.form.controls['keys'].value;
    const titles = [];
    const getExportBestNegotiatorsStreams = companyIds.map(item => {
      titles.push(this.keys.find((key) => (key.id === item)).title);
      return this.keysService.exportBestNegotiators(item, userIds);
    });
    combineLatest(...getExportBestNegotiatorsStreams)
      .subscribe((bestNegotiatorsExportsByCompanyId: any) => {
        this.exportService.exportBestNegotiators(bestNegotiatorsExportsByCompanyId);
        this.loading = false;
      }, error => {
        this.loading = false;
      });
  }

  public exportDetailedResponses(): void {
    if (this.getSelectedRows().length === 0) {
      return;
    }
    this.loading = true;
    const selectedUsersIds = this.getSelectedRows().map(item => {
      return item.id;
    });
    const companyIDs = this.form.controls['keys'].value;
    const selectedQuestionnaireId = this.form.controls['questionnaire'].value;
    const questionnairesDataStream = companyIDs.map(id => {
      return this.keysService.exportParticipantsResponses(id, selectedQuestionnaireId, selectedUsersIds);
    });
    combineLatest(...questionnairesDataStream)
      .subscribe(questionnairesDataMultiArray => {
        let users = questionnairesDataMultiArray.map(data => {
          return data['users'];
        });
        users = Array.prototype.concat(...users);
        const dataToExport = {
          questionnaireInfo: questionnairesDataMultiArray[0]['questionnaireInfo'],
          users: users
        };
        this.exportService.exportParticipantsResponses(dataToExport);
        this.loading = false;
      });
  }

  private getUserIds(selectedRows: any[]): any[] {
    const userIds = [];
    selectedRows.forEach(row => {
      userIds.push(row.id);
    });
    return userIds;
  }

  private getSelectedRows(): any[] {
    return this.gridApi.getSelectedRows();
  }

  private getCompaniesByQuestIdWithCompletedQuest() {
    this.reportService.getCompaniesByQuestId(this.form.controls['questionnaire'].value)
      .subscribe(data => {
        this.keys = data;
        this.loading = false;
        const keysIds = [];
        if (this.form.controls['keys'].value) {
          this.form.controls['keys'].value.forEach(keyId => {
            if (this.keys.find((key) => key.id === keyId)) {
              keysIds.push(keyId);
            }
          });
        }
        this.form.controls['keys'].setValue(keysIds.length ? keysIds : null);
      });
  }

  private getAllCompaniesByQuestId() {
    this.reportService.getAllKeysByQuestId(this.form.controls['questionnaire'].value)
      .subscribe(data => {
        this.keys = data;
        this.loading = false;
        const keysIds = [];
        if (this.form.controls['keys'].value) {
          this.form.controls['keys'].value.forEach(keyId => {
            if (this.keys.find((key) => key.id === keyId)) {
              keysIds.push(keyId);
            }
          });
        }
        this.form.controls['keys'].setValue(keysIds.length ? keysIds : null);
      }, err => {
        this.openInformationDialog(err.message, 'Error');
        this.loading = false;
      });
  }

  public getSelectedParticipantsCount(): number {
    if (!this.gridApi) return 0;
    return this.getSelectedParticipants().length;
  }

  openMoreTextToEmailSendDialog() {
    const dialogRef = this.moreTextToEmail ?
      this.openMoreTextToEmailDialog(this.moreTextToEmail) : this.openMoreTextToEmailDialog();
    dialogRef.afterClosed().pipe(takeUntil(this.destroySubject$))
      .subscribe(text => {
        this.moreTextToEmail = text || '';
      });
  }

  registerGraph(graph) {
    this.graphs.push(graph);
  }

  unregisterGraph(graph) {
    //this.graphs.splice(this.graphs.indexOf(graph), 1);
  }

  sendReportByEmail(): void {
    this.isForEmail = true;
    const qId = this.form.controls['questionnaire'].value;
    this.loading = true;

    /**For PIA generate report for Email with rects in legend
     * Will be removed when faces will be implemented for email also.
     * i.e. rollback this pull request:
     * https://bitbucket.negotiations.com/projects/PBO/repos/pfa_angular/pull-requests/464/diff
     */
    if (qId === 124) {
      this.generatedReport = undefined;
      this.graphs = [];
      this.reportService.generateReport(this.form.controls['keys'].value, this.getSelectedParticipants(), qId)
        .subscribe(generatedReport => {
          this.setReportData(generatedReport);
          setTimeout(() => {
            this.configureReportForEmail(qId);
          }, 1000);

        }, err => {
          this.loading = false;
          this.openInformationDialog(err.message, 'Error');
        });
    } else {
      this.configureReportForEmail(qId);
    }
  }

  private configureReportForEmail(qId: number) {
    const agGridTable = this.reportRenderer.agGridTable.nativeElement.childNodes[0];
    this.parseGridText(agGridTable.childNodes[0].innerText);

    const promises = [];
    let tableContent;
    this.graphs.forEach(graph => {
      const svgElement = graph.svgElement.cloneNode(true);
      try {
        const re = new RegExp(window.location.href, 'g');
        svgElement.innerHTML = svgElement.innerHTML.replace(re, '');
      } catch (error) {
      }
      promises.push(this.svgToImgService.d3SvgToPng(svgElement));
    });

    Promise.all(promises).then((imagesBase64: string[]) => {
      const reportBody = this.reportRenderer.reportBody.nativeElement;
      const reportHeader = document.querySelector('.report_header');
      let copiedReportBody = document.createElement('DIV');
      if (agGridTable.childNodes[0].innerText.indexOf('Score') !== -1) {
        tableContent = this.getContentFromElement('largeGridTemplate');
      } else {
        tableContent = this.getContentFromElement('smallGridTemplate');
      }
      copiedReportBody.innerHTML = this.moreTextToEmail;
      copiedReportBody.innerHTML += reportHeader.innerHTML;
      copiedReportBody.innerHTML += tableContent;
      this.applyStylesToEmailSending(reportBody);
      copiedReportBody.innerHTML += reportBody.innerHTML;
      this.graphs.forEach((graph) => {
        copiedReportBody.querySelector('#' + graph.id).parentElement.innerHTML = '<img src="cid:' + graph.id + '"/>';
      });
      const images = [];
      imagesBase64.forEach((img, index) => {
        images.push({
          imgBase64: img,
          imgId: this.graphs[index].id
        });
      });
      this.reportService.sendEmailReport(
        copiedReportBody.innerHTML, images,
        this.form.controls.emails.value,
        this.generateEmailSubject(this.nameOfQuestionnaire, this.companies))
        .subscribe((resp) => {
          const count = resp.accepted.length;
          this.loading = false;
          copiedReportBody = undefined;
          const msg = 'Successfully sent ' + count + ' email(s).';
          /**Regenerate Report for PIA again*/
          if (qId === 124) { this.submit(); }
          this.openInformationDialog(msg, 'Information');
        }, (err) => {
          /**Regenerate Report for PIA again*/
          if (qId === 124) { this.submit(); }
          this.loading = false;
          this.openInformationDialog(err.message, 'Error');
          copiedReportBody = undefined;
        });
    });
  }

  private generateEmailSubject(nameOfQuestionnaire: string, companies: any[]): string {
    return nameOfQuestionnaire + ' for ' + companies.map(company => company.title).join(',');
  }

  private getContentFromElement(id: string): string {
    document.getElementById(id).style.display = 'block';
    const html = document.getElementById(id).innerHTML;
    document.getElementById(id).style.display = 'none';
    return html;
  }

  public parseGridText(gridString: string) {
    const gridStrArr = gridString.split('\n');
    this.splitedHeader = [];
    this.gridUsers = [];

    if (gridString.indexOf('Score') !== -1) {
      this.splitedHeader = [gridStrArr[0], gridStrArr[1], gridStrArr[2]];
      gridStrArr.shift();
      gridStrArr.shift();
      gridStrArr.shift();
      if (this.form.controls.names.value) {
        for (let i = 0; i < gridStrArr.length; i = i + 3) {
          this.gridUsers.push([gridStrArr[i], gridStrArr[i + 1], gridStrArr[i + 2]]);
        }
      }
    } else {
      this.splitedHeader = [gridStrArr[0], gridStrArr[1]];
      gridStrArr.shift();
      gridStrArr.shift();
      if (this.form.controls.names.value) {
        for (let i = 0; i < gridStrArr.length; i = i + 2) {
          this.gridUsers.push([gridStrArr[i], gridStrArr[i + 1]]);
        }
      }
    }
    document.getElementById('smallGridTemplate').style.display = 'none';
    document.getElementById('largeGridTemplate').style.display = 'none';
  }

  /**
   * Saves generated report to DB.
   * Download Report in .pdf format.
   * Deletes saved report from DB.
   */
  downloadPDF() {
    this.isForEmail = false;
    this.loading = true;
    this.generatedReport = undefined;

    this.reportService.generateReport(this.form.controls['keys'].value,
      this.getSelectedParticipants(), this.form.controls['questionnaire'].value)
      .subscribe(generatedReport => {
        this.setReportData(generatedReport);

        let reportName = this.generatedReport.questionnaire.title + ' (';
        this.generatedReport.companies.forEach(elem => {
          reportName += elem.companyKey + ', ';
        });
        reportName = reportName.slice(0, -2);
        reportName += ') Report.pdf';
        let reportCode: string = '';

        this.reportService.createReport(
          [this.form.controls['keys'].value[0]],
          this.form.controls['questionnaire'].value,
          '',
          JSON.stringify(this.generatedReport)).pipe(
          switchMap(reports => {
            reportCode = reports[0].code;
            return this.reportService.generatePdf(reports[0].code, this.nameOfQuestionnaire);
          })
        ).subscribe((response) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          fs.saveAs(blob, reportName);
          this.loading = false;
          this.deleteByCode(reportCode);
        }, err => {
          this.openInformationDialog(err.message, 'Error');
          this.loading = false;
        });
      }, err => {
        this.openInformationDialog(err.message, 'Error');
        this.loading = false;
      });
  }

  private deleteByCode(code: string) {
    this.reportService.deleteReportByCode(code)
    .subscribe((response) => {
    }, err => {
      this.openInformationDialog(err.message, 'Error');
    });
  }

  private applyStylesToEmailSending(reportElement: any) {
    const averageBlocks = reportElement.getElementsByClassName('average-block') as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < averageBlocks.length; i++) {
      averageBlocks[i].style.textAlign = 'center';
      averageBlocks[i].style.fontWeight = 'bold';
      averageBlocks[i].style.fontSize = '14px';
      averageBlocks[i].style.marginTop = '15px';
    }

    const liElements = reportElement.querySelectorAll('ul li');
    for (let i = 0; i < liElements.length; i++) {
      liElements[i].style.width = '825px';
      liElements[i].style.marginBottom = '3px';
    }
  }

  private openNewCreatedReportsDialog(reports): MatDialogRef<any> {
    return this.dialog.open(CreatedReportsDialogComponent, <any>{
      data: {
        reports: reports,
        title: 'Success'
      }
    });
  }

  private openInformationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(InformationDialogComponent, <any>{
      width: '450px',
      data: {
        title: title,
        text: text,
        noTimer: true
      }
    });
  }

  private openMoreTextToEmailDialog(text?: string): MatDialogRef<any> {
    return this.dialog.open(MoreTextToEmailDialogComponent, <any>{
      width: '400px',
      data: {
        title: 'Add Text to the Email to send',
        text: text ? text : ''
      }
    });
  }
}
