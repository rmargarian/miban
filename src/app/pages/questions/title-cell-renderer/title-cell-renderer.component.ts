import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Question } from '@app/models';

interface QuestionTooltipData {
  header: string;
  title: string;
}

@Component({
  selector: 'app-title-cell-renderer',
  templateUrl: './title-cell-renderer.component.html',
  styleUrls: ['./title-cell-renderer.component.scss']
})
export class TitleCellRendererComponent implements OnInit, ICellRendererAngularComp {

  params: any;
  headerName: string = '';
  title: string;
  type: string;
  quest_type_a: boolean;
  quest_type_p: boolean;
  quest_type_f: boolean;
  tooltipText: string;
  tooltipData: any;
  question: Question = {} as Question;

  constructor() {
  }

  ngOnInit() {

  }

  agInit(params: any): void {
    this.params = params;
    this.type = this.checkQuestionType(params.data.quest_type);
    this.question = params.data;
    this.setTableCellValue(params);
  }

  private setTableCellValue(params: any) {
    this.headerName = params.colDef.headerName;
    this.title = params.value;
    this.tooltipText = this.stripHtml(params.value);
    this.tooltipData = this.getDataTooltip(params.data);
  }

  private checkQuestionType(questionType: number): string {
    switch (questionType) {
      case 1 : {
        this.quest_type_a = true;
        return 'A ';
      }
      case 2 : {
        this.quest_type_p = true;
        return 'P ';
      }
      case 3 : {
        this.quest_type_f = true;
        return 'F ';
      }
    }
  }

  private stripHtml(title: string) {
    const temporalDivElement = document.createElement('div');
    temporalDivElement.innerHTML = title;
    return temporalDivElement.textContent || temporalDivElement.innerText || '';
  }

  /**
   * Calls parent method to delete question permanently.
   */
  delete() {
    this.params.context.componentParent.deletePermanently(this.question.id);
  }

  /**
   * Calls parent method to restore question.
   */
  restore() {
    this.params.context.componentParent.restoreQuestion(this.question.id);
  }

  private getDataTooltip(data: Question) {
    const tooltipValue = [];
    const questions_map = data.question_groups_questions_map;
    if (!questions_map) {
      return;
    }
    questions_map.forEach(quest_map => {
      const tooltipItem: QuestionTooltipData = {header: undefined, title: undefined};
      if (quest_map.question_group.title && quest_map.question_group.questionnaire) {
        tooltipItem.title = quest_map.question_group.title;
        tooltipItem.header = quest_map.question_group.questionnaire.title;
      }
      tooltipValue.push(tooltipItem);
    });
    return this.parseAsHtml(tooltipValue);

  }

  parseAsHtml(data) {
    let htmlString = '';
    data.forEach(item => {
      if (item.header || item.title) {
        htmlString += '<ul style="text-align: left; padding: 0px 20px;">' +
          '<span style="font-weight: bold">' + item.header + '</span>' + '<br>';
        htmlString += '<li>' + item.title + '</li>' + '</ul>';
      }
    });
    return document.createElement('div').innerHTML = htmlString;
  }

  refresh(): boolean {
    return false;
  }
}
