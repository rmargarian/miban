import { Country, CountryState, CareerCategory, Currency } from '@app/models';


export interface State {
  error?: any;
  countries: Country[];
  countriesStates: CountryState[];
  careers: CareerCategory[];
  currencies: Currency[];
}

export const initialState: State = {
  error: null,
  countries: [],
  countriesStates: [],
  careers: [],
  currencies: []
};


