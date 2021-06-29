import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

import { State } from './state';
import { IncompleteAttempt } from '@app/models';

export const selectIncompleteAttemptState: MemoizedSelector<object, State> = createFeatureSelector<State>('incomplete_attempt');

/** Selector functions */
const getQuestionnaireId = (state: State): number => state.questionnaireId;
const getLoading = (state: State): boolean => state.loading;
const getError = (state: State): boolean => state.error;
const getSelectedIds = (state: State): number[] => state.selectedIds;
const getAttempts = (state: State): IncompleteAttempt[] => state.attempts;

export const selectIncompleteAttemptrQuestionnaireId: MemoizedSelector<object, number> =
      createSelector(selectIncompleteAttemptState, getQuestionnaireId);
export const selectIncompleteAttemptError: MemoizedSelector<object, any> = createSelector(selectIncompleteAttemptState, getError);
export const selectIncompleteAttemptLoading: MemoizedSelector<object, boolean> = createSelector(selectIncompleteAttemptState, getLoading);
export const selectIncompleteAttemptSelectedIds: MemoizedSelector<object, number[]> =
      createSelector(selectIncompleteAttemptState, getSelectedIds);
export const selectIncompleteAttemptAttempts: MemoizedSelector<object, IncompleteAttempt[]> =
      createSelector(selectIncompleteAttemptState, getAttempts);

