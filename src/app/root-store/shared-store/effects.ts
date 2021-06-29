import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, concatMap } from 'rxjs/operators';
import { DataService } from '@app/services/data.service';
import { Country, SharedModel } from '@app/models';
import * as featureActions from './actions';

@Injectable()
export class SharedEffects {
/**
 * Initiate store
 */
  @Effect()
  loadRequestEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.LoadRequestAction>(featureActions.ActionTypes.LOAD_REQUEST),
      startWith(new featureActions.LoadRequestAction()),
      concatMap(action =>
        this.dataService.getAllShared()
          .pipe(
            map(items => new featureActions.LoadSuccessAction( this.sortCountries(items) )),
            catchError(error => observableOf(new featureActions.LoadFailureAction({ error })))
          )
      )
    );

  /**
   * Store CareerCategory, Country, Currency, State arrays
   * Sorts Countries by 'name' field and
   * Add top 3 countries (Australia (id = 1), United Kingdom (id=2), United States (id=3))
   * into the top of list.
   * @param data (CareerCategory, Country, Currency, State arrays)
   */
  private sortCountries(data: SharedModel): SharedModel {
    if (!data || !data.countries.length) { return {} as SharedModel; }

    let topCountries = [];
    try {
      const australia = JSON.parse(JSON.stringify(data.countries.find((country: Country) => country.id === 1)));
      const uk = JSON.parse(JSON.stringify(data.countries.find((country: Country) => country.id === 2)));
      const us = JSON.parse(JSON.stringify(data.countries.find((country: Country) => country.id === 3)));
      australia.top = true;
      uk.top = true;
      us.top = true;
      topCountries = [australia, uk, us];
    } catch (error) {

    }

    data.countries.sort((a, b) => a.name.localeCompare(b.name));

    const countries: Country[] = [...topCountries, ...data.countries];
    data.countries = countries;

    return data;
  }

  constructor(private dataService: DataService, private actions$: Actions) { }
}
