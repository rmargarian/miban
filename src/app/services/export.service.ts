import { Injectable } from '@angular/core';
import { QuestionType } from '@app/enums';
import { User, Questionnaire, Keys, UserAnswerOption } from '@app/models';
import {
  fromIsoDate,
  setAcronym,
  isColumnEmpty,
  exportFeedbacksParticipantsResponseToExcel,
  exportAssessmentParticipantsResponseToExcel,
  exportProfilesParticipantsResponseToExcel,
  checkIfNotOneStatusExists, createWorkBook, generateExelFile, addWorksheet
} from '@app/utils';
import {QuestionnaireStatus, ExportType} from '@app/enums';

interface ExportRow {
  [index: number]: { head: string; field: string; question: string; answer: string };
}

interface QuestGroup {
  info: {
    id: number;
    order_pos: number;
    questionnaire_id: number;
    title: string;
  };
  questions: any;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  headers: string[];

  constructor() {
  }

  /**
   * Configure excel file to export best negotiators
   * @param {any[]} multipleExportsArray
   */
  exportBestNegotiators(multipleExportsArray: any[]) {
    const workBook = createWorkBook();
    const titlesWorkSheets = [];
    multipleExportsArray.forEach((exportData) => {
      const workSheetTitle = exportData[0].company.title;
      titlesWorkSheets.push(workSheetTitle);
      addWorksheet(workBook, this.setHeadersBestNegotiators(exportData),
        this.setFieldsBestNegotiators(exportData), workSheetTitle, ExportType.BEST_NEGOTIATORS);
    });

    generateExelFile(workBook, 'Best Negotiators - ' + this.createDocumentTitle(titlesWorkSheets));
  }

  /**
   * Export to excel a detailed information about participants responses of some questionnaire
   * @param questionnairesData
   */
  exportParticipantsResponses(questionnairesData: any) {
    const excelRows = [];
    let keyTitles = [];
    let excelFields;
    switch (questionnairesData.questionnaireInfo.type) {
      case 1:
        excelFields = this.generateParticipantsResponsesExcelData(questionnairesData, 1);
        Array.prototype.push.apply(excelRows, excelFields);
        keyTitles = this.getKeyTitles(questionnairesData);
        exportAssessmentParticipantsResponseToExcel(
          excelRows, this.setExcelFileName('Participants Responses - ' + questionnairesData.questionnaireInfo.abbreviation, keyTitles));
        break;
      case 3:
        excelFields = this.generateParticipantsResponsesExcelData(questionnairesData, 3);
        Array.prototype.push.apply(excelRows, excelFields);
        keyTitles = this.getKeyTitles(questionnairesData);
        exportFeedbacksParticipantsResponseToExcel(
          excelRows, this.setExcelFileName('Participants Responses -' + questionnairesData.questionnaireInfo.abbreviation, keyTitles));
        break;
      case 2:
        excelFields = this.generateParticipantsResponsesExcelData(questionnairesData, 2);
        Array.prototype.push.apply(excelRows, excelFields);
        keyTitles = this.getKeyTitles(questionnairesData);
        exportProfilesParticipantsResponseToExcel(
          excelRows, this.setExcelFileName('Participants Responses - ' + questionnairesData.questionnaireInfo.abbreviation, keyTitles));
        break;
      default:
        break;
    }
  }

  private setExcelFileName(startSrt: string, keyTitles: string[]): string {
    let returnedSrt = startSrt + ' - ';
    for (let i = 0; i < keyTitles.length; i++) {
      returnedSrt += i + 1 === keyTitles.length ? keyTitles[i] : keyTitles[i] + ',';
    }
    return returnedSrt;
  }

  private getKeyTitles(data: any[]): string[] {
    const keyTitles = [];
    data['users'].forEach(user => {
      if (user.info && user.info.company && user.info.company.title) {
        if (!keyTitles.includes(user.info.company.title)) {
          keyTitles.push(user.info.company.title);
        }
      }
    });
    return keyTitles;
  }

  /**
   * Configure table data and export it to excel file
   * @param companyQuests (Questionnaires array)
   * @param users (Users data array)
   * @param titlesWorkSheets (Users data array)
   * @param key (Selected key)
   */
  exportParticipantsSummary(companyQuests: any[], users: any[], titlesWorkSheets: any[], key: Keys) {

    const workBook = createWorkBook();
    const rowsData = this.excludeFieldsByKey(users, key);
    rowsData.forEach((rowData: any) => {
      rowData.sort((a, b) => a.first_name.localeCompare(b.first_name));
    });
    rowsData.forEach((rowData, i) => {
      addWorksheet(workBook, this.setHeadersSummary(companyQuests, rowData),
        this.setFieldsSummary(companyQuests, rowData), titlesWorkSheets[i], ExportType.SUMMARY);
    });
    generateExelFile(workBook, 'Participants Summary - ' + this.createDocumentTitle(titlesWorkSheets));
  }

