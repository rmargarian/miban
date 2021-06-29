import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';

import {
  RootStoreState,
  RouteStoreActions
} from '../../root-store';

import { AuthenticationService } from '@app/services';
import { RoutesEnum, RolesEnum } from '@app/enums';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: [
    '../../components/dialog/dialog.component.scss',
    './log-in.component.scss'
  ]
})
export class LogInComponent implements OnInit {
  @ViewChild('username', { static: false }) usernameElement: ElementRef;
  logInForm: FormGroup;
  errorMessage: string;
  incorrectUser: string;
  incorrectPass: string;
  show: boolean;
  element: any;
  passwordClass: string = 'visibility_off';
  passWordType: string = 'password';

  constructor(private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService,
              private store$: Store<RootStoreState.State>) {

    this.show = false;


    this.logInForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });


    this.logInForm.valueChanges.subscribe(() => {
      this.incorrectPass = undefined;
      this.incorrectUser = undefined;
    });
  }

  ngOnInit() {
    setTimeout(() => {
      (<any>this.usernameElement).focus();
    });
  }

  get f() {
    return this.logInForm.controls;
  }

  login() {
    if (this.logInForm.invalid) {
      return;
    }
    this.authenticationService.login(this.logInForm.value).subscribe(() => {
      this.goToPrevURL(this.authenticationService.getPreviousUrl());
    }, error => {
      for (const item in error) {
        if (item === 'error') {
          this.errorMessage = error[item].message;
          this.setErrorMessage(this.errorMessage);
        }
      }
    });
  }

  private goToPrevURL(url: string) {
    if (!url) {
      this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.ADMIN, path: RoutesEnum.WELCOME, param: ''}));
    }

    const urlChunks = url.split('?')[0].split('/');
    /** Remove emrty chunk if url started with '/' */
    if (!urlChunks[0]) urlChunks.shift();

    if ((urlChunks[0] === 'admin' || urlChunks[0] === 'clients') && urlChunks.length > 1) {
      const path = urlChunks[1];
      const param = urlChunks.length > 2 ? urlChunks[2] : '';
      const role = urlChunks[0] === 'admin' ? RolesEnum.ADMIN : RolesEnum.CLIENTS;
      this.store$.dispatch(new RouteStoreActions.Navigate({role: role, path: path, param: param}));
    } else {
      this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.ADMIN, path: RoutesEnum.WELCOME, param: ''}));
    }
  }

  public passwordToogle() {
    if (this.passWordType === 'password') {
      this.passWordType = 'text';
      this.passwordClass = 'visibility';
    } else {
      this.passWordType = 'password';
      this.passwordClass = 'visibility_off';
    }
  }

  setErrorMessage(errorMessage) {
    switch (errorMessage) {
      case 'Password is wrong' :
        this.incorrectPass = errorMessage;
        return this.incorrectPass;
      case 'User admin not found' :
        this.incorrectUser = errorMessage;
        return this.incorrectUser;
    }
  }
}
