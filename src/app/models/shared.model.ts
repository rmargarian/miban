import {
  Currency,
  CareerCategory,
  Country,
  CountryState
} from '@app/models';

export interface SharedModel {
    careers: CareerCategory[];
    countries: Country[];
    countriesStates: CountryState[];
    currencies: Currency[];
}
