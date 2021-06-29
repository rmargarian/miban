import { Component, OnInit } from '@angular/core';
import { ConfirmationDialogComponent, DialogComponent, WarningDialogComponent } from '@app/components';
import { MatDialogRef } from '@angular/material';
import { RenameReportDialogComponent } from '@app/components/dialog/rename-report-dialog/rename-report-dialog.component';
import { Report } from '@app/models';
import { formatDate } from '@app/utils';

@Component({
  selector: 'app-reports-modal-dialog',
  templateUrl: './reports-modal-dialog.component.html',
  styleUrls: ['./reports-modal-dialog.component.scss']
})
export class ReportsModalDialogComponent extends DialogComponent implements OnInit {

  loading: boolean;

  ngOnInit() {
  }

  /**
   * Change reports date format to 'DD-MMM-YY'
   */
  changeDateFormate(dt) {
    if (dt) {
      const parts = dt.split(' ');
      const date_parts = parts[0].split('-');
      if (date_parts.length !== 3) { return; }

      const converted_date = date_parts[2] + '-' + date_parts[1] + '-' + date_parts[0];
      const date = formatDate(new Date(converted_date));
      const time = parts[1] ? ' ' + parts[1] : '';
      return date + time;
    }

    return '';
  }

  getReport(code) {
    window.open('/clients/' + code, '_blank');
  }

  rename(report: Report) {
    const dialogRef = this.openRenameReportDialog(report.name);
    dialogRef.afterClosed().subscribe(name => {
      if (name) {
        this.loading = true;
        this.reportService.renameReport(name, report.id).subscribe(
          res => {
          this.refresh();
        } , error => {
          this.loading = false;
          this.openWarningDialog('Error', error.toString());
        });
      }
    });
  }

  refresh() {
    this.reportService.getReportsByCompanyId(this.data.company_id).subscribe(list => {
      if (list) {
        this.data.list = list;
        this.loading = false;
      }
    });
    if (this.data.parent) {
      this.data.parent.invokeParentMethod();
    }
  }

  delete(id: number) {
    const dialogRef = this.openDeleteConfirmationDialog();
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.loading = true;
        this.reportService.deleteReport(id).subscribe(() => {
          this.refresh();
        });
      }
    } , error => {
      this.loading = false;
      this.openWarningDialog('Error', error.toString());
    });
  }

  private openRenameReportDialog(name: string): MatDialogRef<any> {
    return this.dialog.open(RenameReportDialogComponent, <any> {
      width: '400px',
      data: {
        title: 'Rename report',
        name: name
      }
    });
  }

  private openDeleteConfirmationDialog(): MatDialogRef<any> {
    return this.dialog.open(ConfirmationDialogComponent, <any>{
      width: '400px',
      data: {
        text: 'Are you sure you want to delete selected report?'
      }
    });
  }

  private openWarningDialog(title: string, text: string): MatDialogRef<any> {
    return this.dialog.open(WarningDialogComponent, <any> {
      data: {
        title: title,
        text: text
      }
    });
  }

}
