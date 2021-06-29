import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

import { State } from './state';

export const selectRouteState: MemoizedSelector<object, State> = createFeatureSelector<State>('route');

/** Selector functions */
const getRoute = (state: State): string => state.childRoute;

export const selectChildRoute: MemoizedSelector<object, string> = createSelector(selectRouteState, getRoute);

