import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { QuestionnaireType } from '@app/enums/questionnaire-type';
import { ColDef, GridOptions } from 'ag-grid-community';
import * as d3 from 'd3';

import { WordCloudService } from '@app/services';
import { formatUserInfo } from '@app/_reports/components/graphs/graphs-utils';
import { StatusRendererComponent } from './status-renderer/status-renderer.component';
import { QuestionGroup, Question, UserAnswer } from '@app/models';
import { QuestionType, QuestionGraphType } from '@app/enums';
import { gridComparator } from '@app/utils';

@Component({
  selector: 'app-report-renderer',
  templateUrl: './report-renderer.component.html',
  styleUrls: ['./report-renderer.component.scss']
})
export class ReportRendererComponent implements OnInit, AfterViewInit {
  @ViewChild('reportBody', { static: false }) reportBody: ElementRef;
  @ViewChild('agGridTable', { static: false }) agGridTable: ElementRef;
  @Input() report;
  @Input() isForEmail;
  @Input() enableTooltip: boolean;
  @Input() parentRef;

  Math = Math;

  public rowData: {}[];
  public averageTime: string;
  public questionnaireGroups;
  public columnDefs: ColDef[];
  public questionnaireType = QuestionnaireType;
  public checkQuestionnaireType;
  public hideUsers: boolean = false;
  public showCloud: boolean = false;
  public hideEmptyResponses: boolean = false;
  public hideKeysAndAvg: boolean = false;
  public questionGraphType = QuestionGraphType;
  public gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      comparator: gridComparator
    },
    onGridReady: () => {
      this.gridOptions.api.sizeColumnsToFit();
      if ((this.report.hasOwnProperty('showDelegates') && this.report.showDelegates === null) ||
          (this.parentRef && this.parentRef.form && this.parentRef.form.controls['names'].value === false)) {
        this.hideUsers = true;
      } else {
        this.hideUsers = false;
      }
    },
  };
  frameworkComponents: any;
  public usersInfoMap: Map<number, {}> = new Map();
  public usersFieldKey: string;


  public group;
  public question;

  constructor(private wordCloudService: WordCloudService) {
    this.frameworkComponents = {
      statusRenderer: StatusRendererComponent
    };
  }

  ngOnInit() {
    this.usersFieldKey = this.report.participants ? 'participants' : 'delegates';
    this.rowData = this.createRowData(this.report);
    this.averageTime = this.calcAveragePoints(this.rowData, 'time');
    this.questionnaireGroups = this.report.questionnaire.groups;

    if ((this.report.hasOwnProperty('showCloud') && this.report.showCloud === 'on') ||
        (this.parentRef && this.parentRef.form && this.parentRef.form.controls['cloud'].value === true))
    {
      this.showCloud = true;
    } else {
      this.showCloud = false;
    }

    if ((this.report.hasOwnProperty('hideEmptyResponses') && this.report.hideEmptyResponses === 'on') ||
        (this.parentRef && this.parentRef.form && this.parentRef.form.controls['hide_empty'].value === true))
    {
      this.hideEmptyResponses = true;
    } else {
      this.hideEmptyResponses = false;
    }

    if ((this.report.hasOwnProperty('hideKeysAndAvg') && this.report.hideKeysAndAvg === 'on') ||
        (this.parentRef && this.parentRef.form && this.parentRef.form.controls['hideKeysAndAvg']
        && this.parentRef.form.controls['hideKeysAndAvg'].value === true))
    {
      this.hideKeysAndAvg = true;
    } else {
      this.hideKeysAndAvg = false;
    }

    this.columnDefs = this.createColumnDefs(this.report);
    this.createUserInfoMap();
    this.checkType(this.report);
  }

  ngAfterViewInit() {
    if ((this.report.hasOwnProperty('showCloud') && this.report.showCloud === 'on') ||
        (this.parentRef && this.parentRef.form && this.parentRef.form.controls['cloud'].value === true))
    {
      this.drawWordCloud();
    }
  }

  /**
   * Draws word cloud with words from answers on specific (cloud) questions
   */
  private drawWordCloud() {
    this.questionnaireGroups.forEach((group: QuestionGroup) => {
      group.questions.forEach((question: Question) => {
        if (question.is_cloud && question.answers) {
          let answers = '';
          question.answers.forEach((answer: UserAnswer) => {
            answers += answer.comment + '. ';
          });
          const svg: d3.Selection<SVGElement> = d3.select('#cloud_' + question.id);
          this.wordCloudService.drawWordCloud(answers, svg);
          if (this.parentRef && this.parentRef.registerGraph) {
            this.parentRef.registerGraph({svgElement: svg._groups[0][0], id: 'cloud_' + question.id});
          }
        }
      });
    });
  }

  /**
   * If "Price Increase Assessment" returns true
   */
  public getIsFaces() {
    if (this.report && this.report.questionnaire && this.report.questionnaire.id === 124) {
      return true;
    }
    return false;
  }

  public showScores(question): boolean {
    return this.checkQuestionnaireType === QuestionnaireType.ASSESSMENT && question &&
      (question.maxScore);
  }

  /**
   * function do calculate average number by some field;
   * input array and field which will calculate average number;
   * return average number of field values;
   * @param delegates
   * @param field
   * @returns {string}
   */
  private calcAveragePoints(delegates, field): string {
    let averagePoints = 0;
    let splitTimeAndMins = [];
    delegates.forEach(item => {
      if (!item[field]) {
        splitTimeAndMins[0] = 0;
      } else {
        item[field] = item[field].toString();
        splitTimeAndMins = item[field].split(' ');
      }
      averagePoints += parseFloat(splitTimeAndMins[0]);
    });
    averagePoints = averagePoints / delegates.length;
    //return field === 'time' ? averagePoints.toFixed(1) : averagePoints.toFixed(1);
    return (Math.round(averagePoints * 10) / 10).toString();
  }

  /**
   * function-handler to create special array (row data) to AG-Grid
   * array must be passed to ag grid
   * array includes delegates-objects to AG GRid
   * return array of objects
   * @param report
   * @param usersArr
   * @returns {any[]}
   */
  private createRowData(report): any[] {
    return this.report[this.usersFieldKey].map((item) => {
      let userInfo;
      this.usersFieldKey === 'delegates' ? userInfo = formatUserInfo(item.user) : userInfo = formatUserInfo(item);

      let time = item.time ? item.time + ' mins' : 0;

      if (report.questionnaire.questionnaireType === QuestionnaireType.FEEDBACK) {
        return {
          userInfo: userInfo,
          time: time,
          score: item.score ? item.score : 0,
          attempts: item.attempts
        };
      } else if (report.questionnaire.questionnaireType === QuestionnaireType.ASSESSMENT) {
        return {
          userInfo: userInfo,
          time: time,
          score: item.score ? item.score + ' %' : 0,
          attempts: item.attempts
        };
      } else {
        return {
          userInfo: userInfo,
          time: time,
          attempts: item.attempts
        };
      }
    });
  }

  /**
   * function-handler to create array
   * array must be pass to AG-Grid
   * array includes configure-objects to AG GRid
   * Object's own property ( headerName, field, width, cellStyle)
   * also check what type of questionnaire type
   * return array
   * @param report
   * @returns {ColDef[]}
   */
  private createColumnDefs(report): ColDef[] {
    let columns: ColDef[];
    columns = [
      {
        headerName: 'Participants: ' + this.rowData.length,
        field: 'userInfo',
        cellStyle: {'font-size': '13px', 'font-style': 'Arial'},
        width: undefined
      }
    ];

    if (!this.hideKeysAndAvg) {
      columns.push({
        width: 180,
        suppressSizeToFit: true,
        headerName: 'Avg Time: ' + this.averageTime + ' mins',
        field: 'time',
        cellStyle: {
          'font-size': '13px', 'font-style': 'Arial'
        },
        comparator: function (a, b) {
          if (!a) a = 0;
          if (!b) b = 0;
          a = parseFloat(a);
          b = parseFloat(b);
          return a - b;
        },
        cellRenderer: 'statusRenderer',
        cellClassRules: {'overflow-unset': () => true}
      });


      switch (report.questionnaire.questionnaireType) {
        case QuestionnaireType.FEEDBACK: {
          columns.push({
            width: 180,
            suppressSizeToFit: true,
            headerName: 'Avg Score: ' + this.calcAveragePoints(this.rowData, 'score'),
            field: 'score',
            cellStyle: {'font-size': '13px', 'font-style': 'Arial'},
            comparator: function (a, b) {
              if (!a) a = 0;
              if (!b) b = 0;
              return a - b;
            },
            sort: 'desc'
          });
          break;
        }
        case QuestionnaireType.PROFILE: {
          columns[1].sort = 'asc';
          break;
        }
        case QuestionnaireType.ASSESSMENT: {
          columns.push({
            width: 180,
            suppressSizeToFit: true,
            headerName: 'Avg Score: ' + this.calcAveragePoints(this.rowData, 'score') + ' %',
            field: 'score',
            cellStyle: {'font-size': '13px', 'font-style': 'Arial'},
            comparator: function (a, b) {
              if (!a) a = '0 %';
              if (!b) b = '0 %';
              return parseFloat(a.replace('%', '')) - parseFloat(b.replace('%', ''));
            },
            sort: 'desc'
          });
          break;
        }
      }
    }
    return columns;
  }

  /**
   * create js Map object;
   * create relation ships between user id and User obj
   * Map object keys equal to  delegates ID
   * Map object values equal to delegate object ( name, lastName, job)
   */
  private createUserInfoMap(): void {
    this.report[this.usersFieldKey].forEach(user => {
      user.questionnaireType = this.report.questionnaire.questionnaireType;
      this.usersInfoMap.set(user.id, user);
    });
    this.questionnaireGroups.forEach((group: QuestionGroup) => {
      group.questions.forEach((question: Question) => {
        if (question.type === QuestionType.NUMERIC) {
          question.title = question.title.replace(/{TOKEN CURRENCY}/g, 'USD');
        }
      });
    });
  }

  /**
   * function which is check What type of questionnaire incoming
   * @param report
   */
  private checkType(report): void {
    if (report.questionnaire.questionnaireType === QuestionnaireType.ASSESSMENT
    ) {
      this.checkQuestionnaireType = QuestionnaireType.ASSESSMENT;
    }
    if (report.questionnaire.questionnaireType === QuestionnaireType.FEEDBACK) {
      this.checkQuestionnaireType = QuestionnaireType.FEEDBACK;
    }
    if (report.questionnaire.questionnaireType === QuestionnaireType.PROFILE) {
      this.checkQuestionnaireType = QuestionnaireType.PROFILE;
    }
  }

  mathRoundInPercentage(a: number, b: number) {
    return Math.round((a / b ) * 100);
  }

}
