import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material';
import { AgGridNg2 } from 'ag-grid-angular';
import { GridOptions, ColDef } from 'ag-grid-community';
import { distinctUntilChanged, takeUntil } from 'rxjs/internal/operators';

import { AdminDialogComponent } from './admin-dialog/admin-dialog.component';
import { SearchInputComponent, ConfirmationDialogComponent, InformationDialogComponent } from '@app/components';
import { Admin, Currency, SharedModel } from '@app/models';
import { AdminService, AuthenticationService } from '@app/services';
import { fromIsoDate, dateComparator, gridComparator } from '@app/utils';

import {
  RootStoreState,
  AdminStoreActions,
  AdminStoreSelectors,
  SharedStoreSelectors
} from '@app/root-store';
import { SortColumn } from '@app/interfaces';
import { FormControl } from '@angular/forms';
import { SetFilterValueAction } from '@app/root-store/user-admin-store/actions';

@Component({
  selector: 'app-user-administration',
  templateUrl: './user-administration.component.html',
  styleUrls: ['./user-administration.component.scss']
})
export class UserAdministrationComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('search', { static: false }) search: SearchInputComponent;
  @ViewChild('agGrid', { static: false }) agGrid: AgGridNg2;
  columnDefs: ColDef[] = [];
  admins: Admin[];
  displayedData: Admin[];
  currencies: Currency[];
  selectedRow: Admin;
  private gridApi;
  private gridColumnApi;
  gridOptions: GridOptions;

  filterFormControl: FormControl = new FormControl();
  canDeleteAdmin: boolean = false;
  private destroySubject$: Subject<void> = new Subject();

  private filterValue: string;
  private userDetails: any;
  private sortColumn: SortColumn;

  constructor(private adminService: AdminService,
              public dialog: MatDialog,
              public authService: AuthenticationService,
              private store$: Store<RootStoreState.State>) {
    this.columnDefs = [
      { headerName: 'Full Name', field: 'name', width: 200 },
      { headerName: 'Username', field: 'username', width: 150 },
      { headerName: 'Email', field: 'email', width: 300 },
      {
        headerName: 'Last Access',
        field: 'last_access',
        width: 200,
        cellRenderer: (params) => {
          return this.dateFormatter(params.value);
        },
        comparator: dateComparator
      }
    ];

    this.gridOptions = {
      defaultColDef: {
        resizable: true,
        sortable: true,
        comparator: gridComparator
      },
      onRowClicked: this.selectRow.bind(this),
      onRowDoubleClicked: this.editAdmin.bind(this),
      onModelUpdated: () => {
        this.setSelectedRow();
      },
      onSortChanged: () => {
        this.store$.dispatch(new AdminStoreActions.SetSortColumnAction(<SortColumn>this.gridOptions.api.getSortModel()[0]));
      }
    };

    this.getAllAdmins();
  }

  ngOnInit() {
    this.getSharedData();
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  private dateFormatter(value: any) {
    if (!value) {
      return '';
    }
    return fromIsoDate(value);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    if (this.sortColumn) {
      this.gridOptions.api.setSortModel([this.sortColumn]);
    }
  }

  getSharedData() {
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(SharedStoreSelectors.selectAll)).subscribe((data: SharedModel) => {
      this.currencies = data.currencies;
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(AdminStoreSelectors.selectSelectedAdmin)).subscribe((selectedAdmin: Admin) => {
      this.selectedRow = selectedAdmin;
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(AdminStoreSelectors.selectAdminFilterValue)).subscribe((filterValue: string) => {
      if (!this.filterValue && filterValue) {
        this.filterFormControl.setValue(filterValue);
        this.filterValue = filterValue;
      }
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(AdminStoreSelectors.selectSortColumn)).subscribe((sortColumn: SortColumn) => {
        this.sortColumn = sortColumn;
    });
  }


  getAllAdmins() {
    this.adminService.getAll().subscribe((admins: Admin[]) => {
      this.admins = admins.slice();
      this.displayedData = this.admins;
      this.applyFilter(this.filterValue);
    });
  }

  ngAfterViewInit() {
    this.gridOptions.columnApi.getColumn('name').setSort('asc');
    this.gridOptions.api.sizeColumnsToFit();
  }

  filter(value: string) {
    this.applyFilter(value);
    this.filterValue = value;
    this.store$.dispatch(new SetFilterValueAction(value));
  }

  selectRow(row) {
    this.selectedRow = row.data;
    this.store$.dispatch(new AdminStoreActions.SetSelectedAdminAction(this.selectedRow));
    this.userDetails = this.authService.getUserDetails();
    this.canDeleteAdmin = this.userDetails.id !== this.selectedRow.id;
  }

  refresh() {
    this.selectedRow = undefined;
    this.search.clearFilterValue();
    this.getAllAdmins();
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

  addAdmin() {
    const dialogRef = this.openDialog(null, 'Add user', 'add');
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.adminService.register(data).subscribe((admin: Admin) => {
          this.refresh();
          this.openInformationDialog('User saved');
        });
      }
    });
  }

  editAdmin(adminRow) {
    this.selectedRow = adminRow;
    const dialogRef = this.openDialog(adminRow, 'Edit user', 'edit');
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        if (data.password === '') {
          delete data.password;
        }
        this.adminService.update(data).subscribe((adminUpdated: Admin) => {
          this.refresh();
          this.openInformationDialog('User saved');
        });
      }
    });
  }

  removeAdmin() {
    const confirmationDialogRef = this.openDeleteConfirmationDialog();
    confirmationDialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.adminService.delete(this.selectedRow.id).subscribe(() => {
          this.refresh();
          this.openInformationDialog('User deleted');
        });
      }
    });
  }

  private applyFilter(filterValue: string) {
    this.displayedData = this.admins.filter(admin => this.filterPredicate(admin, filterValue));
  }

  private filterPredicate(admin: Admin, filterValue: string): boolean {
    const accumulator = (currentTerm, key) => currentTerm + admin[key];
    const dataStr = Object.keys(admin).reduce(accumulator, '').toLowerCase();
    const transformedFilter = filterValue.trim().toLowerCase();
    return dataStr.indexOf(transformedFilter) !== -1;
  }

  private openDialog(admin: any, header: string, type: string): MatDialogRef<any> {
    if (!admin) {
      admin = {};
    }
    return this.dialog.open(AdminDialogComponent, <any>{
      width: '400px',
      data: {
        admin: admin.data,
        header: header,
        currencies: this.currencies,
        type: type
      }
    });
  }

  private openDeleteConfirmationDialog(): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '400px',
      data: {
        text: 'Are you sure you want to delete selected user?'
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
