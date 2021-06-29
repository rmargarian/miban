import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { AgGridNg2 } from 'ag-grid-angular';
import { SearchInputComponent } from '../../components/inputs/search-input/search-input.component';
import { GridOptions } from 'ag-grid-community';
import { MatDialog, MatDialogRef } from '@angular/material';
import { QuestionModalComponent } from './question-modal/question-modal.component';
import { QuestionService } from '@app/services/question.service';
import { TooltipService } from '@app/services/tooltip.service';
import { TitleCellRendererComponent } from './title-cell-renderer/title-cell-renderer.component';
import { Question } from '@app/models';
import { gridComparator } from '@app/utils';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { combineLatest, Subject } from 'rxjs/index';

import {
  RootStoreState,
  QuestionStoreSelectors,
  QuestionStoreActions
} from '@app/root-store';
import { FormControl } from '@angular/forms';
import { TypeCellRendererComponent } from '@app/pages/questions/type-cell-renderer/type-cell-renderer.component';
import { BelongsCellRendererComponent } from '@app/pages/questions/belongs-cell-renderer/belongs-cell-renderer.component';
import { GraphTypeCellRendererComponent } from '@app/pages/questions/graph-type-cell-renderer/graph-type-cell-renderer.component';

import {
  WarningDialogComponent,
  ConfirmationDialogComponent
} from '@app/components';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent implements OnInit, OnDestroy {

  @ViewChild('search', { static: false }) search: SearchInputComponent;
  @ViewChild('agGrid', { static: false }) agGrid: AgGridNg2;

  private gridApi;
  private gridColumnApi;
  gridOptions: GridOptions;
  private filterValue: string;
  columnDefs: any;
  context: any;
  fields: string[];
  displayedData: any[];
  questionsData: any[];
  selectedRow: any;
  selectedRowIndex: number;
  frameworkComponents: any;

  overlayNoRowsTemplate: string;

  private destroySubject$: Subject<void> = new Subject();
  public filterFormControl: FormControl = new FormControl();

  public loading;

  constructor(public dialog: MatDialog, private questionService: QuestionService, tooltipService: TooltipService,
              private store$: Store<RootStoreState.State>) {

    this.context = {componentParent: this};
    this.frameworkComponents = {
      titleCellRenderer: TitleCellRendererComponent,
      typeCellRenderer: TypeCellRendererComponent,
      belongCellRenderer: BelongsCellRendererComponent,
      graphTypeRenderer: GraphTypeCellRendererComponent
    };
    this.gridOptions = {
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        comparator: gridComparator
      },
      onRowClicked: this.selectRow.bind(this),
      onRowDoubleClicked: this.editQuestion.bind(this),
      onModelUpdated: () => {
        if (this.questionsData) {
          this.setSelectedRow();
          this.gridOptions.suppressScrollOnNewData = true;
        }
      }
    };

    this.overlayNoRowsTemplate = '<span style="padding: 13px; border: 1px solid lightgrey">Loading...</span>';

    this.fields = ['id', 'title', 'question_code', 'item_numbers', 'type', 'quest_type', 'question_graph_type'];
  }

  ngOnInit() {
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(QuestionStoreSelectors.selectFilterValue)
    ).subscribe((filterValue: string) => {
      if (!this.filterValue && filterValue) {
        this.filterFormControl.setValue(filterValue);
        this.filterValue = filterValue;
      }
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(QuestionStoreSelectors.selectSelectedQuestion)
    ).subscribe((selectedQuestion: Question) => {
      this.selectedRow = selectedQuestion;
    });

    combineLatest(
      this.store$.select(state => state.question.questions),
      this.store$.select(state => state.question.scrollToIndex)
    )
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(([questions, scrollToIndex]) => {
        // use ether cached questions from store in grid or get new list
        if (!questions) {
          this.refresh();
        } else {
          this.setQuestionsToGrid(JSON.parse(JSON.stringify(questions)));
          // Scroll to cached question index in case of delete ets.
          if (scrollToIndex !== -1) {
            setTimeout(() => {
              this.agGrid.api.ensureIndexVisible(scrollToIndex);
            });
          }
        }
      });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(QuestionStoreSelectors.selectQuestionsError)
    ).subscribe((error) => {
      if (error) {
        this.openWarningDialog('Error', error);
      }
    });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.setupQuestionGridColumns();
  }

  /**
   * Select row in questions grid
   */
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

  setupQuestionGridColumns() {
    this.columnDefs = [];
    this.columnDefs.push({
      headerName: 'Title',
      field: 'title',
      width: 720,
      suppressMenu: false,
      cellRenderer: 'titleCellRenderer',
      cellClassRules: {'overflow-unset': () => true}
    });
    this.columnDefs.push({
      headerName: 'Num. Answers',
      field: 'item_numbers',
      width: 150
    });
    this.columnDefs.push({
      headerName: 'Type',
      field: 'type',
      width: 230,
      cellRenderer: 'typeCellRenderer'
    });
    this.columnDefs.push({
      headerName: 'Belongs To',
      field: 'quest_type',
      width: 170,
      cellRenderer: 'belongCellRenderer'
    });
    this.columnDefs.push({
      headerName: 'Graph Type',
      field: 'question_graph_type',
      width: 170,
      cellRenderer: 'graphTypeRenderer'
    });

    this.gridOptions.api.setColumnDefs(this.columnDefs);
  }

  private applyFilter(filterValue: string) {
    if (filterValue) {
      this.displayedData = this.questionsData.filter(questions => this.filterPredicate(questions, filterValue));
    } else {
      this.displayedData = this.questionsData.slice();
    }
  }

  /**
   * Filter callback that filters a key row by title field
   * @param {Keys} questionsData
   * @param {string} filterValue
   * @returns {boolean}
   */
  private filterPredicate(questionsData: any, filterValue: string): boolean {
    const dataStr = (questionsData.title).toLowerCase().replace(/<[^>]*>/g, '');
    const transformedFilter = filterValue.trim().toLowerCase();
    return dataStr.indexOf(transformedFilter) !== -1;
  }

  filter(value: string) {
    this.filterValue = value;
    this.applyFilter(value);
    this.store$.dispatch(new QuestionStoreActions.SetFilterValueAction(value));
  }

  getSelectedRows() {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    return selectedNodes.map(node => node.data);
  }

  selectRow(row) {
    this.selectedRow = row.data;
    this.selectedRowIndex = row.rowIndex;
    this.store$.dispatch(new QuestionStoreActions.SetSelectedQuestionAction(this.selectedRow));
  }

  refresh(scrollIndex: number = -1) {
    this.displayedData = undefined;
    return this.store$.dispatch(new QuestionStoreActions.LoadRequestAction(scrollIndex));
  }

  setQuestionsToGrid(questionsDataTo: Question[]) {
    /**Move deleted questions into the and of list. */
    questionsDataTo.sort((a, b) => (+a.deleted - +b.deleted));
    this.questionsData = questionsDataTo;
    this.displayedData = questionsDataTo;
    this.applyFilter(this.filterValue);
  }

  addQuestion() {
    const dialogRef = this.openDialog('Create new Question', 'add');
    dialogRef.afterClosed().subscribe((question: Question) => {
      if (question) {
        this.loading = true;
        this.questionService.create(question).subscribe(() => {
          this.refresh(this.questionsData.length - 1);
          this.loading = false;
        });
      }
    });
  }

  editQuestion(question: any) {
    const dialogRef = this.openDialog('Edit Question', 'edit', question.data);
    dialogRef.afterClosed().subscribe((editedQuestion: Question) => {
      if (editedQuestion) {
        this.loading = true;
        this.questionService.edit(editedQuestion).subscribe(() => {
          this.refresh(question.rowIndex);
          this.loading = false;
        });
      }
    });
  }

  clone() {
    const question = this.selectedRow;
    const dialogRef = this.openDialog('Clone Question', 'clone', question);
    dialogRef.afterClosed().pipe(takeUntil(this.destroySubject$)).subscribe((data: Question) => {
      if (data) {
        this.loading = true;
        data.id = undefined;
        this.questionService.create(data).subscribe(() => {
          this.refresh();
          this.loading = false;
        });
      }
    });
  }

  removeQuestion() {
    const questToDeleteId = this.selectedRow.id;
    const text = 'Are you sure you want to delete selected question?';
    const confirmationDialogRef = this.openDeleteConfirmationDialog(text);
    confirmationDialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.loading = true;
        this.questionService.delete(this.selectedRow.id).subscribe(() => {
          this.gridOptions.api.setFocusedCell(questToDeleteId, 'start');
          this.refresh(this.selectedRowIndex);
          this.loading = false;
        });
      }
    });
  }