  /**
   * Create headers for Participants Summary table
   * @param companyQuests (Questionnaire array)
   */
  setHeadersSummary(companyQuests: Questionnaire[], rowData: User[]) {
    this.headers = [
      'First Name',
      'Last Name',
      'Email',
    ];
    companyQuests.forEach((value: any) => {
      if (checkIfNotOneStatusExists(value.id, rowData)) {
        return;
      }
      let acronym = value.abbreviation;
      if (!acronym) {
        acronym = setAcronym(value.title);
      }
      this.headers.push(acronym);
    });
    if (rowData[0].hasOwnProperty('p_location') && !isColumnEmpty(rowData, 'p_location')) {
      this.headers.push('Location');
    }
    if (rowData[0].hasOwnProperty('p_date') && !isColumnEmpty(rowData, 'p_date')) {
      this.headers.push('Date');
    }
    if (rowData[0].hasOwnProperty('career') && !isColumnEmpty(rowData, 'career.name')) {
      this.headers.push('Career Category');
    }
    if (rowData[0].hasOwnProperty('job_title') && !isColumnEmpty(rowData, 'job_title')) {
      this.headers.push('Job Title');
    }
    if (rowData[0].hasOwnProperty('manager_name') && !isColumnEmpty(rowData, 'manager_name')) {
      this.headers.push('Manager Name');
    }
    if (rowData[0].hasOwnProperty('department') && !isColumnEmpty(rowData, 'department')) {
      this.headers.push('Department');
    }
    if (rowData[0].hasOwnProperty('country') && !isColumnEmpty(rowData, 'country.name')) {
      this.headers.push('Country');
    }
    if (rowData[0].hasOwnProperty('state_name') && !isColumnEmpty(rowData, 'state_name')) {
      this.headers.push('State');
    }
    if (rowData[0].hasOwnProperty('city') && !isColumnEmpty(rowData, 'city')) {
      this.headers.push('City');
    }

    if (!isColumnEmpty(rowData, 'curr.currency')) {
      this.headers.push('Currency');
    }
    if (!isColumnEmpty(rowData, 'notes')) {
      this.headers.push('Notes');
    }
    if (!isColumnEmpty(rowData, 'last_attempt')) {
      this.headers.push('L Login');
    }
    return this.headers;
  }

  /**
   * Excludes fields by settings in key
   * @param rowsData (User[])
   * @param key (Selected Key)
   */
  private excludeFieldsByKey(rowsData: any[], company: Keys) {
    const users =  JSON.parse(JSON.stringify(rowsData));

    users.forEach((rowData: any) => {
      rowData.forEach((user: User) => {
        if (!company.show_city) {
          delete user.city;
        }
        if (!company.show_state) {
          delete user.state_name;
        }
        if (!company.show_career_category) {
          delete user.career;
        }
        if (!company.show_manager_name) {
          delete user.manager_name;
        }
        if (!company.show_dept) {
          delete user.department;
        }
        if (!company.show_country) {
          delete user.country;
        }
        if (!company.show_job_title) {
          delete user.job_title;
        }
      });
    });

    return users;
  }

  /**
   * Create headers for Best Negotiators table
   * @param rowData
   * @returns {string[]}
   */
  setHeadersBestNegotiators(rowData): string[] {
    this.headers = [];
    this.headers.push('Name');
    this.headers.push('Family Name');
    if (rowData[0].hasOwnProperty('job_title')) {
      this.headers.push('Job Title');
    }
    if (rowData[0].hasOwnProperty('country')) {
      this.headers.push('Country');
    }
    if (rowData[0].hasOwnProperty('state_name')) {
      this.headers.push('State');
    }
    if (rowData[0].hasOwnProperty('city')) {
      this.headers.push('City');
    }
    if (rowData[0].hasOwnProperty('department')) {
      this.headers.push('Department');
    }

    if (rowData[0].hasOwnProperty('size')) { this.headers.push('Size'); }
    if (rowData[0].hasOwnProperty('teamNeg')) { this.headers.push('Team Neg'); }
    if (rowData[0].hasOwnProperty('teamPrep')) { this.headers.push('Team Prep'); }
    if (rowData[0].hasOwnProperty('length')) { this.headers.push('Length'); }
    if (rowData[0].hasOwnProperty('flexibility')) { this.headers.push('Flexibility'); }
    if (rowData[0].hasOwnProperty('prepTime')) { this.headers.push('Prep Time'); }
    if (rowData[0].hasOwnProperty('nameRank')) { this.headers.push('Prep Rank'); }
    if (rowData[0].hasOwnProperty('review')) { this.headers.push('Review'); }
    if (rowData[0].hasOwnProperty('outcome')) { this.headers.push('Outcomes'); }
    if (rowData[0].hasOwnProperty('course')) { this.headers.push('Courses'); }
    if (rowData[0].hasOwnProperty('book')) { this.headers.push('Books'); }

    this.headers.push('Currency');
    this.headers.push('L Login');

    return this.headers;
  }

