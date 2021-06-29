
export interface State {
  mainRoute: string;
  childRoute: string;
  param?: string;
}

export const initialState: State = {
  mainRoute: '',
  childRoute: '',
  param: ''
};
