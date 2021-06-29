import { User, Keys, QuestionGroup } from '@app/models';

export interface State {
  error?: string;
  userId: number;
  user: User;
  key: Keys;
  questionnaireId: number;
  notRegistred: boolean;
  userLoading: boolean;
  keyLoading: boolean;
  groupsLoading: boolean;
  secretKey: string;
  enteredEmail: string;
  isAdmin: boolean;
  unsubEmail: string;

  resReportCode: string;

  questions_groups: QuestionGroup[];
}

export const initialState: State = {
  error: '',
  userId: NaN,
  user: null,
  key: null,
  questionnaireId: NaN,
  notRegistred: false,
  userLoading: false,
  keyLoading: false,
  groupsLoading: false,
  secretKey: '',
  enteredEmail: '',
  isAdmin: false,
  unsubEmail: '',

  resReportCode: '',

  questions_groups: []
};