  /**
   * Create fields for Participants Summary table
   * @param companyQuests (Questionnaires array)
   * @param rowData (Users data array)
   */
  setFieldsSummary(companyQuests: Questionnaire[], rowData: User[]) {
    const exportData = [];
    rowData.forEach((user: User) => {
      const row = [{field: user.first_name}, {field: user.last_name}, {field: user.email}];
      companyQuests.forEach((quest: Questionnaire) => {
        if (checkIfNotOneStatusExists(quest.id, rowData)) {
          return;
        }
        let status = 'n/a';
        const attempts = (<any>user).attempts.filter((a: any) => a.questionnaire_id === quest.id);
        let checked = true;
        attempts.forEach((attempt, i) => {
          if (i === 0) {
            status = this.attemptStatusToSting(attempt.status, attempt.answers.length);
          } else {
            status += ',';
            status += this.attemptStatusToSting(attempt.status, attempt.answers.length);
          }

          (<any>user).u_q_contact.forEach(contact => {
            if (contact.id_questionnaire === attempt.questionnaire_id
              && contact.user_id === attempt.user_id) {
              checked = contact.contact === '1' ? true : false;
            }
          });
        });

        row.push(<any>{field: status, checked: checked, isStatus: true, attempts: attempts.length});
      });

      if (user.hasOwnProperty('p_location') && !isColumnEmpty(rowData, 'p_location')) {
        row.push({field: user.p_location || ''});
      }
      if (user.hasOwnProperty('p_date') && !isColumnEmpty(rowData, 'p_date')) {
        row.push({field: user.p_date ? this.dateFormatter(user.p_date).toString() : ''});
      }
      if ((<any>user).hasOwnProperty('career') && !isColumnEmpty(rowData, 'career.name')) {
        row.push({field: (<any>user).career ? (<any>user).career.name : ''});
      }
      if (user.hasOwnProperty('job_title') && !isColumnEmpty(rowData, 'job_title')) {
        row.push({field: user.job_title || ''});
      }
      if (user.hasOwnProperty('manager_name') && !isColumnEmpty(rowData, 'manager_name')) {
        row.push({field: user.manager_name || ''});
      }
      if (user.hasOwnProperty('department') && !isColumnEmpty(rowData, 'department')) {
        row.push({field: user.department || ''});
      }
      if ((<any>user).hasOwnProperty('country') && !isColumnEmpty(rowData, 'country.name')) {
        row.push({field: (<any>user).country ? (<any>user).country.name : ''});
      }
      if (user.hasOwnProperty('state_name') && !isColumnEmpty(rowData, 'state_name')) {
        row.push({field: user.state_name || ''});
      }
      if (user.hasOwnProperty('city') && !isColumnEmpty(rowData, 'city')) {
        row.push({field: user.city || ''});
      }

      if (!isColumnEmpty(rowData, 'curr.currency')) {
        row.push({field: (<any>user).curr ? (<any>user).curr.currency : ''});
      }
      if (!isColumnEmpty(rowData, 'notes')) {
        row.push({field: user.notes || ''});
      }
      if (!isColumnEmpty(rowData, 'last_attempt')) {
        row.push({field: this.dateFormatter(user.last_attempt)});
      }

      exportData.push(row);
    });
    return exportData;
  }

  /**
   * Format attempt status to string representation
   * @param {number} status_num
   * @param {number} answers
   * @returns {string}
   */
  attemptStatusToSting(status_num: number, answers: number): string {
    let status = 'n/a';
    switch (status_num) {
      case QuestionnaireStatus.OPEN:
        status = 'open';
        break;
      case QuestionnaireStatus.REOPENED:
        status = 'reopened';
        break;
      case QuestionnaireStatus.STARTED_REGISTER:
        status = answers > 0 ? 'started' : 'register';
        break;
      case QuestionnaireStatus.COMPLETED:
        status = 'completed';
        break;
      case QuestionnaireStatus.TIMEOUT:
        status = 'timedout';
        break;
      default:
        status = '';
        break;
    }

    return status;
  }

