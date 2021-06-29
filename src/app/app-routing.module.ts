import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageUnfoundComponent } from '@app/pages/page-unfound/page-unfound.component';
import { UnsubscribeComponent } from '@app/pages/unsubscribe/unsubscribe.component';

import { RoutesEnum } from '@app/enums';

const routes: Routes = [
  { path: '', redirectTo: RoutesEnum.PAGE_NOT_FOUND, pathMatch: 'full' },
  { path: RoutesEnum.PAGE_NOT_FOUND, component: PageUnfoundComponent },
  //{ path: RoutesEnum.UNSUBSCRIBE + '/:email', component: UnsubscribeComponent },
  {
    path: 'admin',
    loadChildren: './_admin/admin.module#AdminModule'
  },
  {
    path: RoutesEnum.PROFILES,
    loadChildren: './_user/user.module#UserModule'
  },
  {
    path: RoutesEnum.ASSESSMENTS,
    loadChildren: './_user/user.module#UserModule'
  },
  {
    path: RoutesEnum.FEEDBACK,
    loadChildren: './_user/user.module#UserModule'
  },
  {
    path: 'clients',
    loadChildren: './_reports/reports.module#ReportsModule'
  },
  { path: '**', component: PageUnfoundComponent }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes,
    {
     // enableTracing: true,
      onSameUrlNavigation: 'reload'
    })],
})
export class AppRoutingModule {
}
