import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map, tap, filter, take, distinctUntilChanged} from 'rxjs/operators';
import {Store, select} from '@ngrx/store';
import {Router, NavigationEnd, ActivatedRoute} from '@angular/router';

import * as RootStoreState from '@app/root-store/state';
import * as RouteStoreActions from './actions';
import * as UserStoreActions from '../user-store/actions';
import * as QuestionnaireStoreActions from '../questionnaire-store/actions';
import * as QuestionnaireStoreSelectors from '../questionnaire-store/selectors';
import * as featureActions from './actions';
import * as AttemptStoreActions from '../attempt-store/actions';
import * as KeysStoreActions from '../keys-store/actions';
import * as KeysStoreSelectors from '../keys-store/selectors';
import * as RouteStoreSelectors from '../route-store/selectors';

import { ShowDialogService } from '@app/services/show-dialog.service';
import { AuthenticationService } from '@app/services/authentication.service';
import { QuestionnairesService } from '@app/services/questionnaires.service';
import { SendEmailTemplate } from '@app/models';
import { RoutesEnum, RolesEnum, QuestionnaireTabs } from '@app/enums';
import { UserRoutesEnum } from '@app/_user/enums';
import { getMd5Value } from '@app/utils';


@Injectable()
export class RouteStoreEffects {
  @Effect()
  navigateEffect$: Observable<Action> = this.actions$
    .pipe(
      ofType<featureActions.Navigate>(featureActions.ActionTypes.NAVIGATE),
      map((action: featureActions.Navigate) => action.payload),
      tap(({role, path, param, queryParams}) => {
        if (path === RoutesEnum.PAGE_NOT_FOUND) {
          this.router.navigate([RoutesEnum.PAGE_NOT_FOUND]);
          return;
        }
        if (role === RolesEnum.ADMIN) {
          this.navigateAdmin(path, param);
        } else if (role === RolesEnum.USER) {
          this.navigateUser(path, queryParams);
        } else if (role === RolesEnum.CLIENTS) {
          this.navigateReports('clients/reports');
        }
      }),
      map(() => new featureActions.NavigateSuccessAction())
    );

  private navigateAdmin(path: string, param: any) {
    const parameter = param ? '/' + param : '';
    this.store$.pipe(
      take(1),
      select(QuestionnaireStoreSelectors.selectUnsavedTemplates)
    ).subscribe((templates: SendEmailTemplate[]) => {
      if (templates.length) {
        const text = 'You have the unsaved templates, would you like to save them?';
        const dialogRef = this.showDialogService.openConfirmationDialog(text, 'Confirm');
        dialogRef.afterClosed()
          .subscribe((data: any) => {
            if (data) {
              this.questionnairesService.updateTemplates(templates)
              .subscribe((msg) => {
                this.store$.dispatch(new QuestionnaireStoreActions.SetHasUnsavedTemplateAction(false));
                this.store$.dispatch(new QuestionnaireStoreActions.ClearUnsavedTemplatesAction());
                this.router.navigate(['/admin/' + path + parameter]);
              }, err => {
                this.store$.dispatch(new QuestionnaireStoreActions.SetHasUnsavedTemplateAction(false));
                this.store$.dispatch(new QuestionnaireStoreActions.ClearUnsavedTemplatesAction());
                this.router.navigate(['/admin/' + path + parameter]);
              });
            } else {
              this.store$.dispatch(new QuestionnaireStoreActions.SetHasUnsavedTemplateAction(false));
              this.store$.dispatch(new QuestionnaireStoreActions.ClearUnsavedTemplatesAction());
              this.router.navigate(['/admin/' + path + parameter]);
            }
          });
      } else {
        this.router.navigate(['/admin/' + path + parameter]);
      }
    });
  }

  private navigateUser(path: string, queryParams: any) {
    if (!queryParams) { queryParams = <any>{}; }
    let params = '';
    if (queryParams.kId) {
      params += '/' + queryParams.kId;
    }
    if (queryParams.qId) {
      params += '-' + queryParams.qId;
    }
    if (queryParams.uId) {
      params += '-' + queryParams.uId;
    }
    if (queryParams.token) {
      params += '-' + queryParams.token;
    }
    this.router.navigate(['/' + path + params]);
  }

  private navigateReports(path: string) {
    this.router.navigate(['/' + path]);
  }