  /**
   * Create fields for Best Negotiators table
   * @param rowData (Users data array)
   */
  setFieldsBestNegotiators(rowData: any): any[] {
    const exportData = [];
    rowData.forEach((user: any) => {
      const row = [];
      for (const item in user) {
        if (user.hasOwnProperty(item)) {
          if (!user[item]) {
            user[item] = '';
          }
          if (item === 'attempts') {
            if (user[item].length === 0) {
              user[item] = [{last_activity_date: null}];
            }
          }
        }
      }

      row.push({field: user.first_name});
      row.push({field: user.last_name});

      if (user.hasOwnProperty('job_title')) {
        row.push({field: user.job_title});
      }
      if (user.hasOwnProperty('country')) {
        row.push({field: user.country.name ? user.country.name : ''});
      }
      if (user.hasOwnProperty('state_name')) {
        row.push({field: user.state_name});
      }
      if (user.hasOwnProperty('city')) {
        row.push({field: user.city});
      }
      if (user.hasOwnProperty('department')) {
        row.push({field: user.department});
      }

      if (rowData[0].hasOwnProperty('size')) { row.push({field: user.size}); }
      if (rowData[0].hasOwnProperty('teamNeg')) { row.push({field: user.teamNeg ? user.teamNeg.title : ''}); }
      if (rowData[0].hasOwnProperty('teamPrep')) { row.push({field: user.teamPrep ? user.teamPrep.title : ''}); }
      if (rowData[0].hasOwnProperty('length')) { row.push({field: user.length ? user.length.title : ''}); }
      if (rowData[0].hasOwnProperty('flexibility')) { row.push({field: user.flexibility ? user.flexibility.title : ''}); }
      if (rowData[0].hasOwnProperty('prepTime')) { row.push({field: user.prepTime ? user.prepTime.title : ''}); }
      if (rowData[0].hasOwnProperty('nameRank')) { row.push({field: user.nameRank ? user.nameRank.title : ''}); }
      if (rowData[0].hasOwnProperty('review')) { row.push({field: user.review ? user.review.title : ''}); }
      if (rowData[0].hasOwnProperty('outcome')) { row.push({field: user.outcome}); }
      if (rowData[0].hasOwnProperty('course')) { row.push({field: user.course}); }
      if (rowData[0].hasOwnProperty('book')) { row.push({field: user.book}); }

      row.push({field: user.curr.currency ? user.curr.currency : ''});
      row.push({field: this.dateFormatter(user.attempts[0].last_activity_date)});
      exportData.push(row);
    });
    return exportData;
  }

