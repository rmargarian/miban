import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { takeUntil} from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

import {
  RootStoreState,
  AttemptStoreActions
} from '@app/root-store';

import { DataService } from '@app/services';
import {
  User,
  Questionnaire,
  Keys
} from '@app/models';
import { UserRoutesEnum } from '@app/_user/enums';

@Component({
  selector: 'app-change-key-page',
  templateUrl: './change-key-page.component.html',
  styleUrls: ['./change-key-page.component.scss']
})
export class ChangeKeyPageComponent implements OnInit, OnDestroy {

  data: {key: Keys, user: User};
  key: Keys;
  questionnaireId: number;
  secretKey: string;

  private destroySubject$: Subject<void> = new Subject();

  constructor(
    private titleService: Title,
    private store$: Store<RootStoreState.State>,
    private dataService: DataService
  ) {
  }

  ngOnInit() {

    combineLatest(
      this.store$.select(state => state.attempt.key),
      this.store$.select(state => state.attempt.user),
      this.store$.select(state => state.attempt.userLoading),
      this.store$.select(state => state.attempt.secretKey),
      this.store$.select(state => state.attempt.questionnaireId)
    ).pipe(
      takeUntil(this.destroySubject$))
      .subscribe(([key, user, userLoading, secretKey, questionnaireId]) => {
        if (!userLoading && (key && user)) {
          this.key = key;
          this.titleService.setTitle( `Change key to ${this.key.title}` );
          this.secretKey = secretKey;
          this.questionnaireId = questionnaireId;
          this.data = {key: key, user: user};
        } else if (!userLoading && !user) {
          this.store$.dispatch(new AttemptStoreActions.SetErrorAction('[ERROR] Failed loading company'));
          this.store$.dispatch(new AttemptStoreActions.NavigateAction({path: UserRoutesEnum.ENTER_KEY}));
        }
      });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  onSave($event) {
    const user: User = $event.user;
    user.company_id = this.key.id;
    this.dataService.updateUser(user).subscribe(
      (us: User) => {
        if (us) {
          this.goToEnterKey();
        }
      }, (err) => {
        this.store$.dispatch(new AttemptStoreActions.SetErrorAction('[ERROR] Failed loading company'));
        this.store$.dispatch(new AttemptStoreActions.NavigateAction({path: UserRoutesEnum.ENTER_KEY}));
      }
    );
  }

  private goToEnterKey() {
    this.store$.dispatch(new AttemptStoreActions.SetErrorAction('Now you can log in new key'));
    this.store$.dispatch(new AttemptStoreActions.NavigateAction({path: UserRoutesEnum.ENTER_KEY}));
  }
}
