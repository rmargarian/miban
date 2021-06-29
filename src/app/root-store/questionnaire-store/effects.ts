import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, concatMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { QuestionGroupService } from '@app/services/question-group.service';
import { QuestionService } from '@app/services/question.service';
import { QuestionnairesService } from '@app/services/questionnaires.service';
import { UserService } from '@app/services/user.service';
import * as RootStoreState from '@app/root-store/state';
import * as featureActions from './actions';
import { Questionnaire, QuestionGroup, Question } from '@app/models';
import { QuestionnaireType } from '@app/enums';

@Injectable()
export class QuestionnaireStoreEffects {
  @Effect()
  loadRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadRequestAction>(featureActions.ActionTypes.LOAD_REQUEST),
      concatMap(action =>
        this.questionnairesService.getAllQuestionnaires()
          .pipe(
            map(items => new featureActions.LoadSuccessAction(this.sortQuestionnairesByType(items))),
            catchError(error => observableOf(new featureActions.LoadFailureAction({ error })))
          )
      )
    );

  @Effect()
  saveTemplatesEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.SaveUnsavedTemplatesAction>(featureActions.ActionTypes.SAVE_UNSAVED_TEMPLATES),
      map((action: featureActions.SaveUnsavedTemplatesAction) => action.payload),
      concatMap((payload) =>
        this.questionnairesService.updateTemplates(payload)
          .pipe(
            map(data => new featureActions.SaveUnsavedTemplatesSuccessAction()),
            catchError(error => observableOf(new featureActions.SaveUnsavedTemplatesFailureAction(error)))
          )
      )
    );

  @Effect()
  loadGroupRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadGroupsRequestAction>(featureActions.ActionTypes.LOAD_GROUPS_REQUEST),
      withLatestFrom(this.store$),
      map(([action, storeState]: [featureActions.LoadGroupsRequestAction, RootStoreState.State]) =>
        ({ id: action.payload, state: storeState })),
      concatMap((payload) =>
        this.questionGroupService.getByQuestionnaireId(payload.id)
          .pipe(
            map(items => new featureActions.LoadGroupsSuccessAction(this.storeAllGroups(items, payload.state))),
            catchError(error => observableOf(new featureActions.LoadGroupsFailureAction({ error })))
          )
      )
    );

  @Effect()
  sortGroupRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.SortGroupsRequestAction>(featureActions.ActionTypes.SORT_GROUPS_REQUEST),
      withLatestFrom(this.store$),
      map(([action, storeState]: [featureActions.SortGroupsRequestAction, RootStoreState.State]) =>
        ({ state: storeState })),
      map((payload) => new featureActions.SortGroupsSuccessAction(this.storeSortedGroups(payload.state)))
    );

  @Effect()
  loadUnassignedRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadUnassignedRequestAction>(featureActions.ActionTypes.LOAD_UNASSIGNED_REQUEST),
      withLatestFrom(this.store$),
      map(([action, storeState]: [featureActions.LoadUnassignedRequestAction, RootStoreState.State]) =>
        ({ action, state: storeState })),
      concatMap((payload) =>
        this.questionService.getAll(null, true)
          .pipe(
            map(items => new featureActions.LoadUnassignedSuccessAction(this.storeAllQuestions(items, payload.state))),
            catchError(error => observableOf(new featureActions.LoadUnassignedFailureAction({ error })))
          )
      )
    );

  @Effect()
  selectUnassignedRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.SelectUnassignedRequestAction>(featureActions.ActionTypes.SELECT_UNASSIGNED_REQUEST),
      withLatestFrom(this.store$),
      map(([action, storeState]: [featureActions.SelectUnassignedRequestAction, RootStoreState.State]) =>
        ({ state: storeState })),
      map((payload) => new featureActions.SelectUnassignedSuccessAction(this.storeQuestionsWithSelections(payload.state)))
    );

  @Effect()
  loadUsersEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadUsersRequestAction>(featureActions.ActionTypes.LOAD_USERS_REQUEST),
      map((action: featureActions.LoadUsersRequestAction) => action.payload),
      concatMap((payload) =>
        this.userService.getAllUsersByCompany(payload, true)
          .pipe(
            map(items => new featureActions.LoadUsersSuccessAction(items)),
            catchError(error => observableOf(new featureActions.LoadUsersFailureAction({ error })))
          )
      )
    );

  @Effect()
  loadResUsersEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadResUsersRequestAction>(featureActions.ActionTypes.LOAD_RES_USERS_REQUEST),
      map((action: featureActions.LoadResUsersRequestAction) => action.payload),
      concatMap((payload) =>
        this.userService.getAllUsersByCompany(payload, true)
          .pipe(
            map(items => new featureActions.LoadResUsersSuccessAction(items)),
            catchError(error => observableOf(new featureActions.LoadResUsersFailureAction({ error })))
          )
      )
    );

  /**
   * Sorts Questionnaires by 'type' field and
   * Filters by not deleted
   * @param data (Questionnaires array)
   */
  private sortQuestionnairesByType(data: Questionnaire[]): Questionnaire[] {
    if (!data || !data.length) return [];

    const questionnaires_profiles = [];
    const questionnaires_assessment = [];
    const questionnaires_feedback = [];
    data.forEach((questionnaire) => {
      switch (questionnaire.type) {
        case QuestionnaireType.ASSESSMENT:
          if (!questionnaire.deleted) {
            questionnaire.typeStr = 'Assessments';
            questionnaires_assessment.unshift(questionnaire);
          }
          break;
        case QuestionnaireType.PROFILE:
          if (!questionnaire.deleted) {
            questionnaire.typeStr = 'Profiles';
            questionnaires_profiles.unshift(questionnaire);
          }
          break;
        case QuestionnaireType.FEEDBACK:
          if (!questionnaire.deleted) {
            questionnaire.typeStr = 'Feedback';
            questionnaires_feedback.unshift(questionnaire);
          }
          break;
      }
    });
    return [...questionnaires_profiles, ...questionnaires_assessment, ...questionnaires_feedback];
  }

  private storeAllGroups(origin_groups: QuestionGroup[], state: RootStoreState.State) {
    let groups = JSON.parse(JSON.stringify(origin_groups));
    groups = this.sortGroups(groups, state);

    return { origin_groups: origin_groups, sorted_groups: groups };
  }

  private storeSortedGroups(state: RootStoreState.State): QuestionGroup[] {
    const origin_groups = state.questionnaire.questions_groups;
    let groups = JSON.parse(JSON.stringify(origin_groups));
    groups = this.sortGroups(groups, state);

    return groups;
  }
  /**
   * Returns groups sorted by 'order_pos', including groups' questions sorted by 'question_order'
   * And applies opened/selected states for groups and questions.
   * @param groups (copy of Questions groups retreived from server)
   * @param state (all store's states)
   */
  private sortGroups(groups: QuestionGroup[], state: RootStoreState.State): QuestionGroup[] {
    /**Sort groups */
    groups.sort((a, b) => {
      return a.order_pos - b.order_pos;
    });
    const selected_items = state.questionnaire.selected_items_ids;
    const opened_groups = state.questionnaire.opened_groups_ids;
    const selected_groups = state.questionnaire.selected_groups_ids;

    /**Sort questions */
    groups.forEach(group => {
      group.group_questions_map = group.group_questions_map.filter(map => !map.question.deleted);
      group.group_questions_map.sort((a, b) => {
        return a.question_order - b.question_order;
      });
      /**Set all opened/selected states */
      if (opened_groups.includes(group.id)) {
        group.opened = true;
      }
      if (selected_groups.includes(group.id)) {
        group.selected = true;
      }
      group.group_questions_map.forEach(element => {
        if (selected_items.includes(element.question.id)) {
          element.selected = true;
        }
      });
    });
    return groups;
  }

  private storeAllQuestions(origin_questions: Question[], state: RootStoreState.State) {
    origin_questions = origin_questions.filter((question: Question) => !question.deleted);
    let questions: Question[] = JSON.parse(JSON.stringify(origin_questions));
    questions = this.setQuestionsSelections(questions, state);

    return { origin_questions: origin_questions, questions_with_selections: questions };
  }

  private storeQuestionsWithSelections(state: RootStoreState.State): Question[] {
    const origin_questions: Question[] = state.questionnaire.unassignedQuestions;
    let questions: Question[] = JSON.parse(JSON.stringify(origin_questions));
    questions = this.setQuestionsSelections(questions, state);

    return questions;
  }
  /**
   * Returns questions with applied selected states.
   * @param questions (copy of Questions retreived from server)
   * @param state (all store's states)
   */
  private setQuestionsSelections(questions: Question[], state: RootStoreState.State): Question[] {
    const selected_items = state.questionnaire.selected_items_ids;

    /**Set selected states */
    questions.forEach(question => {
      if (selected_items.includes(question.id)) {
        question.selected = true;
      }
    });
    return questions;
  }

  constructor(
    private actions$: Actions,
    private store$: Store<RootStoreState.State>,
    private questionGroupService: QuestionGroupService,
    private questionService: QuestionService,
    private questionnairesService: QuestionnairesService,
    private userService: UserService) { }
}