  generateParticipantsResponsesExcelData(rowData: any, type: number) {
    let exportData;
    const exportByUsers = [];
    if (rowData.users && rowData.questionnaireInfo) {
      rowData.users.forEach((user: any) => {
        exportData = [];
        exportData.push({
          label: 'Name',
          user_info: user.info.first_name + ' ' + user.info.last_name,
          question: '',
          bold: true,
          main_info: true,
        });
        if (user.info.hasOwnProperty('industry_sector')) {
          exportData.push({
            label: 'Industry sector',
            user_info: user.info.industry_sector ? user.info.industry_sector : '',
            question: '',
            main_info: true,
            bold: true
          });
        }
        if (user.info.hasOwnProperty('career')) {
          exportData.push({
            label: 'Career Category',
            user_info: user.info.career ? user.info.career.name : '',
            question: '',
            main_info: true,
            bold: true
          });
        }
        if (user.info.hasOwnProperty('p_date')) {
          exportData.push({
            label: 'Training Date',
            user_info: user.info.p_date ? this.dateFormatter(user.info.p_date) : '',
            question: '',
            main_info: true,
            bold: true
          });
        }
        if (user.info.hasOwnProperty('training_course')) {
          exportData.push({
            label: 'Training Course',
            user_info: user.info.training_course ? user.info.training_course.name : '',
            question: '',
            main_info: true,
            bold: true
          });
        }
        if (user.info.hasOwnProperty('country')) {
          exportData.push({
            label: 'Country',
            user_info: user.info.country ? user.info.country.name : '',
            question: '',
            main_info: true,
            bold: true
          });
        }
        if (user.info.hasOwnProperty('state_name')) {
          exportData.push({
            label: 'State',
            user_info: user.info.state_name ? user.info.state_name : '',
            question: '',
            main_info: true,
            bold: true
          });
        }
        if (user.info.hasOwnProperty('city')) {
          exportData.push({
            label: 'City',
            user_info: user.info.city ? user.info.city : '',
            question: '',
            main_info: true,
            bold: true
          });
        }
        if (user.info.hasOwnProperty('p_location')) {
          exportData.push({
            label: 'Location',
            user_info: user.info.p_location ? user.info.p_location : '',
            question: '',
            main_info: true,
            bold: true
          });
        }
        if (user.info.hasOwnProperty('department')) {
          exportData.push({
            label: 'Departament',
            user_info: user.info.department ? user.info.department : '',
            question: '',
            main_info: true,
            bold: true
          });
        }
        if (user.info.hasOwnProperty('job_title')) {
          exportData.push({
            label: 'Job Title',
            user_info: user.info.job_title ? user.info.job_title : '',
            question: '',
            main_info: true,
            bold: true
          });
        }
        if (user.info.hasOwnProperty('manager_name')) {
          exportData.push({
            label: 'Manager',
            user_info: user.info.manager_name ? user.info.manager_name : '',
            question: '',
            main_info: true,
            bold: true
          });
        }
        exportData.push({
          label: 'Email',
          user_info: user.info.email ? user.info.email : '',
          question: '',
          bold: true,
          main_info: true,
        });
        exportData.push({
          label: 'Currency',
          user_info: user.info.curr ? user.info.curr.currency : '',
          question: '',
          main_info: true,
          bold: true
        });
        exportData.push({
          label: 'Organization',
          user_info: user.info.company ? user.info.company.title : '',
          question: '',
          bold: true,
          main_info: true
        });
        exportData.push({
          label: 'Key',
          user_info: user.info.company ? user.info.company.company_key : '',
          question: '',
          bold: true,
          main_info: true,
        });
        exportData.push({label: '', user_info: '', question: '', bold: true, main_info: true});
        exportData.push({
          label: 'Finish Date',
          user_info: user.attempt ? this.getFinishDate(user.attempt) : '',
          question: '',
          bold: true,
          main_info: true
        });
        exportData.push({
          label: 'Profiles/Assessments/Feedbacks',
          user_info: rowData.questionnaireInfo.title,
          question: '',
          bold: true,
          main_info: true,
        });
        exportData.push({
          label: 'Status',
          user_info: user.attempt ? this.transformStatus(user.attempt.status) : '',
          question: '',
          bold: true,
          main_info: true
        });
        exportData.push({
          label: 'Time Elapsed',
          user_info: user.attempt ? this.getUserTimeElapsed(user.attempt) : '',
          question: '',
          bold: true,
          main_info: true
        });

        exportData.push({
          label: 'Title',
          user_info: rowData.questionnaireInfo.abbreviation,
          question: '',
          bold: true,
          main_info: true
        });
        if (type === 1) {
          exportData.push({
            label: 'Total: ',
            user_info: this.getTotalScore(user.questionGroups),
            bold: true,
            main_info: true
          });
          exportData.push({
            label: 'Percentage: ',
            user_info: this.getPercentage(this.getTotalScore(user.questionGroups)) + '%',
            bold: true,
            main_info: true
          });
        }
        exportData.push({label: '', user_info: '', question: ''});


        switch (type) {
          case 1:
            exportByUsers.push(exportData.concat(this.getAssessmentsQuestItems(user.questionGroups)));
            break;
          case 3:
            exportByUsers.push(exportData.concat(this.getFeedbacksQuestItems(user.questionGroups)));
            break;
          case 2:
            const userCurrency = user.info.curr ? user.info.curr.currency : '';
            exportByUsers.push(exportData.concat(this.getProfilesQuestItems(userCurrency, user.questionGroups)));
            break;
        }
      });
    }
    return exportByUsers;
  }

  /**
   * Calculate and format total score of a passed questionnaire by a participant
   * @param {QuestGroup[]} questGroups
   * @returns {string}
   */
  getTotalScore(questGroups: QuestGroup[]): string {
    const totalArray = [];
    questGroups.forEach(group => {
      group.questions.forEach(question => {
        //totalArray.push(this.getQuestionScoresRate(question));
        if (question.answer && question.answer.answer_options.length > 0 &&
          question.options && question.options.length > 0) {
          const sc = this.getCheckedScores(question.options, question.answer.answer_options) + '/' + this.getAllScores(question, true);
          totalArray.push(sc);
        } else {
          const sc = 0 + '/' + this.getAllScores(question, true);
          totalArray.push(sc);
        }
      });
    });
    return this.parseTotalScore(totalArray);
  }

