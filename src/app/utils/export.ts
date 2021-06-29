import * as fs from 'file-saver';
import { Workbook, Worksheet } from 'exceljs';
import { ExportType } from '@app/enums/exports-type';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

export function createWorkBook(): Workbook {
  return new Workbook();
}

/**
 * Utility function to export data (in table format) to xlsx file.
 * @param headers (Array with header's names)
 * @param rowData (Array (users selected length) of arrays (fields data with the same length as header's array) with cells data)
 * @param ws (Worksheet name)
 * @param workbook (Workbook)
 */
export function addWorksheet(workbook: Workbook, headers: any[], rowData: any[], ws: string, exportType: ExportType): void {
   const worksheet = workbook.addWorksheet(ws);
  let columnWidths;

  /**
   * Set fixed column widths
   */
  switch (exportType) {
    case ExportType.SUMMARY: {
      columnWidths = {
        firstName: 16, lastName: 22,
        email: 30, jobTitle: 30,
        NDO: 10, PTA: 10,
        OTF: 10, API: 10,
        managerName: 20, department: 30,
        country: 20, state: 20,
        currency: 10, notes: 20, lLogin: 10
      };
      break;
    }
    case ExportType.BEST_NEGOTIATORS: {
      columnWidths = {
        name: 16, familyName: 20, jobTitle: 30,
        country: 20, state: 20, department: 30,
        size: 10, teamNeg: 10, teamPrep: 10, lengthColumn: 10,
        flexibility: 10, prepTime: 10, prepRank: 10, review: 7,
        outcomes: 45, courses: 35, books: 40,
        currency: 10, lLogin: 10
      };
      break;
    }
  }

  headers.forEach((header, i) => {
    worksheet.getColumn(i + 1).header = header;
    worksheet.getColumn(i + 1).width = 20;
    if (header === 'First Name') worksheet.getColumn(i + 1).width = columnWidths.firstName;
    if (header === 'Last Name' || header === 'State') worksheet.getColumn(i + 1).width = columnWidths.lastName;
    if (header === 'Email' || header === 'Job Title') worksheet.getColumn(i + 1).width = columnWidths.jobTitle;
    if (header === 'NDO' || header === 'PTA' || header === 'OTF' || header === 'API' || header === 'L Login' || header === 'Currency') {
      worksheet.getColumn(i + 1).width = columnWidths.currency;
    }
    if (header === 'Manager Name' || header === 'Country' || header === 'Notes') {
      worksheet.getColumn(i + 1).width = columnWidths.country;
    }
    if (header === 'Department') worksheet.getColumn(i + 1).width = columnWidths.department;
    if (header === 'Family Name' || header === 'State') {
      worksheet.getColumn(i + 1).width = columnWidths.familyName;
    }
    if (header === 'Books') worksheet.getColumn(i + 1).width = columnWidths.books;
    if (header === 'Courses') worksheet.getColumn(i + 1).width = columnWidths.courses;
    if (header === 'Outcomes') worksheet.getColumn(i + 1).width = columnWidths.outcomes;
    if (header === 'Review') worksheet.getColumn(i + 1).width = columnWidths.review;
    if (header === 'Prep Rank' || header === 'Prep Time' || header === 'Team Prep'
      || header === 'Team Neg' || header === 'Flexibility' || header === 'Length' || header === 'Size') {
      worksheet.getColumn(i + 1).width = columnWidths.teamNeg;
    }

    worksheet.getColumn(i + 1).font = {
      color: {argb: '00000080'},
      bold: true
    };
  });

  rowData.forEach(row => {
    const rowValues = [];
    worksheet.addRow(rowValues);
    row.forEach((field, i) => {
      const newRow = worksheet.lastRow;
      const color = (field.isStatus && field.checked) ? '00000080' : '00000000';
      const bold = field.isStatus ? true : false;
      const strike = (field.isStatus && !field.checked) ? true : false;
      const attempts = field.attempts;
      if (attempts > 1) {
        // newRow.height = attempts * 15;
        newRow.getCell(i + 1).alignment = {wrapText: true};
      }

      if (field.field && !isNaN(field.field)) {
        field.field = parseFloat(field.field);
      }
      newRow.getCell(i + 1).value = field.field;
      newRow.getCell(i + 1).font = {
        color: {argb: color},
        bold: bold,
        strike: strike
      };
    });
  });
}

/**
 * Generate Excel File with given name
 * @param {Workbook} workbook
 * @param {string} file_name
 */
export function generateExelFile(workbook: Workbook, file_name: string) {
  workbook.xlsx.writeBuffer().then((data) => {
    const blob = new Blob([data as BlobPart], {type: EXCEL_TYPE});
    fs.saveAs(blob, file_name + EXCEL_EXTENSION);
  });
}

/**
 * Utility function to export data (in table format) to xlsx file for Participants Responses export Assessment questionnaire type
 * @param {any[]} exportData
 * @param {string} file_name
 */
