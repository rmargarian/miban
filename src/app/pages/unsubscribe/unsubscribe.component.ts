import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material';

import {
  RootStoreState,
  AttemptStoreSelectors
} from '@app/root-store';

import { DataService } from '@app/services';
import { InformationDialogComponent } from '@app/components';

@Component({
  selector: 'app-unsubscribe',
  templateUrl: './unsubscribe.component.html',
  styleUrls: ['./unsubscribe.component.scss']
})
export class UnsubscribeComponent implements OnInit, OnDestroy {

  private email: string = '';
  private destroySubject$: Subject<void> = new Subject();

  constructor(
    private store$: Store<RootStoreState.State>,
    private dialog: MatDialog,
    private dataService: DataService,
    private titleService: Title) {
      const title = `PFA negotiations Unsubscribe`;
      this.titleService.setTitle( title );
    }

  ngOnInit() {
    this.store$.pipe(
      take(1),
      select(AttemptStoreSelectors.selectUnsubEmail)
    ).subscribe((email: string) => {
      this.email = email;
    });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
  }

  unsubscribe() {
    if (!this.email) { return; }
      this.dataService.createUnsubscribe({email: this.email})
      .subscribe(
        (resp: {email}) => {
          const msg = `You were successfully unsubscribed.`;
          this.openInformationDialog(msg, 'Success');
        }, (err) => {
          this.openInformationDialog(err.message, 'Error');
        }
      );
  }

  private openInformationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(InformationDialogComponent, <any> {
      disableClose: true,
      width: '450px',
      data: {
        disableClose: true,
        title: title,
        text: text,
        noTimer: true
      }
    });
  }

}
