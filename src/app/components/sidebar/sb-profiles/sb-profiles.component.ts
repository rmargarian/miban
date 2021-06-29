import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { Questionnaire } from '@app/models';
import { RolesEnum } from '@app/enums';

import {
  RootStoreState,
  RouteStoreActions
} from '@app/root-store';

@Component({
  selector: 'app-sb-profiles',
  templateUrl: './sb-profiles.component.html',
  styleUrls: ['./sb-profiles.component.scss']
})
export class SbProfilesComponent implements OnInit {
  @Input() data: Questionnaire[] = [];
  @Input() parentRoute: string = '';
  @Input() route$: Observable<string>;
  @Input() qId$: Observable<number>;

  folderOpened = false;

  constructor(private store$: Store<RootStoreState.State>)
  { }

  ngOnInit() {
  }

  triggerFolder($event: Event) {
    this.folderOpened = !this.folderOpened;
    if (this.folderOpened ) {
      this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.ADMIN, path: this.parentRoute, param: ''}));
    }
    $event.stopPropagation();
  }

  openFolder($event: Event) {
    this.folderOpened = true;
    this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.ADMIN, path: this.parentRoute, param: ''}));
  }

  itemChosen(item: any, $event: Event) {
    this.store$.dispatch(new RouteStoreActions.Navigate({role: RolesEnum.ADMIN, path: this.parentRoute, param: item.id}));
    $event.stopPropagation();
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

}
