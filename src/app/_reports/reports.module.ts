
import { NgModule } from '@angular/core';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from '../_reports/reports.component';
import { GenerateReportComponent } from '../_reports/pages/generate-report/generate-report.component';
import { ClientsComponent } from '../_reports/pages/clients/clients.component';
import { DownloadReportComponent } from '@app/_reports/pages/download-report/download-report.component';

import { ReportsService } from '../_reports/services/reports.service';
import { SharedModule } from '../_shared/shared.module';
import { AgGridModule } from 'ag-grid-angular';
import { CalcTextWidthService } from '@app/_reports/services/calc-text-width.service';
import { GraphsBaseComponent } from '@app/_reports/components/graphs/graphs-base/graphs-base.component';
import { AnswersRendererComponent } from '@app/_reports/components/graphs/answers-renderer/answers-renderer.component';
import { ReportRendererComponent } from './components/report-renderer/report-renderer.component';
import { StatusRendererComponent } from './components/report-renderer/status-renderer/status-renderer.component';
import { CreatedReportsDialogComponent} from '@app/_reports/components/created-reports-dialog/created-reports-dialog.component';
import { RadarChartComponent } from './components/graphs/radar-chart/radar-chart.component';
import { MoreTextToEmailDialogComponent } from '@app/_reports/components/more-text-to-email-dialog/more-text-to-email-dialog.component';

import {BarChartComponent} from '@app/_reports/components/graphs/bar-chart/bar-chart.component';
import {BarChartHorizontalComponent} from '@app/_reports/components/graphs/bar-chart-horizontal/bar-chart-horizontal.component';
import {PieChartComponent} from '@app/_reports/components/graphs/pie-chart/pie-chart.component';
import {StackedBarChartComponent} from '@app/_reports/components/graphs/stacked-bar-chart/stacked-bar-chart.component';

@NgModule({
  imports: [
    SharedModule,
    ReportsRoutingModule,
    AgGridModule.withComponents([
      StatusRendererComponent
    ])

  ],
  declarations: [
    ReportsComponent,
    GenerateReportComponent,
    ClientsComponent,
    DownloadReportComponent,
    GraphsBaseComponent,
    AnswersRendererComponent,
    ReportRendererComponent,
    StatusRendererComponent,
    CreatedReportsDialogComponent,
    MoreTextToEmailDialogComponent,
    RadarChartComponent,
    BarChartComponent,
    BarChartHorizontalComponent,
    PieChartComponent,
    StackedBarChartComponent
  ],
  providers: [
    ReportsService,
    CalcTextWidthService
  ],
  entryComponents: [
    CreatedReportsDialogComponent,
    MoreTextToEmailDialogComponent
  ]
})
export class ReportsModule {
}

