import {Component, Input, OnInit} from '@angular/core';
import {ReportsService} from 'app/_reports/services';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-download-report',
  templateUrl: './download-report.component.html',
  styleUrls: ['./download-report.component.scss']
})
export class DownloadReportComponent implements OnInit {

  public report;
  public typeStatus: any;
  public companies;
  public nameOfQuestionnaire: string;
  public reportName: string;
  public parsedReport;

  constructor(public reportsService: ReportsService,
              private router: ActivatedRoute) {
  }

  ngOnInit() {
     /**
     * query to get report
     * check type of report
     * set data to variables (nameOfQuestionnaire, questionnaireGroups, rowData, companies, typeStatus)
     */
    this.reportsService.getByCode(this.router.snapshot.params.id)
      .subscribe(report => {
        if (report !== null) {
          this.report = report;
          this.parsedReport = this.isJsonString(report.html);
          if (!this.parsedReport.color) {
            this.parsedReport.color = '#94AE0A';
          }

          this.report.html = this.parsedReport;
            this.companies = this.parsedReport.companies;
            this.nameOfQuestionnaire = this.parsedReport.questionnaire.title;
          this.reportName = report.name;
        } else {
          console.error('There is no report');
        }
      });
  }

  /**
   * Checks what type of report was received and try to Parse it;
   * if type of report is an Object than returns report Object
   * if type of report is a string than returns boolean value
   * @param str
   * @returns {object | boolean}
   */
  private isJsonString(str): object | boolean {
    let obj;

    try {
      obj = JSON.parse(str);
    } catch (e) {
      return false;
    }
    return obj;
  }
}
