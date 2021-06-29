import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GenerateReportComponent } from '@app/_reports/pages/generate-report/generate-report.component';
import { DownloadReportComponent } from '@app/_reports/pages/download-report/download-report.component';
import { ClientsComponent } from '@app/_reports/pages/clients/clients.component';

import { AuthGuardService } from '@app/services/auth-guard.service';
import { ReportsRoutesEnum } from '@app/_reports/enums';

/**
 * create routes path
 * @type {({path: ReportsRoutesEnum; component: GenerateReportComponent} | {path: string; component: ClientsComponent})[]}
 */
const routes: Routes = [
  {
    path: ReportsRoutesEnum.GENERATE_REPORT, component: GenerateReportComponent, canActivate: [AuthGuardService]
  },
  {
    path: ':id', component: ClientsComponent
  },
  {
    path: 'download-pdf-report/:id', component: DownloadReportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule {
}
