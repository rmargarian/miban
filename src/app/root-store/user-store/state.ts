import { User, Questionnaire } from '@app/models';
import { SortColumn } from '@app/interfaces';
import { SortOptions } from '@app/enums';

export interface State {
  error?: any;
  loading?: boolean;
  showAll: boolean;
  companyId: number;
  users: User[];
  companyQuests: Questionnaire[];
  selectedIds: number[];
  filterValue: string;
  sortColumn: SortColumn | undefined;
}

export const initialState: State = {
  error: null,
  loading: false,
  showAll: false,
  companyId: undefined,
  users: [],
  companyQuests: [],
  selectedIds: [],
  filterValue: undefined,
  sortColumn: {
    colId: 'first_name',
    sort: SortOptions.ASC
  }
};