  /**
   * Helper function to calculate and format total score of a passed questionnaire by a participant
   * @param totalArray
   * @returns {string}
   */
  parseTotalScore(totalArray): string {
    const parsedArr = [];
    let firstScore = 0;
    let secondScore = 0;
    if (totalArray.length > 0) {
      totalArray.forEach(item => {
        parsedArr.push(item.split('/'));
      });

      parsedArr.forEach(item => {
        firstScore += parseFloat(item[0]);
        secondScore += parseFloat(item[1]);
      });
      return firstScore + '/' + secondScore;
    }
  }

  /**
   * Format score to percentage value
   * @param totalScore
   * @returns {number}
   */
  getPercentage(totalScore) {
    const splitedTotalScore = totalScore.split('/');
    return Math.round((parseFloat(splitedTotalScore[0]) / parseFloat(splitedTotalScore[1])) * 100);
  }

  /**
   * Generate export data for Participant responses export for assessment questionnaire type
   * @param {QuestGroup[]} questGroups
   * @returns {Array}
   */
  getAssessmentsQuestItems(questGroups: QuestGroup[]): any[] {
    const rowsToExport = [];
    let counter = 0;

    questGroups.forEach(group => {
      if (group.questions.length > 0) {
        const info = group.info.title.toUpperCase();
        rowsToExport.push({label: '', user_info: info, bold: ''});
      }

      group.questions.forEach(question => {
        counter++;
        const questTitle = counter + '. ' + '<i>' + question.info.title + '</i>';
        rowsToExport.push({
          label: this.getQuestionScoresRate(question),
          user_info: questTitle,
          bold: '',
          italic: true,
          questScore: true
        });

        /**If question.info.type !== 5 needed to check if TEXT question has options:
         * e.g. if Question with options was changed on TEXT question, and options weren't
         * deleted from DB (in old PFA).
         * Then the 'else' block should be triggered
         */
        if (question.options && question.options.length && question.info.type !== QuestionType.TEXT) {
          question.options.forEach(option => {
            let optionAnswer;
            if (question.answer && question.answer.answer_options.length > 0) {
              optionAnswer = this.getQuestionOptionAnswer(option, question.answer['answer_options']);
            }

            if (optionAnswer) {
              rowsToExport.push({
                label: '',
                user_info: option.score,
                question: this.htmlToString(option.title),
                checked: true,
                withScore: true
              });
            } else {
              rowsToExport.push({
                label: '',
                user_info: option.score,
                question: this.htmlToString(option.title),
                withScore: true
              });
            }
          });
          if (question.answer && question.answer.comment) {
            rowsToExport.push({
              label: '',
              user_info: question.answer.comment,
              itsComment: true
            });
          }
        } else {
          if (question.answer) {
            rowsToExport.push({
              label: '',
              user_info: '',
              question: question.answer.comment ? question.answer.comment : '',
              checked: true,
              itsComment: true
            });
          }
        }
        rowsToExport.push({label: '', user_info: ''});
      });
    });
    return rowsToExport;
  }

  /**
   * Calculate and format question score rate
   * @param question
   * @returns {string}
   */
  getQuestionScoresRate(question) {
    if (question.answer && question.answer.answer_options.length > 0 &&
      question.options && question.options.length > 0) {
      return this.getCheckedScores(question.options, question.answer.answer_options) + '/' + this.getAllScores(question);
    } else {
      return 0 + '/' + this.getAllScores(question);
    }
  }

  /**
   * Sum scores of picked answers by user
   * @param options
   * @param answer_options
   * @returns {number}
   */
  getCheckedScores(options, answer_options) {
    let checkedScore = 0;
    if (answer_options && answer_options.length > 0 && options && options.length > 0) {
      answer_options.forEach(answer_opt => {
        if (answer_opt['question_answer_option'] && options.length > 0) {
          const questionAnswerOption = options.find((option) => option.id === answer_opt['question_answer_options_id']);
          checkedScore += questionAnswerOption.score;
        } else {
          checkedScore = 0;
        }
      });
    } else {
      checkedScore = 0;
    }
    return checkedScore;
  }

