import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Report } from '@app/models';
import { MatDialog, MatDialogRef } from '@angular/material';
import {
  ReportsModalDialogComponent
} from '@app/components/dialog/reports-modal-dialog/reports-modal-dialog.component';
import { ReportsService } from '@app/_reports/services/reports.service';

@Component({
  selector: 'app-reports-cell-renderer',
  templateUrl: './reports-cell-renderer.component.html',
  styleUrls: ['./reports-cell-renderer.component.scss']
})
export class ReportsCellRendererComponent implements ICellRendererAngularComp {

  counter: number;
  reports: Report;
  params: any;

  constructor(public dialog: MatDialog, public reportService: ReportsService) {
  }

  agInit(params) {
    this.params = params;
    this.reports = params.data.reports ? params.data.reports : [];
    this.counter = params.data.reports ? params.data.reports.length : 0;
  }

  openReports() {
    const dialogRef = this.openDialog(this.params.data.reports, this.params.data.id);
    dialogRef.afterClosed().subscribe(() => {
      this.reportService.getReportsByCompanyId(this.params.data.id).subscribe(results => {
        this.counter = results ? results.length : 0;
      });
    });
  }

  /**
   * Call refresh() method from ParticipantsComponent
   */
  invokeParentMethod() {
    this.params.context.componentParent.refresh();
  }

  private openDialog(reports_list: Report[], company_id): MatDialogRef<any> {
    return this.dialog.open(ReportsModalDialogComponent, <any> {
      width: '600px',
      data: {
        title: 'Reports',
        list: reports_list,
        company_id: company_id,
        parent: this
      }
    });
  }

   /**
   * Required for implementation ICellRendererAngularComp interface
   */
  refresh(): boolean {
    return false;
  }
}
