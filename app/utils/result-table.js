'use strict';

//const {png3x} = require('font-awesome-assets');
const faceService = require('../services/faces.service');
const enums = require('../enums/enums');

/**
 * Utility function creates table with Participants Responses
 * @param {any[]} exportData
 */
module.exports.createParticipantsResponsesTable = function (resps) {
  let table = '<table style="font-size: 13px; font-family: Calibri;">';
  let qNumber = 1;
  for (const row of resps) {
    if (row._id || row._result) continue;

    if (row.score === '0/0') {
      row.score = '';
    }
    table += '<tr style="height: 20px; text-align: left;">';
    /**First cell */
    if (row.hasOwnProperty('score')) {
      let cell = '<td class="score" style="width:80px; text-align: center;">' + row.score + '</td>';
      table += cell;
    } else {
      let cell = '<td class="score" style="width:80px"></td>';
      table += cell;
    }
    /**Second cell */
    let answer = '';
    if (row.hasOwnProperty('option_score') && row.hasOwnProperty('checked')) {
      answer = row.option_score;
      let cell = '<td class="option_score checked" style="width:35px; color: #000080; font-weight: bold;">' + answer + '</td>';
      table += cell;
    } else if (row.hasOwnProperty('option_score')) {
      answer = row.option_score;
      let cell = '<td class="option_score" style="width:35px">' + answer + '</td>';
      table += cell;
    }
    /**Third cell || colspan */
    if (row.hasOwnProperty('title') && row.hasOwnProperty('checked') && row.hasOwnProperty('option_score')) {
      let cell = '<td class="title_checked_option_score" style="width:750px; font-weight: bold; color: #000080;">' + row.title + '</td>';
      table += cell;
    } else if (row.hasOwnProperty('title') && row.hasOwnProperty('checked')) {
      let cell = '<td class="title_checked" colspan="2" style="width:750px; color: #000080;">' + row.title + '</td>';
      table += cell;
    } else if (row.hasOwnProperty('title') && row.hasOwnProperty('bold')) {
      let cell = '<td colspan="2" class="bold" style="font-weight: bold;">' + qNumber++ + '. ' + row.title + '</td>';
      table += cell;
    } else if (row.hasOwnProperty('title') && row.hasOwnProperty('group')) {
      const bgColor = row.title ? '#0288d1' : '#fff';
      let cell = `<td colspan="2" class="group" style="font-weight: bold; color: #fff; background-color: ${bgColor}">` + row.title + '</td>';
      table += cell;
    } else if (row.hasOwnProperty('title') && row.hasOwnProperty('explanation')) {
      const expl_label = '<div class="bold" style="font-weight: bold;"><br>Explanation:</div>';
      const expl_text = '<div class="explanation" style="font-style: italic;">'+ row.title + '</div>';
      let cell = '<td colspan="2">' + expl_label + expl_text + '</td>';
      table += cell;
    } else if (row.hasOwnProperty('title') && row.hasOwnProperty('option_score')) {
      let cell = '<td class="title_option_score" style="width:750px">' + row.title + '</td>';
      table += cell;
    } else {
      let cell = '<td colspan="2">' + answer + '</td>';
      table += cell;
    }
    table += '</tr>';
  }

  table += '</table>';
  return table;
};

module.exports.createParticipantsResponsesTableWithFaces = function(resps) {
  let table = '<table style="font-size: 13px; font-family: Calibri;">';
  let qNumber = 1;
  for (const row of resps) {
    if (row._id || row._result) continue;

    if (row.score === '0/0') {
      row.score = '';
    }
    table += '<tr style="height: 20px; text-align: left;">';
    /**First cell */
    /*if (row.hasOwnProperty('score')) {
      let cell = '<td class="score" style="width:80px; text-align: center;">' + row.score + '</td>';
      table += cell;
    } else {
      let cell = '<td class="score" style="width:80px"></td>';
      table += cell;
    }*/
    /**Second cell */
    let answer = '';
    if (row.hasOwnProperty('option_score') && row.hasOwnProperty('checked')) {
      if (row.show_faces) {
        answer = row.option_score;
        const faceColor = getFaceColor(row.option_face);
        const briefcase = faceService.getFace(row.option_face, faceColor);
        let cell = `<td class="option_score checked" style="width:35px;">
          ${briefcase}
        </td>`;
        table += cell;
      } else {
        answer = row.option_score;
        let cell = '<td class="option_score checked" style="width:35px; color: #000080; font-weight: bold;">' + answer + '</td>';
        table += cell;
      }
    } else if (row.hasOwnProperty('option_score')) {
      if (row.show_faces) {
        answer = row.option_score;
        const faceColor = getDefaultFaceColor();
        const briefcase = faceService.getFace(row.option_face, faceColor);
        let cell = `<td class="option_score" style="width:35px;">
          ${briefcase}
        </td>`;
        table += cell;
      } else {
        answer = row.option_score;
        let cell = '<td class="option_score" style="width:35px">' + answer + '</td>';
        table += cell;
      }
    }
    /**Third cell || colspan */
    if (row.hasOwnProperty('title') && row.hasOwnProperty('checked') && row.hasOwnProperty('option_score')) {
      let cell = '<td class="title_checked_option_score" style="width:750px; font-weight: bold; color: #000080;">' + row.title + '</td>';
      table += cell;
    } else if (row.hasOwnProperty('title') && row.hasOwnProperty('checked')) {
      let cell = '<td class="title_checked" colspan="2" style="width:750px; color: #000080;">' + row.title + '</td>';
      table += cell;
    } else if (row.hasOwnProperty('title') && row.hasOwnProperty('bold')) {
      let cell = '<td colspan="2" class="bold" style="font-weight: bold;">' + qNumber++ + '. ' + row.title + '</td>';
      table += cell;
    } else if (row.hasOwnProperty('title') && row.hasOwnProperty('group')) {
      let cell = '<td colspan="2" class="group" style="font-weight: bold; color: #fff; background-color: #0288d1">' + row.title + '</td>';
      table += cell;
    } else if (row.hasOwnProperty('title') && row.hasOwnProperty('explanation')) {
      const expl_label = '<div class="bold" style="font-weight: bold;"><br>Explanation:</div>';
      const expl_text = '<div class="explanation" style="font-style: italic;">'+ row.title + '</div>';
      let cell = '<td colspan="2">' + expl_label + expl_text + '</td>';
      table += cell;
    } else if (row.hasOwnProperty('title') && row.hasOwnProperty('option_score')) {
      let cell = '<td class="title_option_score" style="width:750px">' + row.title + '</td>';
      table += cell;
    } else {
      let cell = '<td colspan="2">' + answer + '</td>';
      table += cell;
    }
    table += '</tr>';
  }

  table += '</table>';
  return table;
};

function getFaceIconPath(option_face) {
  switch (option_face) {
    case enums.FaceTypes.HAPPY:
      return enums.FaceSvgPaths.HAPPY;
    case enums.FaceTypes.NEUTRAL:
      return enums.FaceSvgPaths.NEUTRAL;
    case enums.FaceTypes.SAD:
      return enums.FaceSvgPaths.SAD;
  }
  return enums.FaceSvgPaths.NONE;
}

function getFaceColor(option_face) {
  switch (option_face) {
    case enums.FaceTypes.HAPPY:
      return enums.FaceColors.HAPPY;
    case enums.FaceTypes.NEUTRAL:
      return enums.FaceColors.NEUTRAL;
    case enums.FaceTypes.SAD:
      return enums.FaceColors.SAD;
  }
  return enums.FaceColors.NONE;
}

function getDefaultFaceColor() {
  return enums.FaceColors.NONE;
}

