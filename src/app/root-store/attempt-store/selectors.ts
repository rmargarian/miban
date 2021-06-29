import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

import { User, Keys, QuestionGroup } from '@app/models';
import { State } from './state';

export const selectAttemptState: MemoizedSelector<object, State> = createFeatureSelector<State>('attempt');

/** Selector functions */
const getUser = (state: State): User => state.user;
const getKey = (state: State): Keys => state.key;
const getQuestionnaireId = (state: State): number => state.questionnaireId;
const getUserId = (state: State): number => state.userId;
const getNotRegistred = (state: State): boolean => state.notRegistred;
const getError = (state: State): string => state.error;
const getSecretKey = (state: State): string => state.secretKey;
const getEnteredEmail = (state: State): string => state.enteredEmail;
const getGroups = (state: State): QuestionGroup[] => state.questions_groups;
const getIsAdmin = (state: State): boolean => state.isAdmin;
const getunsubEmail = (state: State): string => state.unsubEmail;
const getResReportCode = (state: State): string => state.resReportCode;


export const selectUser: MemoizedSelector<object, User> = createSelector(selectAttemptState, getUser);
export const selectKey: MemoizedSelector<object, Keys> = createSelector(selectAttemptState, getKey);
export const selectQuestionnaireId: MemoizedSelector<object, number> = createSelector(selectAttemptState, getQuestionnaireId);
export const selectUserId: MemoizedSelector<object, number> = createSelector(selectAttemptState, getUserId);
export const selectNotRegistred: MemoizedSelector<object, boolean> = createSelector(selectAttemptState, getNotRegistred);
export const selectError: MemoizedSelector<object, string> = createSelector(selectAttemptState, getError);
export const selectSecretKey: MemoizedSelector<object, string> = createSelector(selectAttemptState, getSecretKey);
export const selectEnteredEmail: MemoizedSelector<object, string> = createSelector(selectAttemptState, getEnteredEmail);
export const selectQroups: MemoizedSelector<object, QuestionGroup[]> = createSelector(selectAttemptState, getGroups);
export const selectIsAdmin: MemoizedSelector<object, boolean> = createSelector(selectAttemptState, getIsAdmin);
export const selectUnsubEmail: MemoizedSelector<object, string> = createSelector(selectAttemptState, getunsubEmail);
export const selectResReportCode: MemoizedSelector<object, string> = createSelector(selectAttemptState, getResReportCode);