  private processURL(url: string) {
    if (!url) { return; }

    const urlChunks = url.split('?')[0].split('/');
    /** Remove emrty chunk if url started with '/' */
    if (!urlChunks[0]) { urlChunks.shift(); }

    if (urlChunks[0] === 'admin') {
      this.handleAdminRoutes(urlChunks);
    } else if (urlChunks[0] === RoutesEnum.PROFILES ||
          urlChunks[0] === RoutesEnum.ASSESSMENTS ||
          urlChunks[0] === RoutesEnum.FEEDBACK) {
      this.handleUserRoutes(urlChunks);
    } else if (urlChunks[0] === 'clients') {
    } else if (urlChunks[0] === 'unsubscribe' && urlChunks.length === 2) {
      this.handleUnsubscribeRoutes(urlChunks);
    } else {
      this.router.navigate([RoutesEnum.PAGE_NOT_FOUND]);
    }
  }

  private handleAdminRoutes(urlChunks: string[]) {
    if (urlChunks[1] === RoutesEnum.PARTICIPANTS) {
      /**Third param must be a company id */
      if (urlChunks.length === 3) {
        this.store$.pipe(
          take(1),
          select((state: RootStoreState.State) => state.user.companyId)
        ).subscribe((companyId: number) => {
          const id = parseInt(urlChunks[2], 10);
          if (urlChunks[1] === RoutesEnum.PARTICIPANTS && urlChunks[2] && (companyId !== id)) {
            this.store$.dispatch(new UserStoreActions.SetCompanyIdAction(parseInt(urlChunks[2], 10)));
            this.store$.dispatch(new UserStoreActions.LoadRequestAction(parseInt(urlChunks[2], 10)));
          }
        });
      } else {
        this.store$.dispatch(new UserStoreActions.ResetAction());
      }
    } else if ((urlChunks[1] === RoutesEnum.PROFILES ||
        urlChunks[1] === RoutesEnum.ASSESSMENTS ||
        urlChunks[1] === RoutesEnum.FEEDBACK)) {
      const qId = urlChunks[2] ? parseInt(urlChunks[2], 10) : NaN;

      this.store$.pipe(
        take(1),
        select(QuestionnaireStoreSelectors.selectQuestionnaireSelectedId)
      ).subscribe((prevQid: number) => {
        if (prevQid && qId && prevQid === qId) {
          this.store$.dispatch(new QuestionnaireStoreActions.SortGroupsRequestAction());
          this.store$.dispatch(new QuestionnaireStoreActions.SelectUnassignedRequestAction());
        } else {
          this.store$.dispatch(new QuestionnaireStoreActions.SetSelectedIdAction(qId));
          this.store$.dispatch(new QuestionnaireStoreActions.LoadGroupsRequestAction(qId));
          this.store$.dispatch(new QuestionnaireStoreActions.LoadUnassignedRequestAction());
          this.store$.dispatch(new QuestionnaireStoreActions.ResetAction());
        }

        this.store$.pipe(
          take(1),
          select(RouteStoreSelectors.selectChildRoute)
        ).subscribe((route: string) => {
           /**
            * Dont't set default tab if first condition in brackets is true (to store selected tab for last selected PFA)
            * Set default tab:
            * - !route: if route is empty (app just loaded)
            * - (route !== urlChunks[1] || !prevQid):
            *   if route was switched between 'profiles'/'assessments'/'feedback' or in prev route wasn't selected one of P/A/F
            */
          if (!(prevQid && qId && prevQid === qId) && (!route || (route !== urlChunks[1] || !prevQid))) {
            setTimeout(_ => {
              this.store$.dispatch(new QuestionnaireStoreActions.SetSelectedTabAction(QuestionnaireTabs.INVIT_EMAILS));
            }, 100);
          }
        });
      });
    }

    if (urlChunks[1]) {
      this.store$.dispatch(new RouteStoreActions.SetChildRoute(urlChunks[1]));
    }
/**Load Short and Full list of Keys if not loaded yet and if Authentication passed */
    this.store$.pipe(
      take(1),
      select(KeysStoreSelectors.selectKeysLoaded)
    ).subscribe((isLoaded: boolean) => {
      if (!isLoaded && this.authenticationService.isTokenValid()) {
        this.store$.dispatch(new KeysStoreActions.LoadSharedRequestAction());
      }
    });
  }

  private handleUnsubscribeRoutes(urlChunks: string[]) {
    if (urlChunks.length === 2) {
      this.store$.dispatch(new AttemptStoreActions.SetUnsubEmailAction(urlChunks[1]));
    }
  }