export function exportAssessmentParticipantsResponseToExcel(exportData: any[], file_name: string) {
  const workbook = new Workbook();
  exportData.forEach((user, i) => {
    const wsName = getWSName (exportData, i);
    const worksheetTemplate = workbook.addWorksheet(wsName);
    let mainInfoCounter = 0;

    user.forEach(userObj => {
      const rowValues = [];
      worksheetTemplate.addRow(rowValues);
      const newRow = worksheetTemplate.lastRow;
      i = 0;

      if (userObj.label === '0/0') {
        delete userObj.label;
      }

      if (userObj.label && !isNaN(userObj.label)) {
        userObj.label = parseFloat(userObj.label);
      }
      if (userObj.question && !isNaN(userObj.question)) {
        userObj.question = parseFloat(userObj.question);
      }

      newRow.getCell(i + 1).value = userObj.label;

      if (userObj.hasOwnProperty('questScore')) {
        newRow.getCell(i + 1).value = userObj.label;
        newRow.getCell(i + 1).font = {bold: true};
        newRow.getCell(i + 1).alignment = {horizontal: 'center'};
      }

      if ((userObj.user_info || userObj.user_info === 0) && !isNaN(userObj.user_info)) {
        userObj.user_info = parseFloat(userObj.user_info);
        newRow.getCell(i + 2).value = userObj.user_info;
      } else {
        newRow.getCell(i + 2).value = htmlToString(userObj.user_info);
      }

      if (userObj.hasOwnProperty('bold')) {
        newRow.getCell(i + 2).font = {bold: true};
      }
      if (userObj.hasOwnProperty('italic')) {
        newRow.getCell(i + 2).font = {italic: true, bold: true};
      }
      if (userObj.hasOwnProperty('itsComment')) {
        newRow.getCell(i + 2).value = userObj.user_info;
        newRow.getCell(i + 2).font = {italic: true, color: {argb: '000080'}};
        newRow.getCell(i + 3).alignment = {wrapText: true};
      }

      newRow.getCell(i + 3).value = userObj.question;
      if (userObj.hasOwnProperty('checked')) {
        newRow.getCell(i + 2).font = {bold: true};
        newRow.getCell(i + 3).font = {bold: true, color: {argb: '000080'}};
        newRow.getCell(i + 3).value = htmlToString(userObj.question);
      }
      if (userObj.hasOwnProperty('withScore')) {
        newRow.getCell(i + 2).alignment = {horizontal: 'right'};
        newRow.getCell(i + 3).alignment = {wrapText: true};
      }
      if (userObj.hasOwnProperty('main_info')) {
        mainInfoCounter++;
      }
    });

    mergeCells(mainInfoCounter, worksheetTemplate);

    worksheetTemplate.getColumn(1).width = 22;
    worksheetTemplate.getColumn(3).width = 80;
    worksheetTemplate.getColumn(4).width = 15;
  });
  generateExelFile(workbook, file_name);
}

/**
 * Utility function to export data (in table format) to xlsx file for Participants Responses export Profiles questionnaire type
 * @param {any[]} exportData
 * @param {string} file_name
 */
export function exportProfilesParticipantsResponseToExcel(exportData: any[], file_name: string) {
  const workbook = new Workbook();
  exportData.forEach((user, i) => {
    const wsName = getWSName (exportData, i);
    const worksheetTemplate = workbook.addWorksheet(wsName);

    let mainInfoCounter = 0;
    user.forEach(userObj => {
      const rowValues = [];
      worksheetTemplate.addRow(rowValues);
      const newRow = worksheetTemplate.lastRow;
      i = 0;

      if (userObj.label && !isNaN(userObj.label)) {
        userObj.label = parseFloat(userObj.label);
      }
      if (userObj.question && !isNaN(userObj.question)) {
        userObj.question = parseFloat(userObj.question);
      }
      if (userObj.labelSet && !isNaN(userObj.labelSet)) {
        userObj.labelSet = parseFloat(userObj.labelSet);
      }

      newRow.getCell(i + 1).value = userObj.label;

      if ((userObj.user_info || userObj.user_info === 0) && !isNaN(userObj.user_info)) {
        userObj.user_info = parseFloat(userObj.user_info);
        newRow.getCell(i + 2).value = userObj.user_info;
      } else {
        newRow.getCell(i + 2).value = htmlToString(userObj.user_info);
      }

      if (userObj.hasOwnProperty('italic')) {
        newRow.getCell(i + 2).font = {italic: true, bold: true};
      }
      if (userObj.hasOwnProperty('withScore')) {
        newRow.getCell(i + 2).alignment = {horizontal: 'right'};
      }
      if (userObj.hasOwnProperty('itsComment')) {
        newRow.getCell(i + 1).font = {italic: true};
        newRow.getCell(i + 2).value = userObj.user_info;
        newRow.getCell(i + 3).font = {color: {argb: '000080'}, bold: true};
        newRow.getCell(i + 1).alignment = {horizontal: 'right'};
        newRow.getCell(i + 3).alignment = {wrapText: true};
      }
      if (userObj.hasOwnProperty('bold')) {
        newRow.getCell(i + 2).font = {bold: true};
      }

      newRow.getCell(i + 3).value = userObj.question;
      if (userObj.hasOwnProperty('checked')) {
        newRow.getCell(i + 2).font = {bold: true};
        newRow.getCell(i + 3).font = {bold: true, color: {argb: '000080'}};
      }
      newRow.getCell(i + 4).value = userObj.labelSet;
      if (userObj.hasOwnProperty('main_info')) {
        mainInfoCounter++;
      }
    });

    mergeCells(mainInfoCounter, worksheetTemplate);

    worksheetTemplate.getColumn(1).width = 22;
    worksheetTemplate.getColumn(3).width = 60;
    worksheetTemplate.getColumn(4).width = 15;
  });
  generateExelFile(workbook, file_name);

}

