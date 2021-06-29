import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Location } from '@angular/common';
import { map } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

import { RootStoreState } from '@app/root-store';
import { Navigate } from '@app/root-store/route-store/actions';
import * as UserStoreActions from '@app/root-store/user-store/actions';
import * as QuestionnaireStoreActions from '@app/root-store/questionnaire-store/actions';
import * as ImportStoreActions from '@app/root-store/import-store/actions';
import { RoutesEnum, RolesEnum } from '@app/enums';


interface TokenResponse {
  token: string;
  refreshToken: string;
}

export interface TokenPayload {
  password: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private previousUrl: string = '';
  private http: HttpClient;

  private readonly JWT_TOKEN = 'pfa-token';
  private readonly REFRESH_TOKEN = 'pfa-refresh-token';

  constructor(
    public location: Location,
    private handler: HttpBackend,
    private store$: Store<RootStoreState.State>) {

    // To ignore interceptor
    this.http = new HttpClient(this.handler);

    this.doLoginUser = this.doLoginUser.bind(this);
  }

  public getPreviousUrl(): string {
    return this.previousUrl;
  }

  public setPreviousUrl(): void {
    this.previousUrl = this.location.path();
  }

  public getUserDetails(): any {
    const token = this.getJwtToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    } else {
      return null;
    }
  }

  public isTokenValid(): boolean {
    const user = this.getUserDetails();

    const isValid = (user && user.exp > (Date.now() / 1000)) ? true : false;
    if (!isValid && this.location.path() !== '/admin/log-in') {
      this.previousUrl = this.location.path();
    }
    return isValid;
  }

  login(user: TokenPayload): Observable<any> {
    return this.http.post(`/api/admin/login`, user).pipe(
      map(this.doLoginUser));
  }

  logout() {
    this.store$.dispatch(new UserStoreActions.ResetAction());
    this.store$.dispatch(new QuestionnaireStoreActions.ResetAction());
    this.store$.dispatch(new ImportStoreActions.ResetAction());
    this.previousUrl = '';
    return this.http.post<any>(`/api/admin/logout`, {
      'refreshToken': this.getRefreshToken()
    }).subscribe(() => {
      this.removeTokens();
      this.store$.dispatch(new Navigate({role: RolesEnum.ADMIN, path: RoutesEnum.LOGIN, param: ''}));
    }, err => {
      this.removeTokens();
      this.store$.dispatch(new Navigate({role: RolesEnum.ADMIN, path: RoutesEnum.LOGIN, param: ''}));
    });
  }


  isLoggedIn() {
    return !!this.getJwtToken();
  }

  refreshToken() {
    const user = this.getUserDetails();
    if (!user) { return; }
    return this.http.post<any>(`/api/admin/refresh`, {
      'refreshToken': this.getRefreshToken(),
      'email': user.email
    }).pipe(tap((tokens: TokenResponse) => {
      this.storeJwtToken(tokens.token);
    }));
  }

  getJwtToken() {
    return localStorage.getItem(this.JWT_TOKEN);
  }

  private doLoginUser(data: TokenResponse) {
    if (data) {
      this.storeTokens(data);
    }
    return data;
  }

  private getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  private storeJwtToken(jwt: string) {
    localStorage.setItem(this.JWT_TOKEN, jwt);
  }

  private storeTokens(tokens: TokenResponse) {
    localStorage.setItem(this.JWT_TOKEN, tokens.token);
    localStorage.setItem(this.REFRESH_TOKEN, tokens.refreshToken);
  }

  private removeTokens() {
    localStorage.removeItem(this.JWT_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
  }
}