  private handleUserRoutes(urlChunks: string[]) {
    if (urlChunks.length >= 2 &&
      (urlChunks[0] === UserRoutesEnum.ASSESSMENTS
        && urlChunks[1] === UserRoutesEnum.PRICE_INCREASE)) {
      this.handleFreeAttempt(urlChunks);
    } else if (urlChunks.length > 0 &&
        (urlChunks[0] === UserRoutesEnum.PROFILES ||
        urlChunks[0] === UserRoutesEnum.ASSESSMENTS ||
        urlChunks[0] === UserRoutesEnum.FEEDBACK)) {

      this.store$.dispatch(new RouteStoreActions.SetChildRoute(urlChunks[0]));
      if (urlChunks.length > 1) {
        /**If route based on  queryParams*/
        let params = this.route.snapshot.queryParams;
        /**If route based on dashed params */
        if (urlChunks.length === 3) {
          params = {};
          const chunks = urlChunks[2].split('-');
          if (chunks.length > 0) {
            params.kId = chunks[0];
          }
          if (chunks.length > 1) {
            params.qId = chunks[1];
          }
          if (chunks.length > 2) {
            params.uId = chunks[2];
          }
          if (chunks.length > 3) {
            params.token = chunks[3];
          }
        }
        switch (urlChunks[1]) {
        case UserRoutesEnum.REGISTER:
          if (params.kId && params.qId && Object.keys(params).length === 2) {
            this.store$.dispatch(new AttemptStoreActions.SetNotRegistredAction(true));
            this.store$.dispatch(new AttemptStoreActions.SetQuestionnaireIdAction(parseInt(params.qId, 10)));
            this.store$.dispatch(new AttemptStoreActions.LoadKeyRequestAction(parseInt(params.kId, 10)));
            this.store$.dispatch(new AttemptStoreActions.SetErrorAction(''));
          /**If missing key or questionnaire Id */
          } else {
            this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.USER, path: urlChunks[0], param: ''}));
            this.store$.dispatch(new AttemptStoreActions.SetErrorAction('[ERROR] Failed loading company'));
          }
        break;
        case UserRoutesEnum.AUTHENTICATE:
          if (params.uId && params.kId && params.qId && Object.keys(params).length === 3) {
            this.store$.dispatch(new AttemptStoreActions.SetNotRegistredAction(false));
            this.store$.dispatch(new AttemptStoreActions.SetQuestionnaireIdAction(parseInt(params.qId, 10)));
            this.store$.dispatch(new AttemptStoreActions.LoadKeyRequestAction(parseInt(params.kId, 10)));
            this.store$.dispatch(new AttemptStoreActions.LoadUserAttemptsRequestAction(
              {uId: params.uId, kId: params.kId, qId: params.qId}
            ));
            this.store$.dispatch(new AttemptStoreActions.SetErrorAction(''));
          /**If missing key id, user id or questionnaire Id */
          } else {
            this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.USER, path: urlChunks[0], param: ''}));
            this.store$.dispatch(new AttemptStoreActions.SetErrorAction('[ERROR] Failed loading company'));
          }
        break;
        case UserRoutesEnum.CHOOSE_PFA:
          if (params.kId && Object.keys(params).length === 1) {
            this.store$.dispatch(new AttemptStoreActions.LoadKeyRequestAction(parseInt(params.kId, 10)));
            this.store$.dispatch(new AttemptStoreActions.SetErrorAction(''));
          /**If missing key id or more then one queryParam is passed */
          } else {
            this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.USER, path: urlChunks[0], param: ''}));
            this.store$.dispatch(new AttemptStoreActions.SetErrorAction('[ERROR] Failed loading company'));
          }
        break;
        case UserRoutesEnum.ENTER_EMAIL:
          if (params.kId && params.qId && Object.keys(params).length === 2) {
            this.store$.dispatch(new AttemptStoreActions.SetQuestionnaireIdAction(parseInt(params.qId, 10)));
            this.store$.dispatch(new AttemptStoreActions.LoadKeyRequestAction(parseInt(params.kId, 10)));
            this.store$.dispatch(new AttemptStoreActions.SetErrorAction(''));
          /**If missing key id, questionnaire Id or more then two queryParams is passed*/
          } else {
            this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.USER, path: urlChunks[0], param: ''}));
            this.store$.dispatch(new AttemptStoreActions.SetErrorAction('[ERROR] Failed loading company'));
          }
        break;
        case UserRoutesEnum.CHANGE_KEY:
          if (params.uId && params.kId && params.qId && params.token && Object.keys(params).length === 4) {
            this.store$.dispatch(new AttemptStoreActions.LoadKeyRequestAction(parseInt(params.kId, 10)));
            this.store$.dispatch(new AttemptStoreActions.LoadUserRequestAction(
              {uId: params.uId, kId: params.kId, sKey: params.token}
            ));
            this.store$.dispatch(new AttemptStoreActions.SetSecretKeyAction(params.token));
            this.store$.dispatch(new AttemptStoreActions.SetErrorAction(''));
          /**If missing key id, user id or secret key */
          } else {
            this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.USER, path: urlChunks[0], param: ''}));
            this.store$.dispatch(new AttemptStoreActions.SetErrorAction('[ERROR] Failed loading company'));
          }
        break;
        case UserRoutesEnum.START:
        /**If super admin access */
          if (params.uId && params.kId && params.qId && params.token && Object.keys(params).length === 4) {
            const userDetails = this.authenticationService.getUserDetails();
            const token = getMd5Value(userDetails.exp.toString());
            if (params.token !== token) {
              this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.USER, path: urlChunks[0], param: ''}));
              this.store$.dispatch(new AttemptStoreActions.SetErrorAction('[ERROR] You don\'t have rights to open this page'));
            } else {
              this.store$.dispatch(new AttemptStoreActions.SetQuestionnaireIdAction(parseInt(params.qId, 10)));
              this.store$.dispatch(new AttemptStoreActions.LoadKeyRequestAction(parseInt(params.kId, 10)));
              this.store$.dispatch(new AttemptStoreActions.LoadUserAttemptsRequestAction(
                {uId: params.uId, kId: params.kId, qId: params.qId}
              ));
              this.store$.dispatch(new AttemptStoreActions.SetErrorAction(''));
              this.store$.dispatch(new AttemptStoreActions.SetIsAdminAction(true));
            }
          } else if (params.uId && params.kId && params.qId && Object.keys(params).length === 3) {
            this.store$.dispatch(new AttemptStoreActions.SetQuestionnaireIdAction(parseInt(params.qId, 10)));
            this.store$.dispatch(new AttemptStoreActions.LoadKeyRequestAction(parseInt(params.kId, 10)));
            this.store$.dispatch(new AttemptStoreActions.LoadUserAttemptsRequestAction(
              {uId: params.uId, kId: params.kId, qId: params.qId}
            ));
            this.store$.dispatch(new AttemptStoreActions.SetErrorAction(''));
            this.store$.dispatch(new AttemptStoreActions.SetIsAdminAction(false));
          /**If missing key id, user id or questionnaire Id */
          } else {
            this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.USER, path: urlChunks[0], param: ''}));
            this.store$.dispatch(new AttemptStoreActions.SetErrorAction('[ERROR] Failed loading company'));
          }
        break;
        case UserRoutesEnum.RESULT:
        if (urlChunks.length === 3) {
          try {
            const code = urlChunks[2];
            this.store$.dispatch(new AttemptStoreActions.SetResReportCodeAction(code));
            this.store$.dispatch(new AttemptStoreActions.SetErrorAction(''));
          } catch (error) {
            this.router.navigate([RoutesEnum.PAGE_NOT_FOUND]);
          }
        } else {
          this.router.navigate([RoutesEnum.PAGE_NOT_FOUND]);
        }
        break;
        case UserRoutesEnum.ENTER_KEY:
        default:
          this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.USER, path: urlChunks[0], param: ''}));
        }
        /**Load question groups for every routes with 'questionnaire id' in query params
         * to check in effects is Questionnaire contains at least one active group and one active question
         */
        if (params.qId) {
          this.store$.dispatch(new AttemptStoreActions.LoadGroupsRequestAction(parseInt(params.qId, 10)));
        }
      }
    } else {
      this.router.navigate([RoutesEnum.PAGE_NOT_FOUND]);
    }
  }

  private handleFreeAttempt(urlChunks: string[]) {
    switch (urlChunks[1]) {
      case UserRoutesEnum.PRICE_INCREASE:
        const fc = window.parent.frames.length;
        if (!fc) {
          //window.location.href = 'https://www.negotiations.com/training/';
        }
        this.store$.dispatch(new AttemptStoreActions.SetQuestionnaireIdAction(124));
        this.store$.dispatch(new AttemptStoreActions.LoadKeyRequestAction(460));
        this.store$.dispatch(new AttemptStoreActions.LoadGroupsRequestAction(124));
        break;
      default:
        this.router.navigate([RoutesEnum.PAGE_NOT_FOUND]);
    }
  }

  constructor(private showDialogService: ShowDialogService,
              private authenticationService: AuthenticationService,
              private questionnairesService: QuestionnairesService,
              private actions$: Actions,
              private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.router.routerState.snapshot.url),
        distinctUntilChanged())
      .subscribe(this.processURL.bind(this));
  }
}
