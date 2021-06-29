import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import {
  Validators,
  AbstractControl,
  FormBuilder,
  FormGroup
} from '@angular/forms';

import {
  RootStoreState,
  AttemptStoreActions,
  AttemptStoreSelectors,
  RouteStoreSelectors
} from '@app/root-store';

import { AttemptService } from '@app/_user/services';
import { Keys } from '@app/models';
import { UserRoutesEnum } from '@app/_user/enums';

@Component({
  selector: 'app-enter-key',
  templateUrl: './enter-key.component.html',
  styleUrls: ['./enter-key.component.scss']
})
export class EnterKeyComponent implements OnInit, OnDestroy {

  form: FormGroup;
  title: string = '';
  errorMsg$: Observable<string>;
  showValidation: boolean = false;
  private destroySubject$: Subject<void> = new Subject();

  constructor(
    private titleService: Title,
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private attemptService: AttemptService) {

      this.titleService.setTitle( 'PFA Enter Key' );
    }

  ngOnInit() {

    this.form = this.formBuilder.group({
      'key_code': ['', [Validators.required]]
    });

    this.errorMsg$ = this.store$.select(AttemptStoreSelectors.selectError);

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(RouteStoreSelectors.selectChildRoute))
      .subscribe((route: string) => {
        this.setTitle(route);
    });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  getControl(name: string): AbstractControl {
    return this.form.controls[name];
  }

  private setTitle(route: string) {
    switch (route) {
      case UserRoutesEnum.PROFILES:
        this.title = 'Negotiation Profiles';
      break;
      case UserRoutesEnum.ASSESSMENTS:
        this.title = 'Negotiation Assessment';
      break;
      case UserRoutesEnum.FEEDBACK:
        this.title = 'Negotiation Feedback';
      break;
      default:
        this.title = 'Negotiation Profiles';
    }
  }

  onSave() {
    this.showValidation = true;
    if (this.form.invalid) { return; }

    const code = this.form.get('key_code').value;
    this.attemptService.getCompanyIdByCode(code).subscribe((key: Keys) => {
      if (!key) {
        const msg = `The '${code}' key you entered doesn't exist. Please copy-paste the key provided.
        If you have pasted the key provided, then please get in touch with your Negotiation Expert contact`;
        this.store$.dispatch(new AttemptStoreActions.SetErrorAction(msg));
        return;
      }
      this.store$.dispatch(new AttemptStoreActions.SetErrorAction(''));
      const queryParams = {kId: key.id};
      this.store$.dispatch(new AttemptStoreActions.NavigateAction(
        {path: UserRoutesEnum.CHOOSE_PFA, queryParams: queryParams}));
      });
  }

}
