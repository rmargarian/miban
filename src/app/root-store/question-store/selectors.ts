import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

import { Keys, Question } from '@app/models';
import { featureAdapter, State } from './state';
import { selectKeyState } from '@app/root-store/keys-store/selectors';

export const selectQuestionState: MemoizedSelector<object, State>
  = createFeatureSelector<State>('question');


const getFilterValue = (state: State): string => state.filterValue;
const getSelectedKey = (state: State): Question => state.selectedQuestion;
const getError = (state: State): any => state.error;

export const selectAll: (state: Question[]) =>
  Question[] = featureAdapter.getSelectors(selectQuestionState).selectAll;

export const selectFilterValue: MemoizedSelector<object, string> = createSelector(selectQuestionState, getFilterValue);
export const selectSelectedQuestion: MemoizedSelector<object, Question> = createSelector(selectQuestionState, getSelectedKey);
export const selectQuestionsError: MemoizedSelector<object, any> = createSelector(selectQuestionState, getError);