function mergeCells(counter: number, worksheet: Worksheet): void {
  for (let i = 1; i < counter + 1; i++) {
    worksheet.mergeCells('B' + i + ':C' + i);
  }
}

/**
 * Utility function to export data (in table format) to xlsx file for Participants Responses export Feedbacks questionnaire type
 * @param {any[]} exportData
 * @param {string} file_name
 */
export function exportFeedbacksParticipantsResponseToExcel(exportData: any[], file_name: string) {
  const workbook = new Workbook();
  exportData.forEach((user, i) => {
    const wsName = getWSName (exportData, i);
    const worksheetTemplate = workbook.addWorksheet(wsName);
    let mainInfoCounter = 0;

    user.forEach(userObj => {
      const rowValues = [];
      worksheetTemplate.addRow(rowValues);
      const newRow = worksheetTemplate.lastRow;
      i = 0;

      if (userObj.label && !isNaN(userObj.label)) {
        userObj.label = parseFloat(userObj.label);
      }
      if (userObj.score && !isNaN(userObj.score)) {
        userObj.score = parseFloat(userObj.score);
      }
      if (userObj.question && !isNaN(userObj.question)) {
        userObj.question = parseFloat(userObj.question);
      }

      newRow.getCell(i + 1).value = userObj.label;

      if ((userObj.user_info || userObj.user_info === 0) && !isNaN(userObj.user_info)) {
        userObj.user_info = parseFloat(userObj.user_info);
        newRow.getCell(i + 2).value = userObj.user_info;
      } else {
        newRow.getCell(i + 2).value = htmlToString(userObj.user_info);
      }

      newRow.getCell(i + 2).font = {bold: true};

      if (userObj.hasOwnProperty('italic')) {
        newRow.getCell(i + 2).font = {italic: true, bold: true};
        if (userObj.hasOwnProperty('averageScore')) {
          newRow.getCell(i + 4).value = userObj.score;
          newRow.getCell(i + 4).font = {bold: true};
        }
      }
      if (userObj.hasOwnProperty('wrapText')) {
        worksheetTemplate.getCell(newRow.getCell(i + 3).address).alignment = {wrapText: true};
      }
      if (userObj.hasOwnProperty('bold')) {
        newRow.getCell(i + 2).font = {bold: true};
      }

      newRow.getCell(i + 3).value = userObj.question;

      if (userObj.hasOwnProperty('checked')) {
        newRow.getCell(i + 3).font = {bold: true, color: {argb: '000080'}};
      }
      newRow.getCell(i + 4).value = userObj.score;
      if (userObj.hasOwnProperty('main_info')) mainInfoCounter++;
    });

    mergeCells(mainInfoCounter, worksheetTemplate);

    worksheetTemplate.getColumn(1).width = 22;
    worksheetTemplate.getColumn(2).width = 25;
    worksheetTemplate.getColumn(3).width = 50;
    worksheetTemplate.getColumn(4).width = 15;
  });

  generateExelFile(workbook, file_name);
}

function htmlToString(text: string) {
  const sampleDivElement = document.createElement('div');
  sampleDivElement.innerHTML = text;
  return sampleDivElement.textContent || sampleDivElement.innerText || '';
}

/**
 * Returns unique WS name with max length 30
 * @param data
 * @param index
 */
function getWSName (data: any, index: number) {
  let wsName = data[index][0].user_info.substring(0, 30);
  let count = 1;

  for (let i = 0; i < index; i++) {
    if (data[i][0].user_info.substring(0, 30) === wsName) {
      count++;
    }
  }

  if (count > 1) {
    const sufix = ` (${count})`;
    const maxLength = 30 - sufix.length;
    wsName = wsName.substring(0, maxLength);
    wsName += sufix;
  }
  return wsName;
}
