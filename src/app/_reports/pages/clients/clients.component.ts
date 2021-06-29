import {Component, Input, OnInit} from '@angular/core';
import {ReportsService} from 'app/_reports/services/reports.service';
import {TypeReport} from 'app/_reports/pages/clients/index';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  public report;
  public TypeReport = TypeReport;
  public typeStatus: any;
  public companies;
  public nameOfQuestionnaire: string;
  public reportName: string;
  public parsedReport;
  public hideKeysAndAvg: boolean = false;

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

          if ((this.parsedReport.hasOwnProperty('hideKeysAndAvg') && this.parsedReport.hideKeysAndAvg === 'on') ) {
            this.hideKeysAndAvg = true;
          } else {
            this.hideKeysAndAvg = false;
          }

          if (this.parsedReport) {
            this.typeStatus = TypeReport.DataOBJECT;
            this.report.html = this.parsedReport;
            this.companies = this.parsedReport.companies;
            this.nameOfQuestionnaire = this.parsedReport.questionnaire.title;
          } else {
            this.typeStatus = TypeReport.DataHTML;
            this.nameOfQuestionnaire = report.reportQuestionnaire.title;
            this.companies = [{title: report.companies.title}];
          }
          this.reportName = report.name;
        } else {
          console.error('There is no report');
        }
      });
  }

  /**
   * function check what type of report was received and try to Parse it;
   * if type of report is Object than function return report Object
   * if type of report is string than function return boolean value
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
