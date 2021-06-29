import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';

import { RootStoreState } from '@app/root-store';
import { Navigate } from '@app/root-store/route-store/actions';
import { AuthenticationService } from './authentication.service';
import { RoutesEnum, RolesEnum } from '@app/enums';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  constructor(
    private auth: AuthenticationService,
    private store$: Store<RootStoreState.State>) {
    }

  canActivate() {
    if (!this.auth.isTokenValid()) {
      this.store$.dispatch(new Navigate({role: RolesEnum.ADMIN, path: RoutesEnum.LOGIN, param: ''}));
      return false;
    }
    return true;
  }
}