/**
 * Delete question from DB permanently.
 * @param id (number: Question id)
 */
  deletePermanently(id: number) {
    const text = 'Are you sure you want to delete the selected question permanently?';
    const confirmationDialogRef = this.openDeleteConfirmationDialog(text);
    confirmationDialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.loading = true;
        this.questionService.deletePermanently(id).subscribe(() => {
          const questToDeleteId = this.selectedRow.id;
          this.gridOptions.api.setFocusedCell(questToDeleteId, 'start');
          this.refresh(this.selectedRowIndex);
          this.loading = false;
        });
      }
    });
  }

/**
 * Sets question's 'deleted' value to 0.
 * @param id (number: Question id)
 */
  restoreQuestion(id: number) {
    this.loading = true;
    this.questionService.restore(id).subscribe(() => {
      const questToDeleteId = this.selectedRow.id;
      this.gridOptions.api.setFocusedCell(questToDeleteId, 'start');
      this.refresh(this.selectedRowIndex);
      this.loading = false;
    });
  }

  private openDialog(header: string, type: string, question?: Question): MatDialogRef<any> {
    return this.dialog.open(QuestionModalComponent, <any> {
      disableClose: true,
      width: '1000px',
      data: {
        modalType: type,
        header: header,
        question: question
      }
    });
  }

  private openDeleteConfirmationDialog(text: string): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '400px',
      data: {
        text: text
      }
    });
  }

  private openWarningDialog(title: string, text: string): MatDialogRef<any> {
    return this.dialog.open(WarningDialogComponent, <any>{
      width: '350px',
      data: {
        title: title,
        text: text
      }
    });
  }
}
