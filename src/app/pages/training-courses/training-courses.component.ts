import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { GridOptions, RowDragEndEvent } from 'ag-grid-community';
import { AgGridNg2 } from 'ag-grid-angular';
import { MatDialog, MatDialogRef } from '@angular/material';

import { SearchInputComponent, ConfirmationDialogComponent, InformationDialogComponent } from '@app/components';
import { TrainingCourseService } from '@app/services';
import { TrainingCourseModalComponent } from './training-courses-modal/training-course-modal.component';
import { TrainingCourse } from '@app/models';
import { ModalType } from '@app/enums';
import { gridComparator } from '@app/utils';
import { distinctUntilChanged, takeUntil } from 'rxjs/internal/operators';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { FormControl } from '@angular/forms';

import {
  TrainingCourseStoreActions,
  RootStoreState,
  TrainingCourseStoreSelectors
} from '@app/root-store';

@Component({
  selector: 'app-training-courses',
  templateUrl: './training-courses.component.html',
  styleUrls: ['./training-courses.component.scss']
})
export class TrainingCoursesComponent implements OnInit, OnDestroy {
  @ViewChild('search', { static: false }) search: SearchInputComponent;
  @ViewChild('agGrid', { static: false }) agGrid: AgGridNg2;

  private gridApi;
  private gridColumnApi;
  public loading = false;
  public columnDefs;
  private filterValue: string;
  private trainingCourseData: any[];
  public selectedRow: any;
  public displayedData: any[];

  filterFormControl: FormControl = new FormControl();
  private destroySubject$: Subject<void> = new Subject();

  constructor(public dialog: MatDialog,
              private trainingService: TrainingCourseService,
              private store$: Store<RootStoreState.State>) {
    this.columnDefs = [
      {headerName: 'Course Name', rowDrag: true, field: 'name', width: 250},
      {headerName: 'Order', field: 'order_pos', width: 900},
    ];
  }

