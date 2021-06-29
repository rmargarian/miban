import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

import {
  RootStoreState,
  RouteStoreActions,
  AttemptStoreSelectors
} from '@app/root-store';

import { AttemptService } from '@app/_user/services';
import { Questionnaire, ResultReport } from '@app/models';
import { RoutesEnum, FaceTypes, FaceColors, FaceIcons, FaceSvgPaths } from '@app/enums';

@Component({
  selector: 'app-results-page',
  templateUrl: './results-page.component.html',
  styleUrls: ['./results-page.component.scss']
})
export class ResultsPageComponent implements OnInit, OnDestroy {

  public table = [];
  public questionnaire: Questionnaire = {} as Questionnaire;
  public score: string = '';
  public with_faces: boolean = false;
  public loading: boolean = true;
  private destroySubject$: Subject<void> = new Subject();

  constructor(
    @Inject(DOCUMENT) private _document: HTMLDocument,
    private titleService: Title,
    private store$: Store<RootStoreState.State>,
    private attemptService: AttemptService
  ) { }

  ngOnInit() {
    this.store$.pipe(
      take(1),
      select(AttemptStoreSelectors.selectResReportCode)
    ).subscribe((code: string) => {
      this.attemptService.getResultsReportByCode(code)
      .subscribe(
        (report: ResultReport) => {
          this.table = JSON.parse(report.html);
          this.score = report.score;
          this.with_faces = report.with_faces;
          this.questionnaire = report.questionnaire;

          const title = `${this.questionnaire.title} Report`;
          this.titleService.setTitle( title );
          this._document.getElementById('appFavicon').setAttribute('href', '/assets/img/mini-logo.ico');
          this.loading = false;
        }, (err) => {
          this.loading = false;
          this.store$.dispatch(new RouteStoreActions.Navigate({role: '', path: RoutesEnum.PAGE_NOT_FOUND, param: ''}));
        }
      );
    });
  }

  ngOnDestroy() {
    this.destroySubject$.next();
  }

  public getFaceIcon(option_face) {
    switch (option_face) {
      case FaceTypes.HAPPY:
        return FaceIcons.HAPPY;
      case FaceTypes.NEUTRAL:
        return FaceIcons.NEUTRAL;
      case FaceTypes.SAD:
        return FaceIcons.SAD;
    }
    return FaceIcons.NONE;
  }

  public getFaceIconPath(option_face) {
    switch (option_face) {
      case FaceTypes.HAPPY:
        return FaceSvgPaths.HAPPY;
      case FaceTypes.NEUTRAL:
        return FaceSvgPaths.NEUTRAL;
      case FaceTypes.SAD:
        return FaceSvgPaths.SAD;
    }
    return FaceSvgPaths.NONE;
  }

  public getFaceColor(option_face) {
    switch (option_face) {
      case FaceTypes.HAPPY:
        return FaceColors.HAPPY;
      case FaceTypes.NEUTRAL:
        return FaceColors.NEUTRAL;
      case FaceTypes.SAD:
        return FaceColors.SAD;
    }
    return FaceColors.NONE;
  }

  public getFaceColorClass(option_face) {
    switch (option_face) {
      case FaceTypes.HAPPY:
        return 'green';
      case FaceTypes.NEUTRAL:
        return 'yellow';
      case FaceTypes.SAD:
        return 'red';
    }
    return 'grey';
  }

  public getDefaultFaceColor() {
    return FaceColors.NONE;
  }

  public getDefaultFaceColorClass() {
    return 'grey';
  }
}
