import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

import { Keys } from '@app/models';
import { featureAdapter, State } from './state';
import { SortColumn } from '@app/interfaces';

export const selectKeyState: MemoizedSelector<object, State> = createFeatureSelector<State>('key');
export const selectAllKeysItems: (state: object) => Keys[] = featureAdapter.getSelectors(selectKeyState).selectAll;
export const selectKeyById = (id: number) => createSelector(this.selectAllKeysItems, (allKeys: Keys[]) => {
  if (allKeys) {
    return allKeys.find(p => p.id === id);
  } else {
    return null;
  }
});

const getShowAll = (state: State): boolean => state.showAll;
const getSelectedKey = (state: State): Keys => state.selectedKey;
const getSortColumn = (state: State): SortColumn => state.sortColumn;
const getFilterValue = (state: State): string => state.filterValue;
const getKeys = (state: State): Keys[] => state.keys;
const getError = (state: State): any => state.error;
const getKeysShortList = (state: State): Keys[] => state.keysShortList;
const getKeysFullList = (state: State): Keys[] => state.keysFullList;
const getKeysLoaded = (state: State): boolean => state.keysLoaded;

export const selectKeysShowAll: MemoizedSelector<object, boolean> = createSelector(selectKeyState, getShowAll);
export const selectSelectedKey: MemoizedSelector<object, Keys> = createSelector(selectKeyState, getSelectedKey);
export const selectSortColumn: MemoizedSelector<object, SortColumn> = createSelector(selectKeyState, getSortColumn);
export const selectFilterValue: MemoizedSelector<object, string> = createSelector(selectKeyState, getFilterValue);
export const selectKeys: MemoizedSelector<object, Keys[]> = createSelector(selectKeyState, getKeys);
export const selectKeysError: MemoizedSelector<object, any> = createSelector(selectKeyState, getError);
export const selectKeysShortList: MemoizedSelector<object, Keys[]> = createSelector(selectKeyState, getKeysShortList);
export const selectKeysFullList: MemoizedSelector<object, Keys[]> = createSelector(selectKeyState, getKeysFullList);
export const selectKeysLoaded: MemoizedSelector<object, boolean> = createSelector(selectKeyState, getKeysLoaded);
