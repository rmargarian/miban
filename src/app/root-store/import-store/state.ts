import { User } from '@app/models';

export interface State {
  companyId: number;
  users: User[];
  file: File;
  showSecond: boolean;
  showThird: boolean;
}

/**
 * Initiate 'Import Participants' page states
 */
export const initialState: State = {
  companyId: NaN,
  users: [],
  file: undefined,
  showSecond: false,
  showThird: false
};