  /**
   * Sum all scores
   * @param question
   * @returns {number}
   */
  getAllScores(question, forScore = false) {
    let result = 0;
    if (question.info.is_bonus === 1 && forScore) {
      result = result;
    } else if (question.options.length && question.options.length > 0) {
      /**For MULTIPLE_CHOISE_SINGLE_OPTION returns max option */
      if (question.info.type === QuestionType.MULTIPLE_CHOISE_SINGLE_OPTION) {
        result = question.options[0].score;
        question.options.forEach(option => {
          if (option.score > result) {
            result = option.score;
          }
        });
      }
      /**For MULTIPLE_CHOISE_MULTI_OPTIONS and others calculate all positive values of options */
      else {
        question.options.forEach(option => {
          option.score < 0 ? result = result : result += option.score;
        });
      }
    } else {
      result = 0;
    }
    return result;
  }

  /**
   * Generate export data for Participant responses export for profiles questionnaire type
   * @param {QuestGroup[]} questGroups
   * @returns {Array}
   */
  getProfilesQuestItems(userCurrency: string, questGroups: QuestGroup[]): any[] {
    const rowsToExport = [];
    let counter = 0;

    questGroups.forEach(group => {
      if (group.questions.length > 0) {
        const info = group.info.title.toUpperCase();
        rowsToExport.push({label: '', user_info: info, bold: ''});
      }

      group.questions.forEach(question => {
        question.info.title = question.info.title.replace(/{TOKEN CURRENCY}/g, userCurrency);
        counter++;
        const questTitle = counter + '. ' + '<i>' + question.info.title + '</i>';
        rowsToExport.push({
          label: '',
          user_info: questTitle,
          italic: ''
        });

        if (question.answer && question.answer.answer_options
          && question.answer.answer_options.length > 0 && question.options) {
          question.options.forEach(option => {
            if (question.answer) {
              if (question.info.type === QuestionType.ORDER) {
                rowsToExport.push(this.checkQuestTypeAndSetPositionCounter(question, option));
              } else {
                const optionAnswer = this.getQuestionOptionAnswer(option, question.answer['answer_options']);
                if (optionAnswer) {
                  if (question.info.type === QuestionType.ARRAY) {
                    if (optionAnswer['label_set_option']) {
                      rowsToExport.push({
                        label: '',
                        user_info: option.score ? option.score : '',
                        question: this.htmlToString(option.title),
                        withScore: true,
                        labelSet: optionAnswer['label_set_option'].value
                      });
                    }
                  } else {
                    rowsToExport.push({
                      label: '',
                      user_info: option.score ? option.score : '',
                      question: this.htmlToString(option.title),
                      checked: true,
                      withScore: true
                    });
                  }
                } else {
                  rowsToExport.push({
                    label: '',
                    user_info: option.score ? option.score : '',
                    question: option.title,
                    withScore: true,
                  });
                }
              }
            } else {
              rowsToExport.push({
                label: '',
                user_info: '',
                question: option.title,
                withScore: true,
              });
            }
          });
          if (question.answer && question.answer.comment && question.answer.comment.length > 0) {
            rowsToExport.push({
              label: 'Participant\'s comment: ',
              user_info: '',
              question: question.answer.comment,
              itsComment: true
            });
          }
        } else {
          if (question.answer && question.answer.answer && question.answer.answer.length > 0) {
            rowsToExport.push({
              label: '',
              user_info: '',
              question: question.answer.answer + ' '
            });
          }
          if (question.answer && question.answer.comment) {
            rowsToExport.push({
              label: '',
              user_info: '',
              question: question.answer.comment,
              checked: true,
              itsComment: true
            });
          }
        }
        rowsToExport.push({label: '', user_info: ''});
      });
    });
    return rowsToExport;
  }

  /**
   * Generate export data for Participant responses export for feedback questionnaire type
   * @param {QuestGroup[]} questGroups
   * @returns {Array}
   */
  getFeedbacksQuestItems(questGroups: QuestGroup[]): any[] {
    const rowsToExport = [];
    let counter = 0;

    questGroups.forEach(group => {
      if (group.questions.length > 0) {
        const info = group.info.title.toUpperCase();
        rowsToExport.push({label: '', user_info: info, bold: ''});
      }

      group.questions.forEach(question => {
        counter++;
        const questTitle = counter + '. ' + '<i>' + question.info.title + '</i>';
        rowsToExport.push({
          label: '',
          user_info: questTitle,
          italic: '',
          question: '',
          score: question.answer ? this.getAverageScore(question.answer) : '',
          averageScore: true
        });

        if (question.answer && question.answer.answer_options.length) {
          if (question.answer.answer_options.length > 0) {
            question.answer.answer_options.forEach(answer_option => {
              if (answer_option.question_answer_option) {
                rowsToExport.push({
                  label: '',
                  user_info: '',
                  wrapText: '',
                  question: answer_option.question_answer_option.title ? this.htmlToString(answer_option.question_answer_option.title) : '',
                  score: answer_option.label_set_option && answer_option.label_set_option.value ? answer_option.label_set_option.value : ''
                });
              }
            });
          } else {
            rowsToExport.push({
              label: '',
              user_info: '',
              wrapText: true,
              question: question.answer ? question.answer.comment ? question.answer.comment : '' : '',
              checked: true
            });
          }
        } else {
          rowsToExport.push({
            label: '',
            user_info: '',
            wrapText: true,
            question: question.answer ? question.answer.comment ? question.answer.comment : '' : '',
            checked: true
          });
        }
      });
      rowsToExport.push({label: '', user_info: '', question: ''});
      rowsToExport.push({label: '', user_info: '', question: ''});
    });
    return rowsToExport;
  }

