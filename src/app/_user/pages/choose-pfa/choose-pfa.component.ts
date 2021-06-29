import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { Store} from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

import {
  Validators,
  AbstractControl,
  FormBuilder,
  FormGroup
} from '@angular/forms';

import {
  RootStoreState,
  AttemptStoreActions
} from '@app/root-store';

import { Keys, Questionnaire } from '@app/models';
import { UserRoutesEnum } from '@app/_user/enums';
import { QuestionnaireType } from '@app/enums';

@Component({
  selector: 'app-choose-pfa',
  templateUrl: './choose-pfa.component.html',
  styleUrls: ['./choose-pfa.component.scss']
})
export class ChoosePFAComponent implements OnInit, OnDestroy {

  form: FormGroup;
  title: string = '';
  pfaName: string = '';
  questionnaires: Questionnaire[] = [];
  keyId: number = NaN;
  errorMsg: string = '';
  private destroySubject$: Subject<void> = new Subject();

  constructor(
    private titleService: Title,
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    /**Workaround to fix dropdown shifting */
    document.body.style.overflow = 'hidden';

    combineLatest(
      this.store$.select(state => state.route.childRoute),
      this.store$.select(state => state.attempt.key)
    ).pipe(
      takeUntil(this.destroySubject$))
      .subscribe(([route, key]) => {
        if (route && key) {
          this.keyId = key.id;
          this.setTitleAndName(route);
          this.fillQuestionnaires(route, key);

          const title = `${key.title}`;
          this.titleService.setTitle( title );
        }
      });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
    document.body.style.overflow = 'auto';
  }

  getControl(name: string): AbstractControl {
    return this.form.controls[name];
  }

  private initForm() {
    const firstQId = this.questionnaires.length ? this.questionnaires[0].id : '';
    this.form = this.formBuilder.group({
      'questionnaires': [firstQId, [Validators.required]]
    });
  }

  private setTitleAndName(route: string) {
    switch (route) {
      case UserRoutesEnum.PROFILES:
        this.title = 'Negotiation Profiles';
        this.pfaName = 'Profile';
      break;
      case UserRoutesEnum.ASSESSMENTS:
        this.title = 'Negotiation Assessment';
        this.pfaName = 'Assessment';
      break;
      case UserRoutesEnum.FEEDBACK:
        this.title = 'Negotiation Feedback';
        this.pfaName = 'Feedback';
      break;
    }
  }

  /**
   * Method parse 'company-questionnaire-maps' array retrived with Key
   * and fills Questionnaires array with all key's activated questionnaires,
   * wich have needed type (depends on route: profiles/assessments/feedback)
   * @param route (profiles/assessments/feedback)
   * @param key (Selected Key)
   */
  private fillQuestionnaires(route: string, key: Keys) {
    if (!key['company-questionnaire-maps']) {
      return;
    }
    let qType = QuestionnaireType.PROFILE;
    switch (route) {
      case UserRoutesEnum.PROFILES:
        qType = QuestionnaireType.PROFILE;
      break;
      case UserRoutesEnum.ASSESSMENTS:
        qType = QuestionnaireType.ASSESSMENT;
      break;
      case UserRoutesEnum.FEEDBACK:
        qType = QuestionnaireType.FEEDBACK;
      break;
    }
    key['company-questionnaire-maps'].forEach(elem => {
      if (elem.questionnaire && elem.questionnaire.type === qType) {
        this.questionnaires.push(elem.questionnaire);
      }
    });

    if (this.questionnaires.length === 0) {
      this.errorMsg = `${this.pfaName} have not yet been activated for your company key.
          Please notify your Negotiation Expert contact to have your profile setup completed`;
    } else if (this.questionnaires.length === 1) {
      this.continue(this.questionnaires[0].id);
    } else {
      this.initForm();
    }
  }

  continue(questId?: number) {
    const qId = questId ? questId : this.form.get('questionnaires').value;
    const queryParams = {kId: this.keyId, qId: qId};
      this.store$.dispatch(new AttemptStoreActions.NavigateAction(
        {path: UserRoutesEnum.ENTER_EMAIL, queryParams: queryParams}));
  }
}
