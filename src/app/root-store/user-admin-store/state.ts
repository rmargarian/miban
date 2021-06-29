import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Admin } from '@app/models';
import { SortColumn } from '@app/interfaces';

export const featureAdapter: EntityAdapter<Admin> = createEntityAdapter<Admin>({
  selectId: model => model.id
});

export interface State extends EntityState<Admin> {
  selectedUserAdmin: Admin;
  filterValue: string;
  sortColumn: SortColumn | undefined;
}

export const initialState: State = featureAdapter.getInitialState(
  {
    selectedUserAdmin: undefined,
    sortColumn: undefined,
    filterValue: undefined
  }
);
