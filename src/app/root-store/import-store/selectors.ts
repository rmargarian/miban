import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

import { State } from './state';
import { User } from '@app/models';

export const selectImportState: MemoizedSelector<object, State> = createFeatureSelector<State>('import');

/** Selector functions */
const getCompanyId = (state: State): number => state.companyId;
const getUsers = (state: State): User[] => state.users;
const getFile = (state: State): File => state.file;
const getShowSecond = (state: State): boolean => state.showSecond;
const getShowThird = (state: State): boolean => state.showThird;

export const selectCompanyId: MemoizedSelector<object, number> = createSelector(selectImportState, getCompanyId);
export const selectUsers: MemoizedSelector<object, User[]> = createSelector(selectImportState, getUsers);
export const selectFile: MemoizedSelector<object, File> = createSelector(selectImportState, getFile);
export const selectShowSecond: MemoizedSelector<object, boolean> = createSelector(selectImportState, getShowSecond);
export const selectShowThird: MemoizedSelector<object, boolean> = createSelector(selectImportState, getShowThird);

