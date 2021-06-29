import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

import { State } from './state';
import { SortColumn } from '@app/interfaces';

export const selectUserState: MemoizedSelector<object, State> = createFeatureSelector<State>('user');

/** Selector functions */
const getShowAll = (state: State): boolean => state.showAll;
const getCompanyId = (state: State): number => state.companyId;
const getLoading = (state: State): boolean => state.loading;
const getError = (state: State): boolean => state.error;
const getSelectedIds = (state: State): number[] => state.selectedIds;
const getFilterValue = (state: State): string => state.filterValue;
const getSortColumn = (state: State): SortColumn => state.sortColumn;

export const selectUserShowAll: MemoizedSelector<object, boolean> = createSelector(selectUserState, getShowAll);
export const selectUserCompanyId: MemoizedSelector<object, number> = createSelector(selectUserState, getCompanyId);
export const selectUserError: MemoizedSelector<object, any> = createSelector(selectUserState, getError);
export const selectUserLoading: MemoizedSelector<object, boolean> = createSelector(selectUserState, getLoading);
export const selectUserSelectedIds: MemoizedSelector<object, number[]> = createSelector(selectUserState, getSelectedIds);
export const selectFilterValue: MemoizedSelector<object, string> = createSelector(selectUserState, getFilterValue);
export const selectSortColumn: MemoizedSelector<object, SortColumn> = createSelector(selectUserState, getSortColumn);

