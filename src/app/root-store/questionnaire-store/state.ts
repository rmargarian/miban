import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Questionnaire, QuestionGroup, Question, User, SendEmailTemplate } from '@app/models';
import { SelectStatusesEnum, SortStatusesEnum, QuestionnaireTabs } from '@app/enums';

export const featureAdapter: EntityAdapter<Questionnaire> = createEntityAdapter<Questionnaire>({
  selectId: model => model.id,
  sortComparer: false
});

export interface State extends EntityState<Questionnaire> {
  /**Chosen on left-side navbar Questionnaire id */
  selectedId: number;
  error?: any;
  selectedTab: number;
  /**Questions tab states */
  questions_groups: QuestionGroup[]; /**Origin QuestionGroup array loaded from DB */
  sorted_groups: QuestionGroup[]; /**Sorted and with selected/opened states QuestionGroup array */
  opened_groups_ids: number[];
  selected_groups_ids: number[];
  selected_items_ids: number[];
  unassignedQuestions: Question[]; /**Origin Questions array loaded from DB */
  unassignedQuestionsSelected: Question[]; /**With selected states Questions array */
  searchValue: string;
  /**Invitation/Result emails tabs states */
  companyId: number;
  users: User[];
  resCompanyId: number;
  resUsers: User[];
  hasUnsavedTemplate: boolean;
  unsavedTemplates: SendEmailTemplate[];
  filteredUsers: User[];
  resFilteredUsers: User[];
  appliedFilters: {};
  resAppliedFilters: {};
  selectedUsersIds: number[];
  resSelectedUsersIds: number[];
  /**Select participants criterium (All, Incomplete, Complete, None) */
  selectCriterium: SelectStatusesEnum;
  resSelectCriterium: SelectStatusesEnum;
  /**Sort participants criterium */
  sortCriterium: SortStatusesEnum;
  resSortCriterium: SortStatusesEnum;
  invTemplate: SendEmailTemplate;
  remTemplate: SendEmailTemplate;
  resTemplate: SendEmailTemplate;
}

export const initialState: State = featureAdapter.getInitialState(
  {
    selectedId: NaN,
    error: null,
    selectedTab: QuestionnaireTabs.SETUP,

    questions_groups: [],
    sorted_groups: [],
    opened_groups_ids: [],
    selected_groups_ids: [],
    selected_items_ids: [],
    unassignedQuestions: [],
    unassignedQuestionsSelected: [],
    searchValue: '',

    companyId: NaN,
    users: null,
    resCompanyId: NaN,
    resUsers: [],
    hasUnsavedTemplate: false,
    unsavedTemplates: [],
    filteredUsers: [],
    resFilteredUsers: [],
    appliedFilters: {
      p_location: [],
      p_date: [],
      p_groups: [],
      p_saved: []
    },
    resAppliedFilters: {
      p_location: [],
      p_date: [],
      p_groups: [],
      p_saved: []
    },
    selectedUsersIds: [],
    resSelectedUsersIds: [],
    selectCriterium: SelectStatusesEnum.INCOMPLETE,
    resSelectCriterium: SelectStatusesEnum.COMPLETE,
    sortCriterium: SortStatusesEnum.FIRST,
    resSortCriterium: SortStatusesEnum.FIRST,
    invTemplate: null,
    remTemplate: null,
    resTemplate: null
  }
);



