import * as Raven from 'raven-js';

import {BrowserModule} from '@angular/platform-browser';
import {NgModule, ErrorHandler} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {DatePipe} from '@angular/common';

import {
  MatDialogModule
} from '@angular/material';

import {RootStoreModule} from './root-store';
import {SharedModule} from '@app/_shared/shared.module';

import {AppComponent} from '@app/app.component';
import {PageUnfoundComponent} from '@app/pages/page-unfound/page-unfound.component';
import { UnsubscribeComponent } from '@app/pages/unsubscribe/unsubscribe.component';

import {HTTP_INTERCEPTOR_PROVIDERS} from '@app/services/http-interceptors';

import {AppRoutingModule} from './app-routing.module';

Raven
  .config('https://082d5b0f2a024c8bbaee75f7e23e7f6c@sentry.negotiations.com/4')
  .install();

export class RavenErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    Raven.captureException(err);
  }
}

@NgModule({
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    RootStoreModule,
    SharedModule,
    MatDialogModule
  ],
  declarations: [
    AppComponent,
    PageUnfoundComponent,
    UnsubscribeComponent
  ],
  providers: [
    { provide: ErrorHandler, useClass: RavenErrorHandler },
    DatePipe,
    HTTP_INTERCEPTOR_PROVIDERS
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