  /**
   * Calculate answer average score
   * @param answer
   * @returns {any}
   */
  getAverageScore(answer) {
    let answerOptions;
    if (answer && answer.answer_options && answer.answer_options.length !== 0) {
      answerOptions = answer.answer_options;
    } else {
      return '';
    }

    let optionsValue = 0;
    let answered = 0;
    for (let i = 0; i < answerOptions.length; i++) {
      if (answerOptions[i] && answerOptions[i].label_set_option) {
        optionsValue += parseFloat(answerOptions[i].label_set_option.value);
        answered++;
      }
    }
    return (optionsValue / answered).toFixed(1);
  }

  /**
   * Get question option answer by question option id
   * @param questionOption
   * @param {any[]} answerOptions
   * @returns {any}
   */
  private getQuestionOptionAnswer(questionOption: any, answerOptions: any[]) {
    if (questionOption) {
      return answerOptions.find(answerOption => {
        return answerOption['question_answer_options_id'] === questionOption.id;
      });
    }
  }

  /**
   * Format end date of the attempt
   * @param attempt
   * @returns {string | string}
   */
  private getFinishDate(attempt: any) {
    return attempt.end_date ? this.dateFormatter(attempt.end_date) : '';
  }

  /**
   * Format elapsed time
   * @param attempt
   * @returns {string}
   */
  private getUserTimeElapsed(attempt: any): string {
    if (!attempt.passed_time) return '';

    return attempt.passed_time > 60 ? Math.ceil(attempt.passed_time / 60) + ' min' : attempt.passed_time + ' sec';
  }

  /**
   * Format attempt status to export
   * @param {number} status
   * @returns {string}
   */
  private transformStatus(status?: number): string {
    switch (status) {
      case 0 :
      case 1 :
        return 'Open';
      case 2:
        return 'Started';
      case 3 :
        return 'Completed';
      case 4 :
        return 'Timed out';
      default:
        return '';
    }
  }

  /**
   * Format position value for export
   * @param {number} position
   * @returns {string}
   */
  private getPositionLabel(position: any) {
    return ' [Position: ' + position + ']';
  }

  /**
   * Add position counter to export data
   * @param question
   * @param option
   * @returns {any}
   */
  checkQuestTypeAndSetPositionCounter(question, option) {
    if (question.info.type === QuestionType.ORDER && typeof option.order_pos === 'number') {
      let pos = '_';
      if (question.answer && question.answer.answer_options) {
        const answOpt = question.answer.answer_options.find((opt: UserAnswerOption) => opt.question_answer_options_id === option.id);
        if (answOpt) {
          pos = answOpt.user_order_pos + 1;
        }
      }
      return {label: '', user_info: '', question: option.title + this.getPositionLabel(pos), score: ''};
    }
    return {label: '', user_info: '', question: option.title, score: ''};
  }

  /**
   * Format date from ISO to format('DD-MMM-YY')
   * @param params (date in Iso format)
   */
  private dateFormatter(param: any) {
    if (!param) {
      return '';
    }
    return fromIsoDate(param);
  }

  private htmlToString(text: string): string {
    const sampleDivElement = document.createElement('div');
    sampleDivElement.innerHTML = text;
    return sampleDivElement.textContent || sampleDivElement.innerText || '';
  }

  private createDocumentTitle(titlesWorkSheets: string[]): string {
    let keyName = '';
    if (titlesWorkSheets.length > 1) {
      titlesWorkSheets.forEach(title => {
        const index = title.indexOf(' ');
        keyName += title.slice(0, index) + ', ';
      });
    } else {
      titlesWorkSheets.forEach(title => {
        keyName += title + ' ';
      });
    }
    return keyName;
  }
}
