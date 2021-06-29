import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Keys } from '@app/models';
import { SortColumn } from '@app/interfaces';

export const featureAdapter: EntityAdapter<Keys> = createEntityAdapter<Keys>({
  selectId: model => model.id
});

export interface State extends EntityState<Keys> {
  showAll: boolean;
  selectedKey: Keys;
  sortColumn: SortColumn | undefined;
  filterValue: string;
  error: any;
  keys: Keys[];
  /**Shared between all pages */
  keysShortList: Keys[];
  keysFullList: Keys[];
  keysLoaded: boolean;
}

export const initialState: State = featureAdapter.getInitialState(
  {
    showAll: false,
    selectedKey: undefined,
    sortColumn: undefined,
    filterValue: undefined,
    error: null,
    keys: undefined,
    keysShortList: undefined,
    keysFullList: undefined,
    keysLoaded: false
  }
);
