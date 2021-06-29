import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { DialogComponent } from '../../../components/dialog';
import { Report } from '@app/models';
import { MatTooltip } from '@angular/material';
import { config } from '@app/config/config';

@Component({
  selector: 'app-created-reports-dialog',
  templateUrl: './created-reports-dialog.component.html',
  styleUrls: ['./created-reports-dialog.component.scss']
})
export class CreatedReportsDialogComponent extends DialogComponent implements OnInit, OnDestroy {

  title: string;
  reports: Report[];
  message: string;
  @ViewChild(MatTooltip, { static: false }) copyTooltip: MatTooltip;

  ngOnInit() {
    if (this.data) {
      this.reports = this.data.reports;
      this.reports.forEach(report => {
        report.link = config.BASE_URL + 'clients/' + report.code;
      });
      this.title = this.data.title;
    }
  }

  copyLink(link: string) {
    this.message = '';
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = link;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.showTooltip();
    setTimeout(() => {
      this.hideTooltip();
    }, 3000);
  }

  showTooltip() {
    this.message = 'Copied';
    this.copyTooltip.show(0);
  }

  hideTooltip() {
    this.message = undefined;
    this.copyTooltip.hide();
  }

  ngOnDestroy() {
    this.message = undefined;
  }
}
