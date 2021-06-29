import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { map, delay, take, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MatTabGroup } from '@angular/material';
import {
  Validators,
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormControl,
  ValidationErrors } from '@angular/forms';

import {
  RootStoreState,
  RouteStoreActions,
  QuestionnaireStoreSelectors,
  QuestionnaireStoreActions,
  IncompleteAttemptStoreActions,
  IncompleteAttemptStoreSelectors
} from '@app/root-store';

import { QuestionnaireType, RoutesEnum, QuestionnaireTabs, RolesEnum } from '@app/enums';
import { Questionnaire, QuestionGroup, SendEmailTemplate } from '@app/models';
import {
  InformationDialogComponent,
  ConfirmationDialogComponent,
  SearchInputComponent } from '@app/components';
import { QuestionsTabComponent } from './questions-tab/questions-tab.component';
import { InvitationEmailsComponent } from './invitation-emails/invitation-emails.component';
import { QuestionnairesService, DataService } from '@app/services';

@Component({
  selector: 'app-questionnaire-item-page',
  templateUrl: './questionnaire-item-page.component.html',
  styleUrls: ['./questionnaire-item-page.component.scss']
})
export class QuestionnaireItemPageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tabGroup', { static: false }) tabGroup: MatTabGroup;
  @ViewChild('questionsTab', { static: false }) questionsTab: QuestionsTabComponent;
  @ViewChild('invEmails', { static: false }) invEmails: InvitationEmailsComponent;
  @ViewChild('resEmails', { static: false }) resEmails: InvitationEmailsComponent;
  @ViewChild('search', { static: false }) search: SearchInputComponent;

  tabIndex$: Observable<number>;

  form: FormGroup;
  qName: string;
  addPath: string = '';
  templateInfo: string = '';
  qControl = new FormControl();
  selsectedQid: number;
  selectedQGroupsCount: number = NaN;
  selectedQItemsCount: number = NaN;
  loading: boolean = false;

  tooltipAdd: string = '';
  tooltipDelete: string = '';
  tooltipEdit: string = '';
  isOverwrited: boolean = false;

  allQuestionnaires: Questionnaire[] = [];
  typedQuestionnaires: any[] = [];

  types = QuestionnaireType;
  tabs = QuestionnaireTabs;
  item = {} as Questionnaire;
  validating: boolean = false;
  filterFormControl: FormControl = new FormControl();

  incomleteIds: number[] = [];

  private destroySubject$: Subject<void> = new Subject();

  constructor(
    private store$: Store<RootStoreState.State>,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private questionnairesService: QuestionnairesService,
    private dataService: DataService) {

    this.tabIndex$ = this.store$.select(QuestionnaireStoreSelectors.selectSelectedTab);

    this.templateInfo = "{SPONSORNAME} Key's sponsor name; {MANAGERNAME} Manager Name; \
      {FIRSTNAME} Participant's First Name; {LASTNAME} Participant's Family Name; \
      {FULLNAME} Participant's first and family name; {PASSWORD} Participant's password; \
      {RESULTS} Participant's % score (in case of a completed Assessment); \
      {PENAME} Profile/Assessment's title; {PEDESCRIP} Profile/Assessment's description; \
      {PEURL} Profile/Assessment's url; {REG_FORM_LINK} Direct url to the FE registration form; \
      {EMAIL} Participant's email; {KEY} Company's Key; {ADMINNAME} Key's Admin Name; \
      {ADMINEMAIL} Key's Admin Email; {CAREER_CATEGORY} User's Career Category; \
      {JOBTITLE} User's Job Title; {COUNTRY} User's country; {CITY} User's city; \
      {COMPLETED_LIST} participants who completed Profile/Assessment; \
      {RES_LINK} link to view Assessment results online (Implemented only for Result Emails templates and for Assessments 'Confirmation Email')";
  }

  ngAfterViewInit() {
    this.tabGroup._handleClick = this.interceptTabChange.bind(this);
  }
  ngOnInit() {
    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(QuestionnaireStoreSelectors.selectAll))
      .subscribe((data: Questionnaire[]) => {
        this.allQuestionnaires = JSON.parse(JSON.stringify(data));
      });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(QuestionnaireStoreSelectors.selectSelectedGroupsIds)).subscribe((data: number[]) => {
        this.selectedQGroupsCount = data.length;
        this.setTooltips();
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(QuestionnaireStoreSelectors.selectSelectedItemsIds)).subscribe((data: number[]) => {
        this.selectedQItemsCount = data.length;
        this.setTooltips();
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(IncompleteAttemptStoreSelectors.selectIncompleteAttemptSelectedIds))
      .subscribe((data: number[]) => {
        this.incomleteIds = data;
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(QuestionnaireStoreSelectors.selectQuestionnaireById)
    ).subscribe((item: Questionnaire) => {
      if (item) {
        if (this.item.id && (this.item.id !== item.id)) {
          this.reset();
        }
        this.item = JSON.parse(JSON.stringify(item));
        this.initDataForMenu();
        this.initForm();
        switch (item.type) {
          case QuestionnaireType.PROFILE:
            this.addPath = RoutesEnum.PROFILES_ADD;
            this.qName = 'Profile';
            break;
          case QuestionnaireType.ASSESSMENT:
            this.addPath = RoutesEnum.ASSESSMENTS_ADD;
            this.qName = 'Assessment';
            break;
          case QuestionnaireType.FEEDBACK:
            this.addPath = RoutesEnum.FEEDBACK_ADD;
            this.qName = 'Feedback';
            break;
          default:
          this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.ADMIN, path: RoutesEnum.WELCOME, param: ''}));
        }

        this.loadIncompleteAttempts();
      }
    });

    this.qControl.valueChanges
    .pipe(takeUntil(this.destroySubject$))
    .subscribe(value => {
      this.selsectedQid = value;
    });

    this.store$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroySubject$),
      select(QuestionnaireStoreSelectors.selectSearchValue)
    ).subscribe((filterValue: string) => {
      if (filterValue) {
        this.filterFormControl.setValue(filterValue);
      }
    });
  }

  groupValueFn = (item) => {
    return {groupName: item};
  }

  ngOnDestroy() {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  private initForm() {
    this.form = this.formBuilder.group({
      'title': [this.item.title, [Validators.required], focus()],
      'abbreviation': [this.item.abbreviation, [], this.validateAcronymNotTaken.bind(this)],
      'description': [this.item.description],
      'welcome': [this.item.welcome],
      'conf_email_subject': [this.item.conf_email_subject],
      'conf_email_template': [this.item.conf_email_template	],
      'pubreg_email_subject': [this.item.pubreg_email_subject],
      'pubreg_email_template': [this.item.pubreg_email_template],
      'sponsor_email_subject': [this.item.sponsor_email_subject],
      'sponsor_email_template': [this.item.sponsor_email_template],
      'incomplete_timeout': [this.item.incomplete_timeout, [Validators.required, Validators.min(1)]]
    });
  }

  /**
   * Load Incomplete Attempts for PIA only
   */
  private loadIncompleteAttempts() {
    if (this.item.id === 124) {
      this.store$.dispatch(new IncompleteAttemptStoreActions.LoadRequestAction(this.item.id));
      this.store$.dispatch(new IncompleteAttemptStoreActions.SetQuestionnaireIdAction(this.item.id));
    }
  }

  /**
   * Intercepts and handles Tab Change event
   * @param tab
   * @param tabHeader
   * @param idx
   */
  private interceptTabChange(...args) {
    this.store$.pipe(
      take(1),
      select(QuestionnaireStoreSelectors.selectUnsavedTemplates)
    ).subscribe((templates: SendEmailTemplate[]) => {
      if (templates.length) {
        const text = 'You have the unsaved templates, would you like to save them?';
        const dialogRef = this.openConfirmationDialog(text);
        dialogRef.afterClosed()
          .subscribe((data: any) => {
            if (data) {
              this.questionnairesService.updateTemplates(templates)
              .subscribe((msg) => {
                this.store$.dispatch(new QuestionnaireStoreActions.SetHasUnsavedTemplateAction(false));
                this.store$.dispatch(new QuestionnaireStoreActions.ClearUnsavedTemplatesAction());
                this.store$.dispatch(new QuestionnaireStoreActions.SetSelectedTabAction(args[2]));
                return MatTabGroup.prototype._handleClick.apply(this.tabGroup, args);
              }, err => {
                this.store$.dispatch(new QuestionnaireStoreActions.SetHasUnsavedTemplateAction(false));
                this.store$.dispatch(new QuestionnaireStoreActions.ClearUnsavedTemplatesAction());
                this.store$.dispatch(new QuestionnaireStoreActions.SetSelectedTabAction(args[2]));
                return MatTabGroup.prototype._handleClick.apply(this.tabGroup, args);
              });
            } else {
              this.store$.dispatch(new QuestionnaireStoreActions.SetHasUnsavedTemplateAction(false));
              this.store$.dispatch(new QuestionnaireStoreActions.ClearUnsavedTemplatesAction());
              this.store$.dispatch(new QuestionnaireStoreActions.SetSelectedTabAction(args[2]));
              return MatTabGroup.prototype._handleClick.apply(this.tabGroup, args);
            }
          });
      } else {
        this.store$.dispatch(new QuestionnaireStoreActions.SetSelectedTabAction(args[2]));
        return MatTabGroup.prototype._handleClick.apply(this.tabGroup, args);
      }
    });
  }

   /**
   * Validates acronym is not taken.
   * And allows (in 'edit' case) to leave the same acronym.
   */
  private validateAcronymNotTaken(control: AbstractControl): Observable<ValidationErrors> {
    if (!this.form) {
      return new Observable(null);
    }

    this.validating = true;
    return this.questionnairesService.isAcronymValid(control.value)
      .pipe(
        delay(500),
        map(res => {
          this.validating = false;

          const sameAcronym = (
            this.item.abbreviation &&
            this.item.abbreviation.toLocaleLowerCase() === control.value.toLocaleLowerCase())
            ? true : false;
          let resp;
          if (this.item.abbreviation) {
            resp = (sameAcronym || res || !control.value) ? null :
                  {questionnaireAcronymTaken: true, value: control.value};
          } else {
            resp = (res || !control.value) ? null : {questionnaireAcronymTaken: true, value: control.value};
          }
          return resp;
        }));
  }

  /**
   * Creates array with questionnaires filtered by current Questionnaire type.
   * Sorts groups by order_pos and
   * Copies groups to children property for each filtered questionnaire
   * for MenuItemCompontent support.
   */
  private initDataForMenu() {
    const typedQ: any[] = this.allQuestionnaires.filter((q: Questionnaire) => q.type === this.item.type);
    typedQ.forEach(questionnaire => {
      questionnaire.q_groups = questionnaire.q_groups.filter((group: QuestionGroup) =>
        group.title !== 'UNASSIGNED');
      if (questionnaire.id === this.item.id) {
        questionnaire.selected = true;
        const unassignedGroup: QuestionGroup = {} as QuestionGroup;
        unassignedGroup.title = 'UNASSIGNED';
        unassignedGroup.order_pos = -1;
        unassignedGroup.id = -1;
        questionnaire.q_groups.push(unassignedGroup);
      }
      questionnaire.q_groups.sort((a, b) => a.order_pos - b.order_pos);
      questionnaire.children = questionnaire.q_groups;
    });
    this.typedQuestionnaires = typedQ;
  }

  getNameByType(type: number) {
    switch (type) {
      case QuestionnaireType.PROFILE:
        return 'Profiles';
      case QuestionnaireType.ASSESSMENT:
        return 'Assessments';
      case QuestionnaireType.FEEDBACK:
        return 'Feedback';
      default:
        return '';
    }
  }

  private getRouteByType(type: number) {
    switch (type) {
      case QuestionnaireType.PROFILE:
        return RoutesEnum.PROFILES;
      case QuestionnaireType.ASSESSMENT:
        return RoutesEnum.ASSESSMENTS;
      case QuestionnaireType.FEEDBACK:
        return RoutesEnum.FEEDBACK;
      default:
        return '';
    }
  }

  /**
   * Sets toltips values depending on group(s) or question(s) (in 'Questions' tab)
   * was/were selected.
   */
  private setTooltips() {
    if (this.selectedQGroupsCount) {
      this.tooltipAdd = 'Create new Group';
      this.tooltipDelete = 'Delete selected Groups';
      this.tooltipEdit = 'Edit selected Group';
    } else if (this.selectedQItemsCount) {
      this.tooltipAdd = 'Create new Question';
      this.tooltipDelete = 'Delete selected Questions';
      this.tooltipEdit = 'Edit selected Question';
    } else {
      this.tooltipAdd = 'Create new Group';
      this.tooltipDelete = 'Delete selected Groups/Questions';
      this.tooltipEdit = 'Edit selected Group/Question';
    }
  }

  getControl(name: string): AbstractControl {
    return this.form.controls[name];
  }

  private resetForm() {
    this.form.reset();
    this.refresh();
  }

  /**
   * Method needed to reset form data if new Questionnaire is chosen
   * in the same group (Profiles/Assessments/Feedback)
   * Invokes reset() methods for all child tabs (Methods reset only data that doesn't
   * stored in 'questionnaire-store'.)
   */
  reset() {
    if (this.questionsTab) this.questionsTab.reset();
    if (this.search) this.search.clearFilterValue();
    if (this.invEmails) this.invEmails.reset();
    if (this.resEmails) this.resEmails.reset();

    this.qControl.reset();
    this.store$.dispatch(new QuestionnaireStoreActions.SetSearchValueAction(''));
    this.isOverwrited = false;
    // Set default Questionnaire tab only if route wasn't switched between 'profiles'/'assessments'/'feedback'
    setTimeout(_ => {
      this.store$.dispatch(new QuestionnaireStoreActions.SetSelectedTabAction(QuestionnaireTabs.INVIT_EMAILS));
    }, 100);
  }

  /**
   * Navigates to Add questionnaire page
   */
  add() {
    this.store$.dispatch(new RouteStoreActions.Navigate(
      {role: RolesEnum.ADMIN, path: this.addPath, param: ''}));
  }

  /**
   * Saves all changes in 'Setup', 'Auto emails', 'Configuration' tabs
   * for currently opened Questionnaire.
   */
  save() {
    if (this.form.valid && (this.isOverwrited || !this.form.pristine)) {
      const quest = this.form.value;
      quest.id = this.item.id;
      quest.type = this.item.type;
      this.isOverwrited = false;
      this.questionnairesService.updateQuestionnaire(quest).subscribe(() => {
        this.openInformationDialog(`${this.qName} saved`, 'Information');
        this.resetForm();
      }, err => {
        this.openInformationDialog(err.error.message, 'Error');
      });
    }
  }
  /**
   * Clones currently opened Questionnaire
   */
  clone() {
    this.loading = true;
    this.questionnairesService.cloneQuestionnaire({id: this.item.id})
    .subscribe((newId: number) => {
      this.copyTemplates(newId);
    }, err => {
      this.loading = false;
      this.openInformationDialog(err.error.message, 'Error');
    });
  }

  private copyTemplates(newId: number) {
    this.questionnairesService.getTemplatesByQuestId(this.item.id)
    .subscribe((templates: SendEmailTemplate[]) => {
      let templatesIds = '';

      for (let i = 0; i < templates.length; i++) {
        templatesIds += templates[i].id + ',';
      }

      if (templatesIds.length === 0) {
        this.loading = false;
        this.resetForm();
        const route = this.getRouteByType(this.item.type);
        this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.ADMIN, path: route, param: newId.toString()}));
        return;
      }
      this.questionnairesService.copyTemplates({ids: templatesIds, quest_id: newId})
      .subscribe((resp: number) => {
        this.loading = false;
        this.resetForm();
        const route = this.getRouteByType(this.item.type);
        this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.ADMIN, path: route, param: newId.toString()}));
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
   * Deletes currently opened Questionnaire
   */
  delete() {
    const text = 'Are you sure you want to permanently delete "' + this.item.title + '"?';
    const dialogRef = this.openConfirmationDialog(text);
    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroySubject$))
    .subscribe((data: any) => {
      if (data) {
        this.item.deleted = true;
        this.questionnairesService.updateQuestionnaire(this.item).subscribe(() => {
          this.resetForm();
          const route = this.getRouteByType(this.item.type);
          this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.ADMIN, path: route, param: ''}));
        }, err => {
          this.openInformationDialog(err.error.message, 'Error');
        });
      }
    });
  }

  /**
   * Fills all templates fields in 'Auto emails' tab
   * with data retrieved by selected template id 'qControl' control
   */
  onOverwrite() {
    if (!this.selsectedQid) return;

    const obj = this.allQuestionnaires.find((q) => (q.id === this.selsectedQid) );
    this.form.get('conf_email_subject').setValue(obj.conf_email_subject);
    this.form.get('conf_email_template').setValue(obj.conf_email_template);
    this.form.get('pubreg_email_subject').setValue(obj.pubreg_email_subject);
    this.form.get('pubreg_email_template').setValue(obj.pubreg_email_template);
    this.form.get('sponsor_email_subject').setValue(obj.sponsor_email_subject);
    this.form.get('sponsor_email_template').setValue(obj.sponsor_email_template);
    this.isOverwrited = true;
  }

  /**
   * Stores search value into the root store.
   * Calls child method to apply search filter.
   * @param $event ($event.target.value - entered by user search value)
   */
  onQuickFilterChanged($event: Event) {
    const value = (<HTMLInputElement>$event.target).value;
    this.store$.dispatch(new QuestionnaireStoreActions.SetSearchValueAction(value));
    this.questionsTab.filterBySearch(value);
  }

  /**
   * Calls child method to reset search filter.
   * Clears search field value, stores it into the root store.
   */
  onClear() {
    this.questionsTab.clearSearchFilter();
    this.store$.dispatch(new QuestionnaireStoreActions.SetSearchValueAction(''));
    this.questionsTab.filterBySearch('');
  }

  /**
   * Run LOAD actions in QuestionnaireStore
   * to update all Questionnaire's data from DB.
   */
  refresh() {
    if (this.questionsTab) { this.questionsTab.setLoading(true); }
    this.store$.dispatch(new QuestionnaireStoreActions.LoadRequestAction());
    this.store$.dispatch(new QuestionnaireStoreActions.LoadUnassignedRequestAction());
    this.store$.dispatch(new QuestionnaireStoreActions.LoadGroupsRequestAction(this.item.id));
  }

  /**
   * If group selected calls child method to create group,
   * if question selected calls child method to create question,
   */
  createG_Q() {
    if (this.selectedQItemsCount > 0) this.questionsTab.createQuestion();
    else this.questionsTab.createGroup();
  }

  /**
   * If groups selected calls child method to delete groups,
   * if questions selected calls child method to delete questions,
   */
  deleteG_Q() {
    if (this.selectedQGroupsCount > 0) this.questionsTab.deleteGroups();
    else if (this.selectedQItemsCount > 0) this.questionsTab.deleteQuestions();
  }

  /**
   * If group selected calls child method to edit group,
   * if question selected calls child method to edit question,
   */
  editG_Q() {
    if (this.selectedQGroupsCount === 1) this.questionsTab.editGroup();
    else if (this.selectedQItemsCount === 1) this.questionsTab.editQuestion();
  }

  /**
   * Calls child method to copy selected question.
   * @param item (group to which selected question should be copied)
   */
  copyToSelected(item: QuestionGroup) {
    this.questionsTab.copyQuestion(item);
  }

  /**
   * Calls child method to move selected question.
   * @param item (group to which selected question should be moved)
   */
  moveToSelected(item: QuestionGroup) {
    this.questionsTab.moveQuestion(item);
  }

  numericKeyDown($event) {
    if (!(/[0-9]/).test($event.key) && $event.keyCode !== 8) {
      $event.preventDefault();
    }
  }

  refreshIncomplete() {
    this.store$.dispatch(new IncompleteAttemptStoreActions.LoadRequestAction(this.item.id));
  }

  removeIncompleteAttempts() {
    if (this.incomleteIds.length === 0) {
      return;
    }

    const ids = this.incomleteIds;
    const text = 'Are you sure you want to delete ' + ids.length + ' Rows?';
    const dialogRef = this.openConfirmationDialog(text);
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroySubject$))
      .subscribe((data: any) => {
        if (data) {
          this.dataService.deleteIncompleteAttempts(ids).subscribe((response: string) => {
            this.refreshIncomplete();
            this.store$.dispatch(new IncompleteAttemptStoreActions.SetSelectedIdsAction([]));
          }, error => {
            this.openInformationDialog(error.message, 'Error');
          });
        }
      });
  }

  private openInformationDialog(text: string, title: string): MatDialogRef<any> {
    return this.dialog.open(InformationDialogComponent, <any>{
      width: '400px',
      data: {
        title: title,
        text: text
      }
    });
  }

  private openConfirmationDialog(text: string): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '450px',
      data: {
        text: text
      }
    });
  }

}
