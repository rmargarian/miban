import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { Admin } from '@app/models';
import { featureAdapter, State } from './state';
import { SortColumn } from '@app/interfaces';

export const selectAdminState: MemoizedSelector<object, State> = createFeatureSelector<State>('admin');
export const selectAllAdmins: (state: object) => Admin[] = featureAdapter.getSelectors(selectAdminState).selectAll;
export const selectAdminById = (id: number) => createSelector(this.selectAllAdminItems, (allAdmins: Admin[]) => {
  if (allAdmins) {
    return allAdmins.find(p => p.id === id);
  } else {
    return null;
  }
});

const getSelectedAdmin = (state: State): Admin => state.selectedUserAdmin;
const getFilterValue = (state: State): string => state.filterValue;
const getSortColumn = (state: State): SortColumn => state.sortColumn;

export const selectSelectedAdmin: MemoizedSelector<object, Admin> = createSelector(selectAdminState, getSelectedAdmin);
export const selectAdminFilterValue: MemoizedSelector<object, string> = createSelector(selectAdminState, getFilterValue);
export const selectSortColumn: MemoizedSelector<object, SortColumn> = createSelector(selectAdminState, getSortColumn);