  gridOptions: GridOptions = {
    onRowClicked: this.selectRow.bind(this),
    onRowDoubleClicked: this.editTrainingCourse.bind(this),
    onModelUpdated: () => {
      this.setSelectedRow();
    },
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      comparator: gridComparator
    }
  };

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  ngOnInit() {
    this.getSharedData();
    this.getTrainingCourses();
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
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

  selectRow(row) {
    this.selectedRow = row.data;
    this.store$.dispatch(new TrainingCourseStoreActions.SetSelectedTrainingCourseAction(this.selectedRow));
  }

  getSharedData() {
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(TrainingCourseStoreSelectors.selectSelectedTrainingCourse)).subscribe((selectedTrainingCourse: TrainingCourse) => {
      this.selectedRow = selectedTrainingCourse;
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(TrainingCourseStoreSelectors.selectTrainingCourseFilterValue)).subscribe((filterValue: string) => {
      if (!this.filterValue && filterValue) {
        this.filterFormControl.setValue(filterValue);
        this.filterValue = filterValue;
        this.filter(filterValue);
      }
    });
  }

  /**
   * Method to handle changes on grid after dragging and updating grid
   * @param {RowDragEndEvent} event
   */
  onRowDragEnd(event: RowDragEndEvent) {
    const targetItem = event.node.data;
    const overIndex = event.overIndex;

    const newDisplayedData = [];
    this.gridApi.forEachNode((rowNode) => newDisplayedData.push(rowNode.data));
    if (this.filterFormControl.value) {
      const startMove = targetItem.order_pos;
      const endMove = this.displayedData[overIndex].order_pos;
      this.trainingCourseData.splice(targetItem.order_pos - 1, 1);
      this.trainingCourseData.splice(endMove - 1, 0, targetItem);
      if (startMove < endMove) {
        for (let i = startMove - 1; i < endMove; i++) {
          this.trainingCourseData[i].order_pos = this.trainingCourseData[i].order_pos - 1;
        }
      } else {
        for (let i = endMove; i < startMove; i++) {
          this.trainingCourseData[i].order_pos = this.trainingCourseData[i].order_pos + 1;
        }
      }
      this.trainingCourseData[endMove - 1].order_pos = endMove;
    } else {
      newDisplayedData.forEach((item, index) => item.order_pos = index + 1);
    }

    this.trainingService.update(this.trainingCourseData).subscribe(() => {
      this.refresh();
    });
  }

  getTrainingCourses() {
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(TrainingCourseStoreSelectors.selectAll))
      .subscribe((result: TrainingCourse[]) => {
        this.displayedData = result;
        this.trainingCourseData = this.displayedData;
        this.displayedData.sort((a, b) => parseFloat(a.order_pos) - parseFloat(b.order_pos));
        if (this.filterValue) this.applyFilter(this.filterValue);
      });
  }

  refresh() {
    this.selectedRow = undefined;
    this.store$.dispatch(new TrainingCourseStoreActions.LoadRequestAction());
  }

  getMaxOrder(): number {
    const orders = this.displayedData.map(trainingCourse => {
      return trainingCourse.order_pos;
    });
    return Math.max(...orders);
  }

  addTrainingCourse() {
    const dialogRef = this.openDialog('Create new Training Course', ModalType.ADD);
    dialogRef.afterClosed().subscribe((newName) => {
      if (newName) {
        const trainingCourseFields = {name: newName.course_name, order_pos: this.getMaxOrder() + 1};
        this.trainingService.createNewTrainingCourse(trainingCourseFields).subscribe(() => {
          this.refresh();
          this.openInformationDialog('Training course saved');
        });
      }
    });
  }

  editTrainingCourse(row: any) {
    const dialogRef = this.openDialog('Edit Training course', ModalType.EDIT, row.data);
    dialogRef.afterClosed().subscribe((newName) => {
      if (newName) {
        this.trainingService.updateName({name: newName.course_name, id: row.data.id})
          .subscribe(() => {
            this.refresh();
            this.openInformationDialog('Training course updated');
          });
      }
    });
  }

  cloneTrainingCourse() {
    const dialogRef = this.openDialog('Clone Training Course', ModalType.CLONE, Object.assign({}, this.selectedRow));
    dialogRef.afterClosed().subscribe((newName) => {
      if (newName) {
        const trainingCourseFields = {name: newName.course_name, order_pos: this.getMaxOrder() + 1};
        this.trainingService.createNewTrainingCourse(trainingCourseFields).subscribe(result => {
          this.refresh();
          this.openInformationDialog('Training course cloned');
        });
      }
    });
  }

  removeTrainingCourse(row) {
    const dialogRef = this.openDeleteConfirmationDialog();
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.trainingService.removeTrainingCourse(row.id, row.order_pos).subscribe(() => {
          this.refresh();
          this.selectedRow = undefined;
          this.openInformationDialog('Training course deleted');
        });
      }
    });
  }

  private applyFilter(filterValue: string) {
    this.displayedData = this.trainingCourseData.filter(keys => this.filterPredicate(keys, filterValue));
  }

  private filterPredicate(keyData: any, filterValue: string): boolean {
    const accumulator = (currentTerm, key) => currentTerm + keyData.name;
    const dataStr = Object.keys(keyData).reduce(accumulator, '').toLowerCase();
    const transformedFilter = filterValue.trim().toLowerCase();
    return dataStr.indexOf(transformedFilter) !== -1;
  }

  filter(value: string) {
    this.applyFilter(value);
    this.filterValue = value;
    this.store$.dispatch(new TrainingCourseStoreActions.SetFilterValueAction(value));
  }

  private openDeleteConfirmationDialog(): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '400px',
      data: {
        text: 'Are you sure you want to delete selected course?'
      }
    });
  }

  private openDialog(header: string, type: ModalType, trainingCourse?: TrainingCourse): MatDialogRef<any> {
    return this.dialog.open(TrainingCourseModalComponent, <any> {
      width: '600px',
      data: {
        header: header,
        trainingCourse: trainingCourse,
        type: type,
      }
    });
  }

  private openInformationDialog(text: string): MatDialogRef<any> {
    return this.dialog.open(InformationDialogComponent, <any>{
      data: {
        title: 'Information',
        text: text
      }
    });
  }
}
