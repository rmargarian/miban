import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material';

import { AuthenticationService } from '../authentication.service';
import { ExtendDialogComponent } from '@app/components';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    public authenticationService: AuthenticationService,
    private dialog: MatDialog) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.authenticationService.getJwtToken()) {
      request = this.addToken(request, this.authenticationService.getJwtToken());
    }

    return next.handle(request).pipe(catchError(error => {
      this.authenticationService.setPreviousUrl();
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return this.handle401Error(request, next);
      } else if (error instanceof HttpErrorResponse && error.status === 502) {
        const err = {message: 'Server is down'};
        return throwError(err);
      } else {
        return throwError(error);
      }
    }));
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authenticationService.refreshToken().pipe(
        switchMap((data: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(data.token);

          const dialogRef = this.openExtendDialog();
          return dialogRef.afterClosed()
          .pipe(
            switchMap(resp => {
              console.clear();
              if (resp) {
                return next.handle(this.addToken(request, data.token));
              } else {
                this.dialog.closeAll();
                this.authenticationService.logout();
              }
            }));
        }));

    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt));
        }));
    }
  }

  private openExtendDialog(): MatDialogRef<any> {
    return this.dialog.open(ExtendDialogComponent, <any>{
      disableClose: true,
      width: '500px'
    });
  }
}
