import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

import { Questionnaire, QuestionGroup, User, SendEmailTemplate } from '@app/models';
import { featureAdapter, State } from './state';

export const selectQuestionnaireState: MemoizedSelector<object, State>
  = createFeatureSelector<State>('questionnaire');

/** Selector functions for Questions tab*/
const getSelectedId = (state: State): number => state.selectedId;
const getQuestGroups = (state: State): QuestionGroup[] => state.sorted_groups;
const getSelectedGroupsIds = (state: State): number[] => state.selected_groups_ids;
const getSelectedItemsIds = (state: State): number[] => state.selected_items_ids;
const getSearchValue = (state: State): string => state.searchValue;
const getSelectedTab = (state: State): number => state.selectedTab;

/** Selector functions for Invitation/result emails*/
const getCompanyId = (state: State): number => state.companyId;
const getUsers = (state: State): User[] => state.users;
const getResCompanyId = (state: State): number => state.resCompanyId;
const getResUsers = (state: State): User[] => state.resUsers;
const getHasUnsavedTemplate = (state: State): boolean => state.hasUnsavedTemplate;
const getUnsavedTemplates = (state: State): SendEmailTemplate[] => state.unsavedTemplates;
const getFilteredUsers = (state: State): User[] => state.filteredUsers;
const getResFilteredUsers = (state: State): User[] => state.resFilteredUsers;
const getAppliedFilters = (state: State): {} => state.appliedFilters;
const getResAppliedFilters = (state: State): {} => state.resAppliedFilters;
const getSelectedUsersIds = (state: State): number[] => state.selectedUsersIds;
const getResSelectedUsersIds = (state: State): number[] => state.resSelectedUsersIds;
const getInvTemplate = (state: State): SendEmailTemplate => state.invTemplate;
const getRemTemplate = (state: State): SendEmailTemplate => state.remTemplate;
const getResTemplate = (state: State): SendEmailTemplate => state.resTemplate;
const getError = (state: State): any => state.error;

export const selectAll = createSelector(
  selectQuestionnaireState,
  questionnairesState => {
      const allQuestionnaires = Object.values(questionnairesState.entities);
      return allQuestionnaires;
  }
);
export const selectEntities: (state: any) => any = featureAdapter.getSelectors(selectQuestionnaireState).selectEntities;
export const selectQuestionnaireSelectedId: MemoizedSelector<object, number> = createSelector(selectQuestionnaireState, getSelectedId);
export const selectQuestionnaireById = createSelector(
  selectEntities,
  selectQuestionnaireSelectedId,
  (entities, id) => entities[id]
);

/**Questions tab selectors */
export const selectQuestionsGroups: MemoizedSelector<object, QuestionGroup[]>
  = createSelector(selectQuestionnaireState, getQuestGroups);
export const selectSelectedGroupsIds: MemoizedSelector<object, number[]>
  = createSelector(selectQuestionnaireState, getSelectedGroupsIds);
export const selectSelectedItemsIds: MemoizedSelector<object, number[]>
  = createSelector(selectQuestionnaireState, getSelectedItemsIds);
export const selectSearchValue: MemoizedSelector<object, string>
  = createSelector(selectQuestionnaireState, getSearchValue);
export const selectSelectedTab: MemoizedSelector<object, number>
  = createSelector(selectQuestionnaireState, getSelectedTab);

/**Invitation/result emails tab selectors */
export const selectCompanyId: MemoizedSelector<object, number>
  = createSelector(selectQuestionnaireState, getCompanyId);
export const selectUsers: MemoizedSelector<object, User[]>
  = createSelector(selectQuestionnaireState, getUsers);
export const selectResCompanyId: MemoizedSelector<object, number>
  = createSelector(selectQuestionnaireState, getResCompanyId);
export const selectResUsers: MemoizedSelector<object, User[]>
  = createSelector(selectQuestionnaireState, getResUsers);
export const selectHasUnsavedTemplate: MemoizedSelector<object, boolean>
  = createSelector(selectQuestionnaireState, getHasUnsavedTemplate);
export const selectUnsavedTemplates: MemoizedSelector<object, SendEmailTemplate[]>
  = createSelector(selectQuestionnaireState, getUnsavedTemplates);
export const selectResFilteredUsers: MemoizedSelector<object, User[]>
  = createSelector(selectQuestionnaireState, getResFilteredUsers);
export const selectAppliedFilters: MemoizedSelector<object, {}>
  = createSelector(selectQuestionnaireState, getAppliedFilters);
export const selectResAppliedFilters: MemoizedSelector<object, {}>
  = createSelector(selectQuestionnaireState, getResAppliedFilters);

export const selectSelectedUsersIds: MemoizedSelector<object, number[]>
  = createSelector(selectQuestionnaireState, getSelectedUsersIds);
export const selectResSelectedUsersIds: MemoizedSelector<object, number[]>
  = createSelector(selectQuestionnaireState, getResSelectedUsersIds);

export const selectFilteredUsers: MemoizedSelector<object, User[]>
  = createSelector(selectQuestionnaireState, getFilteredUsers);
export const selectInvTemplate: MemoizedSelector<object, SendEmailTemplate>
  = createSelector(selectQuestionnaireState, getInvTemplate);
export const selectRemTemplate: MemoizedSelector<object, SendEmailTemplate>
  = createSelector(selectQuestionnaireState, getRemTemplate);
export const selectResTemplate: MemoizedSelector<object, SendEmailTemplate>
  = createSelector(selectQuestionnaireState, getResTemplate);
export const selectErrorState: MemoizedSelector<object, any>
  = createSelector(selectQuestionnaireState, getError);

