import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { MatDialog, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { InformationDialogComponent, FileInputComponent } from '@app/components';
import { ResultDialogComponent } from './result-dialog/result-dialog.component';
import {
  RootStoreState,
  ImportStoreActions,
  ImportStoreSelectors,
  KeysStoreSelectors
} from '@app/root-store';
import { UserService } from '@app/services';
import { Keys, User } from '@app/models';
import { validateUsers } from '@app/utils';

import { emailRegex, nameRegex} from '@app/contants';

@Component({
  selector: 'app-import-participants',
  templateUrl: './import-participants.component.html',
  styleUrls: ['./import-participants.component.scss']
})
export class ImportParticipantsComponent implements OnInit, OnDestroy {
  @ViewChild('file', { static: false }) fileControl: FileInputComponent;
  form: FormGroup;
  keys: Keys[] = [];
  companyId: number;
  file: File;
  users: User[] = [];
  validUsers: User[] = [];
  invalidUsersCount: number = 0;
  gridUsers: User[] = [];
  repeatedEmails: string[] = [];
  showSecond: boolean = false;
  showThird: boolean = false;
  loading: boolean = false;
  updateCount: number = 0;
  createCount: number = 0;
  showValidation: boolean = false;
  fileErrorMessage: string = '';

  private destroySubject$: Subject<void> = new Subject();
  constructor(
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private userService: UserService) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      'file': ['', [Validators.required]],
      'key': [null, [Validators.required]]
    });
    this.getAllKeys();
    this.getImportStates();

    this.getControl('key').valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(value => {
        if (!value || value === this.companyId) { return; }
        this.store$.dispatch(new ImportStoreActions.SetCompanyIdAction(parseInt(value, 10)));
      });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  getControl(name: string): AbstractControl {
    return this.form.controls[name];
  }

  private getAllKeys() {
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(KeysStoreSelectors.selectKeysFullList)
    ).subscribe((data: Keys[]) => {
      if (data) {
        const keys = JSON.parse(JSON.stringify(data));
        keys.forEach(key => {
          key.value = key.title + ` (${key.company_key})`;
        });
        this.keys = keys;
      }
    });
  }

  /**
   * Subscribes on all import's states changed actions
   */
  private getImportStates() {
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(ImportStoreSelectors.selectCompanyId)
    ).subscribe((id: number) => {
        this.companyId = id;
        const value = id ? id : null;
        this.getControl('key').setValue(value);
    });
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(ImportStoreSelectors.selectFile)
    ).subscribe((file: File) => {
      this.file = file;
      if (file) {
        this.getControl('file').setValue(file.name);
      } else {
        this.getControl('file').setValue('');
        if (this.fileControl) { this.fileControl.resetInput(); }
      }
    });
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(ImportStoreSelectors.selectUsers)
    ).subscribe((users: User[]) => {
      if (users) {
        const gridUsers = [];
        users.forEach(user => {
          gridUsers.push(user);
        });
        const repeated: string[] = [];
        users.forEach((user: User, i: number) => {
          const obj = users.find((u: User, j: number) => j !== i && u.email === user.email);
          if (obj) {
            const added = repeated.find(email => email === user.email);
            if (!added) {
              repeated.push(user.email);
            }
          }
        });
        this.repeatedEmails = repeated;
        this.gridUsers = gridUsers;
        this.users = users;
        this.parseUsers();
      }
    });
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(ImportStoreSelectors.selectShowSecond)
    ).subscribe((show: boolean) => {
      this.showSecond = show;
      this.scrollDown();
    });
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(ImportStoreSelectors.selectShowThird)
    ).subscribe((show: boolean) => {
      this.showThird = show;
      this.scrollDown();
    });
  }

  /**
   * Finds valid (update and create count) users,
   * invalid users count and repeated emails count.
   */
  private parseUsers() {
    this.validUsers = validateUsers(this.users, this.companyId);
    this.createCount = 0;
    this.updateCount = 0;
    this.validUsers.forEach((user: User) => {
      if (user.id) {
        this.updateCount++;
      } else {
        this.createCount++;
      }
    });

    this.invalidUsersCount = 0;

    this.users.forEach((user: User) => {
      if (!user.first_name || !user.last_name || !user.email ||
        !emailRegex.test(user.email) || !nameRegex.test(user.last_name) || !nameRegex.test(user.first_name)
      ) {
        this.invalidUsersCount++;
      }
    });
  }
  private scrollDown() {
    const scroller = document.getElementById('import-wrapper');
    setTimeout(function() {
      scroller.scrollTo(0, scroller.scrollHeight);
    }, 10);
  }

  /**
   * Creates or updates users from uploaded file.
   */
  private saveUsers() {
    this.loading = true;
    this.userService.importUsers(this.companyId).subscribe(
      (resp) => {
        this.loading = false;
        const dialogRef = this.openResultsDialog();
        dialogRef.afterClosed()
          .pipe(takeUntil(this.destroySubject$))
          .subscribe((data: any) => {
            this.store$.dispatch(new ImportStoreActions.ResetAction());
          });
      }, (error) => {
        this.loading = false;
        this.store$.dispatch(new ImportStoreActions.ResetAction());
        this.openInformationDialog(error.message, 'Error'); }
    );
  }

  fileChosen(file: File) {
    if (!file) { return; }
    this.store$.dispatch(new ImportStoreActions.SetShowSecondAction(false));
    this.store$.dispatch(new ImportStoreActions.SetShowThirdAction(false));
    const regex = /.*\.(xlsx|xls)/g;
    if (regex.test(file.name.toLowerCase())) {
      this.store$.dispatch(new ImportStoreActions.SetFileAction(file));
      this.fileErrorMessage = '';
    } else {
      this.store$.dispatch(new ImportStoreActions.SetFileAction(undefined));
      this.fileErrorMessage = `File must be '.xls' or '.xlsx' spreadsheet format`;
    }
  }

  /**
   * Reads .xls or .xlsx file. Stores each row in array: User[]. Stores users array to root storage.
   */
  uploadFile() {
    this.showValidation = true;
    if (this.form.invalid) { return; }

    this.loading = true;
    this.store$.dispatch(new ImportStoreActions.SetShowThirdAction(false));
    const formData: FormData = new FormData();
    formData.append('uploadFile', this.file, this.file.name);

    this.userService.uploadFile(formData).subscribe(
      (users: User[]) => {
        this.loading = false;
        this.store$.dispatch(new ImportStoreActions.SetShowSecondAction(true));
        this.store$.dispatch(new ImportStoreActions.SetUsersAction(users));
      }, (error) => {
        if (error.status === 400) {
          this.loading = false;
          this.store$.dispatch(new ImportStoreActions.SetFileAction(undefined));
          this.openInformationDialog('The file was changed. Please select the file again.', 'Warning');
          return;
        } else if (error.status === 409) {
          this.loading = false;
          this.store$.dispatch(new ImportStoreActions.SetFileAction(undefined));
          this.openInformationDialog(error.statusText || error.message, 'Warning');
          return;
        }
        this.loading = false;
        this.store$.dispatch(new ImportStoreActions.ResetAction());
        this.openInformationDialog(error.message, 'Error');
      }
    );
  }

  nextSecond() {
    this.store$.dispatch(new ImportStoreActions.SetShowThirdAction(true));
    this.parseUsers();
  }

  backSecond() {
    this.store$.dispatch(new ImportStoreActions.SetShowSecondAction(false));
  }

  nextThird() {
    this.saveUsers();
  }

  backThird() {
    this.store$.dispatch(new ImportStoreActions.SetShowThirdAction(false));
  }

  private openResultsDialog(): MatDialogRef<any> {
    return this.dialog.open(ResultDialogComponent, <any>{
      width: '1200px',
      data: {
        title: 'Import Report',
        users: this.gridUsers,
        validUsers: this.validUsers
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
