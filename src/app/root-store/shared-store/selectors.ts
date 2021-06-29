import {
  createFeatureSelector,
  createSelector,
  MemoizedSelector
} from '@ngrx/store';

import { Country, SharedModel } from '@app/models';
import { State } from './state';

const selectSharedState: MemoizedSelector<object, State> = createFeatureSelector<State>('shared');

const getCountries = (state: State): Country[] => state.countries;
const getAll = (state: State): SharedModel => state;
const getError = (state: State): any => state.error;

export const selectCountries: MemoizedSelector<object, Country[]> = createSelector(selectSharedState, getCountries);
export const selectAll: MemoizedSelector<object, SharedModel> = createSelector(selectSharedState, getAll);
export const selectError: MemoizedSelector<object, any> = createSelector(selectSharedState, getError);
