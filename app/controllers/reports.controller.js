'use strict';

var Sequelize = require('sequelize');

const {
  sequelize,
  HtmlReports,
  Questionnaire,
  CompanyQuestionnaireMap,
  Company,
  User,
  Attempt,
  Country,
  CareerCategory,
  UserAnswer
} = require('../models');
const utils = require('../utils');
const send_utils = require('../utils/send-template');
const nm = require('../services/nodemailer');
const MoneyConverter = require('../services/money-converter');
const Op = Sequelize.Op;
let ReportsController = {};

const config = require('../config/config');
const pdfService = require('../services/generate-pdf');
const enums = require('../enums/enums');

const OrderQuestionOptions = {
  0: {optionOrder: 'first'},
  1: {optionOrder: 'second'},
  2: {optionOrder: 'third'},
  3: {optionOrder: 'fourth'},
  4: {optionOrder: 'fifth'},
  5: {optionOrder: 'sixth'},
  6: {optionOrder: 'seventh'},
  7: {optionOrder: 'eighth'},
  8: {optionOrder: 'ninth'},
  9: {optionOrder: 'tenth'},
};

ReportsController.getReport = function (req, res) {
  HtmlReports.findById(req.body.report_id)
    .then(report => {
      console.log(report);
    });
};

/**
 * Create new report in db and return them back to the front-end
 * If 10 attempts were spent to generate the unique code, send error message "Please increase the Report's unique code length."
 * To increase this value use the REPORT_CODE_SIZE property in config file.
 * @param req
 * @param res
 */
ReportsController.createReport = async function (req, res) {
  const companiesIds = req.body.cid;
  let newDate = new Date();

  let code = await utils.getRandomCodeAsync(config.REPORT_CODE_SIZE);

  if (!code) {
    res.statusMessage = '"10 attempts were used to generate the unique code. \
    Please increase the Report\'s unique code length (REPORT_CODE_SIZE in server config file)."';
    res.status(400).end();
    return;
  }

  HtmlReports.findAll({attributes: ['s_order']})
    .then(result => {

      let sOrders = result.filter(item => item.s_order);
      sOrders = sOrders.map(item => item.s_order);
      const maxOrder = Math.max(...sOrders);

      let promises = [];
      companiesIds.forEach((companyId, index) => {
        promises.push(
          HtmlReports.create({
            cid: companyId,
            qid: req.body.qid,
            name: req.body.name,
            dt: newDate,
            code: code,
            html: req.body.html,
            s_order: maxOrder + index + 1
          }));
      });

      return Promise.all(promises);
    })
    .then(reports => {
      Company.findAll({
        where: {
          id: {
            [Op.or]: companiesIds
          }
        },
        attributes: ['title']
      }).then(companies => {
        reports.forEach((report, index) => {
          report.companyName = companies[index].title;
        });
        res.status(200).send(reports);
      }).catch(err => {
        res.status(404).json(err);
      });
    });
};

/**
 * Transforms seconds into minutes
 * We only want to show single decimals for all times that are 3 mins or less.
 * Anything more, don't show decimals.
 * @param {} seconds
 */
function parseMinutes(seconds) {
  const divider = seconds < 180 ? 10 : 1;
  return Math.round(seconds / 60 * divider) / divider;
}

/**
 * To create a report object with all necessary data to parse it
 * @param req
 * @param res
 */
ReportsController.generateReport = function (req, res) {
  const companyIds = req.query.companyIds.split(',');
  const userIds = req.query.userIds;
  const questId = req.query.questId;
  let companies;

  let reportsData = {}, dataForReports;

  MoneyConverter.updateCurrencies()
    .then(function () {
      return Company.findAll({
        where: {
          id: {
            [Op.and]: [companyIds]
          }
        },
        attributes: ['company_key', 'id', 'title']
      });
    })
    .then(foundCompanies => {
      companies = foundCompanies;
      reportsData.companies = [];
      foundCompanies.forEach(foundCompany => {
        reportsData.companies.push({
          companyKey: foundCompany.company_key,
          id: foundCompany.id,
          title: foundCompany.title
        });
      });

      let promises = [];
      companyIds.forEach(companyId => {
        promises.push(utils.getDataForReports(companyId, questId, userIds));
      });

      return Promise.all(promises).then(res => {
        let returnedObj = {};
        returnedObj.questionGroups = res[0].questionGroups.filter(group => group.group_questions_map.length > 0);
        returnedObj.questionnaireInfo = res[0].questionnaireInfo;
        let users = res.map(reportData => reportData['users']);
        returnedObj.users = Array.prototype.concat(...users);
        return returnedObj;
      });
    })
    .then(data => {
      dataForReports = data;
      const usersQueriesPromises = [];
      companies.forEach(company => {
        usersQueriesPromises.push(User.findAll(utils.getUsersAnswerByCompanyIdQuery(company.id, questId)));
      });
      return Promise.all(usersQueriesPromises);
    })
    .then(userAnswersByCompany => {
      reportsData.participants = [];
      //Show organization for PIA (questionnaire id = 124) only
      const showOrg = dataForReports.questionnaireInfo.id === 124 ? true : false;

      /**"time" needed for old reports supporting */
      dataForReports.users.forEach((user, index) => {
        reportsData.participants[index] = {
          city: user.city || '',
          country: {
            name: user.country ? user.country.name : ''
          },
          countryId: user.country_id,
          id: user.id,
          currency: {
            name: user.curr ? user.curr.currency_name : ''
          },
          department: user.department || '',
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          managerName: user.manager_name || '',
          organization: showOrg ? user.organization || '' : '',
          jobTitle: user.job_title || '',
          stateName: user.state_name || '',
          time: user.attempts[0].passed_time ? parseMinutes(user.attempts[0].passed_time) : 0,
          timeInSeconds: user.attempts[0].passed_time,
          industrySector: user.industry_sector || '',
          attempts: user.attempts
        };
        if (dataForReports.questionnaireInfo.type === 3) {
          reportsData.participants[index].score = getFeedbackScore(user.attempts[0].answers);
        } else if (dataForReports.questionnaireInfo.type === 1) {
          reportsData.participants[index].score = getAssessmentScore(user.attempts[0].answers, dataForReports.questionGroups);
        }
      });

      reportsData.questionnaire = {};

      reportsData.questionnaire.id = dataForReports.questionnaireInfo.id;
      reportsData.questionnaire.questionnaireType = dataForReports.questionnaireInfo.type;
      reportsData.questionnaire.title = dataForReports.questionnaireInfo.title;

      reportsData.questionnaire.groups = [];

      dataForReports.questionGroups.forEach((group, index) => {
        reportsData.questionnaire.groups.push({
          id: group.id,
          title: group.title,
          questions: getQuestionInfoToReport(group, index, dataForReports.users, dataForReports.questionnaireInfo.type, companies, questId, userAnswersByCompany),
        });
      });
      return reportsData;
    })
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      console.error(err);
      res.status(404).json(err);
    })
};

/**
 * Get average score for user answers
 * @param answers
 * @param groups
 * @returns {number}
 */
function getAssessmentScore(answers, groups) {
  let maxScores = 0;
  let userScores = 0;
  groups.forEach(group => {
    group.group_questions_map.forEach(questionModel => {
      /**Calculate  maxScores*/
      if (!questionModel.question.is_bonus) {
        /**For MULTIPLE_CHOISE_SINGLE_OPTION returns max option */
        if (questionModel.question.type === 2) {
          let result = questionModel.question.question_options[0].score;
          questionModel.question.question_options.forEach(option => {
            if (option.score > result) {
              result = option.score;
            }
          });
          maxScores += result;
        }
        /**For MULTIPLE_CHOISE_MULTI_OPTIONS and others calculate all positive values of options */
        else {
          questionModel.question.question_options.map(answer => {
            return maxScores += (answer.score > 0) ? answer.score : 0;
          });
        }
      }
      /**Calculate  userScores*/
      for (let i = 0; i < answers.length; i++) {
        if (questionModel.question_id === answers[i].question_id) {
          if (questionModel.question.type === 2) {
            let foundedAnswer = questionModel.question.question_options.find(option => {
              return answers[i].answer_options[0].question_answer_option &&
                     (option.id === answers[i].answer_options[0].question_answer_option.id);
            });
            if (foundedAnswer) {
              userScores += foundedAnswer.score;
            }
          } else if (questionModel.question.type === 1) {
            for (let j = 0; j < questionModel.question.question_options.length; j++) {
              const questOpt = questionModel.question.question_options[j];

              answers[i].answer_options.forEach(option => {
                if (option.question_answer_option && (option.question_answer_option.id === questOpt.id)) {
                  userScores += questOpt.score;
                }
              });
            }
          }
        }
      }
    });
  });

  return Math.round((userScores / maxScores) * 100);
}

/**
 * Get average score for user answers
 * @param answers
 * @returns {*}
 */
function getFeedbackScore(answers) {
  let values = [];
  let maxPointsForQuestion = 0;
  for (let i = 0; i < answers.length; i++) {
    if (answers[i].answer_options.length > 0) {
      try {
        values = answers[i].answer_options.map(item => item['label_set_option'] ? item['label_set_option'].value : '0');
        answers[i].question.label_set.label_set_options.forEach(label => {
          if (Number(label.value) > maxPointsForQuestion) {
            maxPointsForQuestion = Number(label.value);
          }
        });
        break;
      } catch (error) {
        const e = answers[i];
      }

    }
  }
  let sum = 0;
  let answered = 0;
  if (values.length > 0) {
    for (let i = 0; i < values.length; i++) {
      if (Number(values[i]) > 0) { answered++; }
      sum += parseFloat(values[i]);
    }
    const res = sum / answered;
    return res % 1 === 0 ? res : res.toFixed(1);
  }
  return '';
}

/**
 * Get an average score of answers to questions on the group
 * @param users
 * @returns {string}
 */
function getFeedbacGroupkScore(users) {
  let score = 0;
  let count = users.length;
  users.forEach(user => {
    const userScore = parseFloat(getFeedbackScore(user.attempts[0].answers));
    if(isNaN(userScore)) {
      count--;
    } else {
      score += userScore;
    }
  });
  return count ? (score / count).toFixed(1) : '0';
}

/**
 * Get the average score of answers to the question for a specific user
 * @param data
 * @param options
 * @returns {number}
 */
function getUserScore(data, options) {
  let userScore = 0;

  for (let i = 0; i < data.length; i++) {
    if (data[i].hasOwnProperty('Correct')) {
      userScore += data[i].Correct * options[i].score;
    } else if (data[i].hasOwnProperty('Consolation')) {
      userScore += data[i].Consolation * options[i].score;
    } else if (data[i].hasOwnProperty('Negative')) {
      userScore += data[i].Negative * options[i].score;
    }
  }
  return userScore;
}

/**
  * Get the maximum possible score for the question
  * @param question
  * @returns {number}
  */
function getMaxScore(question) {
  let result = 0;
  /*if (question.is_bonus === 1) {
    result = result;
  } else */if (question.question_options && question.question_options.length > 0) {
    /**For MULTIPLE_CHOISE_SINGLE_OPTION returns max option */
    if (question.type === 2) {
      result = question.question_options[0].score;
      question.question_options.forEach(option => {
        if (option.score > result) {
          result = option.score;
        }
      });
    }
    /**For MULTIPLE_CHOISE_MULTI_OPTIONS and others calculate all positive values of options */
    else {
      question.question_options.forEach(option => {
        option.score < 0 ? result = result : result += option.score;
      });
    }
  } else {
    result = 0;
  }
  return result;
}

/**
 * Generate question data object by questionnaire type and question type
 * @param group
 * @param users
 * @param questionnaireType
 * @returns {Array}
 */
function getQuestionInfoToReport(group, groupIndex, users, questionnaireType, companies, questId, userAnswersByCompany) {
  let questions = [];

  group.group_questions_map.forEach((questionGroup, questionIndex) => {
    let questionInfo = {
      type: questionGroup.question.type,
      questionGraphType: questionGroup.question.question_graph_type,
      title: questionGroup.question.title,
      id: questionGroup.question_id,
      isActive: questionGroup.question.is_active,
      is_cloud: questionGroup.question.is_cloud,
      is_sort_hide: questionGroup.question.is_sort_hide,
      questType: questionGroup.question.quest_type,
      rangeInterval: questionGroup.question.range_interval ? questionGroup.question.range_interval : '',
      switchTypeGraph: questionGroup.question.switch_type_graph,
      explanation: questionGroup.question.explanation ? questionGroup.question.explanation : ''
    };

    if (questionnaireType === 2) {
      switch (questionGroup.question.type) {
        case 5: {
          questionInfo.answers = getComments(users, questionGroup.question_id);
          questions.push(questionInfo);
          break;
        }
        case 2:
        case 1: {
          questionInfo.chart = getProfilesChartForMultiSingleType(questionGroup.question, users);
          questionInfo.comments = getComments(users, questionGroup.question_id);
          questions.push(questionInfo);
          break;
        }
        case 3: {
          questionInfo.chart = getProfilesChartForArrayType(questionGroup.question, users, companies, questId, userAnswersByCompany);
          questionInfo.comments = getComments(users, questionGroup.question_id);
          questions.push(questionInfo);
          break;
        }
        case 4: {
          questionInfo.chart = getProfilesChartForOrderType(questionGroup.question, users);
          questionInfo.comments = getComments(users, questionGroup.question_id);
          questions.push(questionInfo);
          break;
        }
        case 6: {
          questionInfo.chart = getProfilesChartForNumericType(questionGroup.question, users);
          questionInfo.comments = getComments(users, questionGroup.question_id);
          questions.push(questionInfo);
          break;
        }
      }
    } else if (questionnaireType === 1) {
      switch (questionGroup.question.type) {
        case 1: {
          questionInfo.chart = getAssessmentChartMultiType(questionGroup.question, users);
          questionInfo.userScore = getUserScore(questionInfo.chart.data, questionGroup.question.question_options);
          questionInfo.maxScore = getMaxScore(questionGroup.question) * users.length;
          questionInfo.comments = getComments(users, questionGroup.question_id);
          questions.push(questionInfo);
          break;
        }
        case 2: {
          questionInfo.chart = getAssessmentChartSingleType(questionGroup.question, users, questId);
          questionInfo.userScore = getUserScore(questionInfo.chart.data, questionGroup.question.question_options);
          questionInfo.maxScore = getMaxScore(questionGroup.question) * users.length;
          questionInfo.comments = getComments(users, questionGroup.question_id);
          questions.push(questionInfo);
          break;
        }
        case 5: {
          questionInfo.answers = getComments(users, questionGroup.question_id);
          questions.push(questionInfo);
          break;
        }
      }
    } else if (questionnaireType === 3) {
      switch (questionGroup.question.type) {
        case 1:
        case 2: {
          questionInfo.chart = getProfilesChartForMultiSingleType(questionGroup.question, users);
          questionInfo.comments = getComments(users, questionGroup.question_id);
          questions.push(questionInfo);
          break;
        }
        case 4: {
          questionInfo.chart = getProfilesChartForOrderType(questionGroup.question, users);
          questionInfo.comments = getComments(users, questionGroup.question_id);
          questions.push(questionInfo);
          break;
        }
        case 6: {
          questionInfo.chart = getProfilesChartForNumericType(questionGroup.question, users);
          questionInfo.comments = getComments(users, questionGroup.question_id);
          questions.push(questionInfo);
          break;
        }
        case 3: {
          if (questionIndex === 0 && groupIndex === 0) {
            questionInfo.answers = getFeedbacksChart(users, questionGroup.question);
            questionInfo.title += ' (Avg = ' + getFeedbacGroupkScore(users) + ')';
            questions.push(questionInfo);
          } else {
            questionInfo.chart = getProfilesChartForArrayType(questionGroup.question, users, companies, questId, userAnswersByCompany);
            questionInfo.comments = getComments(users, questionGroup.question_id);
            questions.push(questionInfo);
          }
          break;
        }
        case 5: {
          questionInfo.answers = getComments(users, questionGroup.question_id);
          questions.push(questionInfo);
          break;
        }
      }
    }

    questions.forEach(question => {
      if (question.comments === undefined) delete question.comments;
    });
  });

  return questions;
}

/**
 * Get an object with user answers by answer options,
 * userIds and other necessary information to display on charts
 * FEEDBACK
 * @param users
 * @param question
 * @returns {Array}
 */
function getFeedbacksChart(users, question) {
  let generalAnswers = [];

  for (let i = 0; i < question.question_options.length; i++) {
    const option = question.question_options[i];
    generalAnswers.push({
      orderPos: option.order_pos,
      id: option.id,
      title: option.title
    });
  }

  generalAnswers.sort((a, b) => {
    return a.orderPos - b.orderPos;
  });

  users.forEach(user => {
    user.attempts[0].answers.forEach(answer => {
      if (answer.question_id === question.id) {
        for (let i = 0; i < generalAnswers.length; i++) {
          generalAnswers[i].chart = {data: []};
          generalAnswers[i].chart.series = [
            {
              type: 'bar',
              stacked: false,
              showInLegend: false,
              xField: 'label',
              yField: ['count']
            }
          ];
          generalAnswers[i].chart.fields = [
            generalAnswers[i].chart.series[0].xField,
            generalAnswers[i].chart.series[0].yField[0]
          ];
          generalAnswers[i].chart.axes = [
            {type: 'pbo-numeric', fields: ['count'], position: 'bottom'},
            {type: 'pbo-category', fields: ['label'], position: 'left'}
          ];

          question.label_set.label_set_options.forEach((option, index) => {
            generalAnswers[i].chart.data.push({
              label: (index + 1).toString(10),
              count: 0,
              participants: []
            })
          });
        }
      }
    });
  });

  users.forEach(user => {
    user.attempts[0].answers.forEach(userAnswerModel => {
      if (userAnswerModel.question_id === question.id) {
        for (let i = 0; i < userAnswerModel.answer_options.length; i++) {
          const option = userAnswerModel.answer_options[i];
          if (!option.label_set_option) {
            continue;
          }

          if (option.question_answer_option) {
            const obj = generalAnswers.find(ga => ga.id === option.question_answer_option.id);
            obj.chart.data[option.label_set_option.value - 1].count++;
            obj.chart.data[option.label_set_option.value - 1].participants.push(user.id);
          }
        }
      }
    });
  });

  for (let i = 0; i < generalAnswers.length; i++) {
    if (!generalAnswers[i].chart) { continue; }
    generalAnswers[i].chart.maxDataValue = 0;
    const dataCounts = generalAnswers[i].chart.data.map(item => item.count);
    generalAnswers[i].chart.maxDataValue = Math.max(...dataCounts);
  }

  for (let i = 0; i < generalAnswers.length; i++) {
    let scores = 0;
    let scoresCount = 0;
    if (!generalAnswers[i].chart) { continue; }
    for (let k = 0; k < generalAnswers[i].chart.data.length; k++) {
      let item = generalAnswers[i].chart.data[k];
      if (item.count > 0) {
        scores += parseFloat(item.label) * item.count;
        scoresCount += item.count;
      }
    }

    if (!scoresCount) {
      generalAnswers[i].averageScore = '0';
    } else {
      generalAnswers[i].averageScore = (scores / scoresCount).toFixed(1);
    }
    generalAnswers[i].title += ' (Avg = ' + generalAnswers[i].averageScore + ')';
  }
  return generalAnswers;
}

/**
 * Get an object with user answers by answer options,
 * userIds and other necessary information to display on charts
 * ASSESSMENT Multi question type
 * @param question
 * @param users
 * @returns {{}}
 */
function getAssessmentChartMultiType(question, users) {
  let chart = {};
  let data = [];

  for (let i = 0; i < question.question_options.length; i++) {
    const option = question.question_options[i];
    data[i] = {};
    data[i].participants = {};
    if (option.score > 0) {
      data[i].Correct = 0;
      data[i].participants = {Correct: []};
    } else if (option.score === 0) {
      data[i].Incorrect = 0;
      data[i].participants = {Incorrect: []};
    } else if (option.score < 0) {
      data[i].Negative = 0;
      data[i].participants = {Negative: []};
    }
    data[i].total = 0;
    data[i].label = option.title;
  }



  users.forEach(user => {
    let userAnswersModels = [];
    for (let i = 0; i < user.attempts[0].answers.length; i++) {
      let answerModel = user.attempts[0].answers[i];
      let questionOptions = question['question_options'];

      questionOptions.forEach(questOpt => {
        answerModel.answer_options.forEach(userOpt => {
          if (questOpt.id === userOpt.question_answer_options_id) {
            userAnswersModels.push(userOpt['question_answer_option']);
          }
        });
      });

      if (userAnswersModels.length > 0) {
        let userAnswers = userAnswersModels.map(v => v.title);

        for (let i = 0; i < data.length; i++) {
          if (userAnswers.includes(data[i].label)) {
            if (data[i].hasOwnProperty('Incorrect')) {
              if (!data[i].participants['Incorrect'].includes(user.id)) {
                data[i].total++;
                data[i].participants['Incorrect'].push(user.id);
                data[i]['Incorrect'] = data[i].participants['Incorrect'].length;
              }
            } else if (data[i].hasOwnProperty('Correct')) {
              if (!data[i].participants['Correct'].includes(user.id)) {
                data[i].participants['Correct'].push(user.id);
                data[i]['Correct'] = data[i].participants['Correct'].length;
                data[i].total++;
              }
            } else if (data[i].hasOwnProperty('Negative')) {
              if (!data[i].participants['Negative'].includes(user.id)) {
                data[i].participants['Negative'].push(user.id);
                data[i]['Negative'] = data[i].participants['Negative'].length;
                data[i].total++;
              }
            }
          }
        }
      }
    }
  });

  for (let i = 0; i < data.length; i++) {
    if (data[i].label.length > 60) {
      data[i].label = splitLongString(data[i].label, 60);
    }
  }

  let countArr = data.map(item => item.total);
  chart.maxDataValue = Math.max(...countArr);
  chart.data = data;

  chart.series = [
    {
      showInLegend: true,
      stacked: true,
      type: 'bar',
      xField: 'label',
      yField: ['Correct', 'Incorrect']
    }
  ];
  chart.colors = ["#94ae0a", "#a61120"];

  if (data.some(item => item['Negative'])) {
    chart.series[0].yField.push('Negative');
    chart.colors.push('#ffbac7');
  }

  chart.fields = [];
  chart.fields[0] = chart.series[0].xField;
  for (let i = 0; i < chart.series[0].yField.length; i++) {
    chart.fields[i + 1] = chart.series[0].yField[i];
  }

  chart.axes = [
    {fields: chart.series[0].yField, position: 'bottom', type: "pbo-numeric"},
    {fields: [chart.series[0].xField], position: 'left', type: 'pbo-category'}
  ];

  return chart;
}

/**
 * Split long labels with a new line translation to solve issue with graph width
 * @param option
 * @param stepLength
 */
function splitLongString(option, stepLength) {
  let passedWordsLength = 0;
  let wordsArray = option.split(' ');
  let separationIndexes = [];

  for (let i = 0; i < wordsArray.length; i++) {
    const word = wordsArray[i];
    if ((word.length + passedWordsLength) > stepLength * (separationIndexes.length + 1)) {
      separationIndexes.push(i);
    }
    passedWordsLength += word.length + 1;
  }

  separationIndexes.forEach(index => {
    wordsArray.splice(index, 0, "\n");
  });

  return wordsArray.join(' ');
}

/**
 * Get an object with user answers by answer options,
 * userIds and other necessary information to display on charts
 * ASSESSMENT Single question type.
 * If questId ==== 124 (PIA) another colors will be set to chart
 * @param question
 * @param users
 * @param questId (Questionnaire id)
 * @returns {{}}
 */
function getAssessmentChartSingleType(question, users, questId) {
  let chart = {};
  let data = [];

  let maxScore = 0;
  for (let i = 0; i < question.question_options.length; i++) {
    if (question.question_options[i].score > 0 && question.question_options[i].score > maxScore) {
      maxScore = question.question_options[i].score;
    }
  }

  for (let i = 0; i < question.question_options.length; i++) {
    const option = question.question_options[i];
    data[i] = {};
    data[i].participants = {};
    if (option.score === maxScore) {
      data[i].Correct = 0;
      data[i].participants = {Correct: []};
    } else if (option.score === 0) {
      data[i].Incorrect = 0;
      data[i].participants = {Incorrect: []};
    } else if (option.score < 0) {
      data[i].Negative = 0;
      data[i].participants = {Negative: []};
    } else {
      data[i].Consolation = 0;
      data[i].participants = {Consolation: []};
    }
    data[i].total = 0;

    if (option.title.length > 60) {
      option.title = splitLongString(option.title, 60);
    }

    data[i].label = option.title;
  }

  users.forEach(user => {
    for (let i = 0; i < user.attempts[0].answers.length; i++) {
      let answerModel = user.attempts[0].answers[i];
      if (answerModel.question_id === question.id) {
        let userAnswer = question['question_options'].find(option => {
          return option.id === answerModel.answer_options[0].question_answer_options_id;
        });

        for (let i = 0; i < data.length; i++) {
          if (userAnswer && data[i].label === userAnswer.title) {
            data[i].total++;
            if (data[i].hasOwnProperty('Incorrect')) {
              data[i].participants['Incorrect'].push(user.id);
              data[i]['Incorrect'] = data[i].participants['Incorrect'].length;
            } else if (data[i].hasOwnProperty('Correct')) {
              data[i].participants['Correct'].push(user.id);
              data[i]['Correct'] = data[i].participants['Correct'].length;
            } else if (data[i].hasOwnProperty('Consolation')) {
              data[i].participants['Consolation'].push(user.id);
              data[i]['Consolation'] = data[i].participants['Consolation'].length;
            } else if (data[i].hasOwnProperty('Negative')) {
              data[i].participants['Negative'].push(user.id);
              data[i]['Negative'] = data[i].participants['Negative'].length;
            }
            break;
          }
        }
        break;
      }
    }
  });

  let countArr = data.map(item => item.total);
  chart.maxDataValue = Math.max(...countArr);
  chart.data = data;

  chart.series = [
    {
      showInLegend: true,
      stacked: true,
      type: "bar",
      xField: "label",
      yField: ['Correct', 'Consolation', 'Incorrect']
    }
  ];

  chart.colors = ["#94ae0a", '#115fa6', "#a61120"];

  /**If Price Increase Assessment */
  if (questId === '124') {
    chart.colors = [enums.FaceColors.HAPPY, enums.FaceColors.NEUTRAL, enums.FaceColors.SAD];
  }

  /*if (data.some(item => item['Consolation'])) {
    chart.series[0].yField.push('Consolation');
    chart.colors.push('#115fa6');
  }*/

  if (data.some(item => item['Negative'])) {
    chart.series[0].yField.push('Negative');
    chart.colors.push('#ffbac7');
  }

  chart.fields = [];
  chart.fields[0] = chart.series[0].xField;
  for (let i = 0; i < chart.series[0].yField.length; i++) {
    chart.fields[i + 1] = chart.series[0].yField[i];
  }

  chart.axes = [
    {fields: chart.series[0].yField, position: 'bottom', type: "pbo-numeric"},
    {fields: [chart.series[0].xField], position: 'left', type: "pbo-category"}
  ];

  return chart;
}

/**
 * Get an object with user answers by answer options,
 * userIds and other necessary information to display on charts
 * PROFILES Multi/Single question type
 * @param question
 * @param users
 * @returns {{}}
 */
function getProfilesChartForMultiSingleType(question, users) {
  let chart = {};
  let data = [];

  question['question_options'].forEach(questOption => {
    data.push({
      label: questOption.title,
      participants: [],
      count: 0
    });
  });

  if (question.type === 2) {
    users.forEach(user => {
      for (let i = 0; i < user.attempts[0].answers.length; i++) {
        let answerModel = user.attempts[0].answers[i];
        if (answerModel.question_id === question.id && answerModel.answer_options.length) {
          let userAnswer = question['question_options'].find(option => {
            return option.id === answerModel.answer_options[0].question_answer_options_id;
          });

          for (let i = 0; i < data.length; i++) {
            if (userAnswer && data[i].label === userAnswer.title) {
              data[i].count++;
              data[i].participants.push(user.id);
              break;
            }
          }
          break;
        }
      }
    });
  } else if (question.type === 1) {
    users.forEach(user => {
      let userAnswersModels = [];
      for (let i = 0; i < user.attempts[0].answers.length; i++) {
        let answerModel = user.attempts[0].answers[i];
        let questionOptions = question['question_options'];

        questionOptions.forEach(questOpt => {
          answerModel.answer_options.forEach(userOpt => {
            if (questOpt.id === userOpt.question_answer_options_id) {
              userAnswersModels.push(userOpt['question_answer_option']);
            }
          });
        });

        if (userAnswersModels.length > 0) {
          let userAnswers = userAnswersModels.map(v => v.title);
          for (let i = 0; i < data.length; i++) {
            if (userAnswers.includes(data[i].label)) {
              data[i].count++;
              if (!data[i].participants.includes(user.id)) {
                data[i].participants.push(user.id);
              }
            }
          }
        }

        data.forEach(item => {
          if (item.participants.length > 0) {
            item.count = item.participants.length;
          }
        });
      }
    });
  }

  let countArr = data.map(item => item.count);
  chart.maxDataValue = Math.max(...countArr);
  chart.data = data;

  let usersCount = 0;
  chart.data.forEach(item => usersCount += item.count);

  if (question.question_graph_type === 1 || question.question_graph_type === 4) {
    chart.series = [
      {
        showInLegend: false,
        stacked: false,
        type: 'bar',
        xField: 'label',
        yField: ['count']
      }
    ];
    chart.axes = [
      {fields: [chart.series[0].yField[0]], position: 'bottom'},
      {fields: [chart.series[0].xField], position: 'left'}
    ];
    chart.fields = [chart.series[0].xField, chart.series[0].yField[0], 'participants'];
  } else if (question.question_graph_type === 2) {
    chart.series = [
      {
        angleField: "count",
        label: {field: "label"},
        type: "pie"
      }
    ];
    chart.fields = [chart.series[0].label.field, chart.series[0].angleField, 'participants'];
  }

  return chart;
}

/**
 * Get an object with user answers by answer options,
 * userIds and other necessary information to display on charts
 * PROFILES Array question type
 * @param question
 * @param users
 * @returns {{}}
 */

function getProfilesChartForArrayType(question, users, companies, questId, userAnswersByCompany) {
  let chart = {};

  if (question.question_graph_type !== 3) {
    chart.data = getChartDataForBarChart(question, users);
  } else {
    chart.data = getChartDataForRadarChart(question, users);
    chart.groupAnswersByCompany = [];
    userAnswersByCompany.forEach((companyUsers, index) => {
      chart.groupAnswersByCompany.push({
        company: companies[index],
        answersByOptions: getGroupAnswersByOptions(question, companyUsers)
      });
    });
  }

  let labelSetOptions = question.label_set.label_set_options;

  const maxDataCount = chart.data.map(item => item.total);
  chart.maxDataValue = Math.max(...maxDataCount);

  if (question.question_graph_type !== 3) {
    chart.series = [{
      showInLegend: true,
      stacked: true,
      type: 'bar',
      xField: 'label',
      yField: labelSetOptions.map(labelItem => labelItem.value)
    }];
  } else {
    chart.series = [{
      showInLegend: true,
      type: 'radar',
      xField: 'label',
      yField: labelSetOptions.map(labelItem => labelItem.value)
    }];
  }

  chart.fields = [];

  if (question.question_graph_type !== 3) {
    chart.fields[0] = chart.series[0].xField;
    for (let i = 0; i < chart.series[0].yField.length; i++) {
      chart.fields[i + 1] = chart.series[0].yField[i];
    }
  } else {
    for (let i = 0; i < chart.series[0].yField.length; i++) {
      chart.fields[i] = chart.series[0].yField[i];
    }
  }

  if (question.question_graph_type !== 3) {
    chart.axes = [
      {fields: labelSetOptions.map(labelItem => labelItem.value), position: 'bottom'},
      {fields: [chart.series[0].xField], position: 'left'}
    ];
  } else {
    chart.axes = question.question_options.map(labelItem => labelItem.title);
  }

  return chart;
}

/**
 * Generate chart data object for bar chart
 * Aggregation of user answers values by answers options
 * @param question
 * @param users
 */
function getChartDataForBarChart(question, users) {
  let data = [];
  for (let i = 0; i < question.question_options.length; i++) {
    data.unshift({
      label: question.question_options[i].title,
      option_id: question.question_options[i].id,
      participants: {}
    });
  }

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < question.label_set.label_set_options.length; j++) {
      const labelOptionModel = question.label_set.label_set_options[j];
      data[i][labelOptionModel.value] = 0;
      data[i].participants[labelOptionModel.value] = [];
    }
  }

  users.forEach(user => {
    for (let j = 0; j < user.attempts[0].answers.length; j++) {
      let answerModel = user.attempts[0].answers[j];
      if (answerModel.question_id === question.id) {
        for (let i = 0; i < answerModel['answer_options'].length; i++) {
          let userAnswers = answerModel['answer_options'][i];
          data.forEach(d => {
            if(d.option_id === userAnswers.question_answer_options_id) {
              for (const key in d) {
                if (d.hasOwnProperty(key) && userAnswers['label_set_option'] && key === userAnswers['label_set_option'].value) {
                  d[key]++;
                  d.participants[key].push(user.id);
                  break;
                }
              }
            }
          });

         // data[i][userAnswers['label_set_option'].value]++;
         // data[i].participants[userAnswers['label_set_option'].value].push(user.id);
        }
      }
    }
  });

  data.forEach(item => {
    let totalCounter = 0;
    for (let key in item.participants) {
      totalCounter += item.participants[key].length;
    }
    item.total = totalCounter;
  });
  data.reverse();
  return data;
}

/**
 * Generate chart data object for radar chart
 * array of answers data by each user
 * @param question
 * @param users
 */
function getChartDataForRadarChart(question, users) {
  let data = [];

  users.forEach(user => {
    let userAnswer = user.attempts[0].answers.find(a => a.question_id === question.id);

    if (!userAnswer) {
      return;
    }

    let chartData = {
      participantId: user.id,
      answers: []
    };

    question.question_options.forEach(option => {
      let answerByOption = {
        axes: option.title,
      };

      let answerOption = userAnswer.answer_options.find(o => o.question_answer_options_id === option.id);
      if (answerOption) {
        answerByOption.labelSet = answerOption.label_set_option;
        chartData.answers.push(answerByOption);
      }
    });

    data.push(chartData);
  });

  return data;

}

/**
 * Collect all users answers by options to calculate average on front end later
 * @param question
 * @param users
 */
function getGroupAnswersByOptions(question, users) {
  let result = [];

  const userAnswersByQuestion = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const answer = user.attempts[0].answers.find(a => a.question_id === question.id);

    if (answer) {
      userAnswersByQuestion.push(answer);
    }
  }

  question.question_options.forEach(option => {
    let answersByOption = {
      axes: option.title,
      answersByLabelSetOption: []
    };

    question.label_set.label_set_options.forEach(labelSetOption => {
      answersByOption.answersByLabelSetOption.push({
        id: labelSetOption.id,
        value: labelSetOption.value,
        answersCount: 0
      });
    });

    result.push(answersByOption);
  });

  userAnswersByQuestion.forEach(userAnswer => {
    userAnswer.answer_options.forEach(option => {
      if (option.label_set_option) {
        const answersByOption = result.find(r => option.question_answer_option && (r.axes === option.question_answer_option.title));
        answersByOption.answersByLabelSetOption.find(a => a.id === option.label_set_option.id).answersCount++;
      }
    });
  });

  return result;
}

/**
 * Get an object with user answers by answer options,
 * userIds and other necessary information to display on charts
 * PROFILES Numeric question type
 * @param question
 * @param users
 * @returns {{}}
 */
function getProfilesChartForNumericType(question, users) {
  let chart = {};

  let data = [
    {count: 0, participants: [], label: 'Over 10M'},
    {count: 0, participants: [], label: 'Under 10M'},
    {count: 0, participants: [], label: 'Under 1mil'},
    {count: 0, participants: [], label: 'Under 100K'},
    {count: 0, participants: [], label: 'Under 10K'}
  ];

  users.forEach(user => {
    for (let i = 0; i < user.attempts[0].answers.length; i++) {
      let answerModel = user.attempts[0].answers[i];
      if (question.id === answerModel.question_id && answerModel.answer) {
        let answer = answerModel.answer;
        //Remove currency delimeters
        answer = answer.replace(/[.,\s]/g, '');

        let numAnswer = parseFloat(answer);
        const userCurrency = user.curr ? user.curr.currency : 'USD';
        if (userCurrency !== 'USD') {
          numAnswer = MoneyConverter.convertCurrency(numAnswer, userCurrency, 'USD');
        }

        if (numAnswer < 10000) {
          data[4].count++;
          data[4].participants.push(user.id);
        } else if (numAnswer < 100000) {
          data[3].count++;
          data[3].participants.push(user.id);
        } else if (numAnswer < 1000000) {
          data[2].count++;
          data[2].participants.push(user.id);
        } else if (numAnswer < 10000000) {
          data[1].count++;
          data[1].participants.push(user.id);
        } else if (numAnswer > 10000000) {
          data[0].count++;
          data[0].participants.push(user.id);
        }
      }
    }
  });

  chart.data = data;

  let usersCount = 0;
  chart.data.forEach(item => usersCount += item.count);

  if (question.question_graph_type === 1 || question.question_graph_type === 4) {
    chart.series = [{
      showInLegend: false,
      stacked: false,
      type: "bar",
      xField: "label",
      yField: ["count"]
    }];
    chart.fields = [chart.series[0].xField, chart.series[0].yField[0]];
    chart.axes = [
      {fields: [chart.series[0].yField[0]], position: 'bottom'},
      {fields: [chart.series[0].xField], position: 'left'}
    ];
  } else if (question.question_graph_type === 2) {
    chart.series = [{
      type: 'pie',
      angleField: "count",
      label: {field: "label"},
    }];
    chart.fields = [chart.series[0].label.field, chart.series[0].angleField, 'participants'];
  }

  let participantsCount = chart.data.map(item => item.count);
  chart.maxDataValue = Math.max(...participantsCount);

  return chart;
}

/**
 * Get an object with user answers by answer options,
 * userIds and other necessary information to display on charts
 * PROFILES Order question type
 * @param question
 * @param users
 * @returns {{}}
 */
function getProfilesChartForOrderType(question, users) {
  let chart = {};
  let data = [];

  let minOrderPos = 1;
  question.question_options.forEach((option, i) => {
    if (option.order_pos < minOrderPos) {
      minOrderPos = option.order_pos;
    }
  });

  const yField = [];
  question.question_options.forEach((option, i) => {
    yField.push(OrderQuestionOptions[i].optionOrder);
    data.unshift({
      label: option.title,
      participants: {}
    });
    question.question_options.forEach((option, j) => {
      data[0][OrderQuestionOptions[j].optionOrder] = 0;
      data[0].participants[OrderQuestionOptions[j].optionOrder] = [];
    });
  });

  users.forEach(user => {
    user.attempts[0].answers.forEach(userAnswersByQuestion => {
      if (userAnswersByQuestion.question_id === question.id) {
        userAnswersByQuestion.answer_options.forEach((item, ind) => {
          if (item.question_answer_option) {
            const index = item.user_order_pos;
            data[item.question_answer_option.order_pos - minOrderPos][OrderQuestionOptions[index].optionOrder]++;
            data[item.question_answer_option.order_pos - minOrderPos].participants[OrderQuestionOptions[index].optionOrder].push(user.id);
          }
        });
      }
    });
  });

  data.forEach(dataItem => {
    dataItem.total = 0;
    for (const prop in OrderQuestionOptions) {
      if (dataItem.hasOwnProperty(OrderQuestionOptions[prop].optionOrder)) {
        dataItem.total += dataItem[OrderQuestionOptions[prop].optionOrder];
      }
    }
  });

  data.reverse();

  chart.data = data;
  const maxDataCount = data.map(item => item.total);
  chart.maxDataValue = Math.max(...maxDataCount);

  chart.series = [{
    showInLegend: true,
    stacked: true,
    type: 'bar',
    xField: 'label',
   yField: yField
  }];

  chart.fields = [];
  chart.fields[0] = chart.series[0].xField;
  for (let i = 0; i < chart.series[0].yField.length; i++) {
    chart.fields[i + 1] = chart.series[0].yField[i];
  }

  chart.axes = [
    {fields: chart.series[0].yField, position: 'bottom'},
    {fields: ['label'], position: 'left'}
  ];

  return chart;
}

/**
 * Get users comments by question
 * @param users
 * @param questionId
 * @returns {Array}
 */
function getComments(users, questionId) {
  let comments = [];
  users.forEach(user => {
    user.attempts[0].answers.forEach(answerModel => {
      if (answerModel.question_id === questionId && answerModel.comment) {
        comments.push({
          comment: answerModel.comment,
          participantId: user.id
        });
      }
    });
  });

  if (comments.length > 0) return comments;
}

/**
 * Get report by company id and questionnaire abbreviation by questionnaire id.
 * Expected `companyId`
 * @param req
 * @param res
 */
ReportsController.getReportsByCompanyId = function (req, res) {
  if (!req.params.companyId) {
    utils.sendJSONresponse(res, 400, {
      "message": "CompanyId field required"
    });
    return;
  }

  HtmlReports.findAll({
    where: {
      cid: req.params.companyId
    },
    include: {
      model: Questionnaire,
      as: 'reportQuestionnaire',
      attributes: ['abbreviation']
    }
  })
    .then(reports => {
      reports = reports.reverse();
      res.status(200).send(utils.formatReportsDate(reports));
    })
    .catch(err => {
      console.log(err);
      res.status(404).json(err);
    });
};

/**
 * Returns report by code. Includes questionnaire type and title by `qid` and company title by `cid`.
 * Expected `code` field.
 * @param req
 * @param res
 */
ReportsController.getReportByCode = function (req, res) {
  if (!req.params.code) {
    utils.sendJSONresponse(res, 400, {
      "message": "Code field required"
    });
    return;
  }

  HtmlReports.findOne({
    where: {
      code: req.params.code
    },
    include: [
      {
        model: Questionnaire,
        as: 'reportQuestionnaire',
        attributes: ['type', 'title'],
      }, {
        model: Company,
        as: 'companies',
        attributes: ['title']
      }]
  })
    .then(report => {
      res.status(200).send(report);
    })
    .catch(err => {
      res.status(404).json(err);
    })
};

/**
 * Set new report name by id.
 * Expected `id`
 * @param req
 * @param res
 */
ReportsController.updateName = function (req, res) {
  HtmlReports.update({name: req.body.name}, {
    where: {
      id: req.body.id
    }
  }).then(() => {
    res.status(200).send({message: 'Report Updated!'});
  }).catch(err => {
    console.log(err);
    res.status(404).json(err);
  });
};

/**
 * Delete report by id
 * Expected `id`
 * @param req
 * @param res
 */
ReportsController.deleteReport = function (req, res) {
  if (!req.params.id) {
    utils.sendJSONresponse(res, 400, {
      "message": "Id field required"
    });
    return;
  }

  HtmlReports.destroy({where: {id: req.params.id}})
    .then(() => {
      res.status(200).send({message: 'Report deleted'});
    })
    .catch(err => {
      console.log(err);
      res.status(404).json(err);
    })
};

/**
 * Delete report by code
 * Expected `code`
 * @param req
 * @param res
 */
ReportsController.deleteReportByCode = function (req, res) {
  if (!req.params.code) {
    utils.sendJSONresponse(res, 400, {
      "message": "Code field required"
    });
    return;
  }

  HtmlReports.destroy({where: {code: req.params.code}})
    .then(() => {
      res.status(200).send({message: 'Report deleted'});
    })
    .catch(err => {
      console.log(err);
      res.status(404).json(err);
    })
};

/**
 * Get companies (with some activity by participants or created less then 9 months ago) by questionnaire id
 * @param req
 * @param res
 */
ReportsController.getKeysByQuestId = function (req, res) {
  if (!req.params.quest_id) {
    utils.sendJSONresponse(res, 400, {
      "message": "Questionnaire id field required"
    });
    return;
  }

  const questId = req.params.quest_id;

  CompanyQuestionnaireMap.findAll(userInfoToReportsQuery(questId))
    .then(res => {
      let filledCompanies = [];
      res.forEach(company => {
        if (company['companyQuests']) {
          filledCompanies.push(company.companyQuests);
        }
      });

      const lastActivityPromises = [];

      filledCompanies.forEach(company => {
        lastActivityPromises.push(getCompanyLastActivity(company));
      });

      return Promise.all(lastActivityPromises)
        .then(lastActivitiesDates => {
          let exportCompanies;

          exportCompanies = [];
          const dayMilliseconds = 1000 * 60 * 60 * 24;
          const todayMilliseconds = new Date().getTime();
          const millisecondsAgo = todayMilliseconds - (dayMilliseconds * 270);
          const dateAgo = new Date(millisecondsAgo);
          for (let i = 0; i < filledCompanies.length; i++) {
            let company = filledCompanies[i];
            if (lastActivitiesDates[i][0]['lastActivity']) {
              if (lastActivitiesDates[i][0]['lastActivity'] >= dateAgo) {
                company.dataValues['lastActivity'] = lastActivitiesDates[i][0]['lastActivity'];
                exportCompanies.push(company);
              }
            } else if (company.date_create >= dateAgo) {
              exportCompanies.push(company);
            }
          }

          // sort results by lastActivity or creation date
          exportCompanies.sort(function (c1, c2) {
            let d1, d2;
            if (!c1.dataValues.lastActivity) {
              c1.dataValues.lastActivity = c1.date_create;
            }
            if (!c2.dataValues.lastActivity) {
              c2.dataValues.lastActivity = c2.date_create;
            }

            d2 = new Date(c2.dataValues.lastActivity).getTime();
            d1 = new Date(c1.dataValues.lastActivity).getTime();
            return d2 - d1;
          });

          return exportCompanies;
        })
    })
    .then(companies => {
      res.status(200).send(companies);
    })
    .catch(err => {
      res.status(404).json(err);
    });
};

/**
 * Get companies (included in Questionnaire) by questionnaire id
 * @param req
 * @param res
 */
ReportsController.getAllKeysByQuestId = function (req, res) {
  if (!req.params.quest_id) {
    utils.sendJSONresponse(res, 400, {
      "message": "Questionnaire id field required"
    });
    return;
  }

  const questId = req.params.quest_id;

  CompanyQuestionnaireMap.findAll(userInfoToReportsQuery(questId))
    .then(res => {
      let filledCompanies = [];
      res.forEach(company => {
        if (company['companyQuests']) {
          filledCompanies.push(company.companyQuests);
        }
      });

      const lastActivityPromises = [];

      filledCompanies.forEach(company => {
        lastActivityPromises.push(getCompanyLastActivity(company));
      });

      return Promise.all(lastActivityPromises)
        .then(lastActivitiesDates => {
          let exportCompanies;

          exportCompanies = [];
          for (let i = 0; i < filledCompanies.length; i++) {
            let company = filledCompanies[i];
            if (lastActivitiesDates[i][0]['lastActivity']) {
                company.dataValues['lastActivity'] = lastActivitiesDates[i][0]['lastActivity'];
                exportCompanies.push(company);
            } else {
              exportCompanies.push(company);
            }
          }

          // sort results by lastActivity or creation date
          exportCompanies.sort(function (c1, c2) {
            let d1, d2;
            if (!c1.dataValues.lastActivity) {
              c1.dataValues.lastActivity = c1.date_create;
            }
            if (!c2.dataValues.lastActivity) {
              c2.dataValues.lastActivity = c2.date_create;
            }

            d2 = new Date(c2.dataValues.lastActivity).getTime();
            d1 = new Date(c1.dataValues.lastActivity).getTime();
            return d2 - d1;
          });

          return exportCompanies;
        })
    })
    .then(companies => {
      res.status(200).send(companies);
    })
    .catch(err => {
      res.status(404).json(err);
    });
};

function getCompanyLastActivity(company) {
  return sequelize.query(
    "select MAX(last_activity_date) as lastActivity from attempts, (select * from users where company_id = :companyId) as usersByCompany where attempts.user_id = usersByCompany.id;",
    {replacements: {companyId: company.get('id')}, type: sequelize.QueryTypes.SELECT})
}


function userInfoToReportsQuery(questId) {
  return {
    where: {
      questionnaire_id: questId
    },
    include: {
      model: Company,
      as: 'companyQuests',
      attributes: ['id', 'title', 'date_create'],
      order: [ ['date_create', 'DESC']]
    }
  }
}

/**
 * Get users by selected questionnaire and companies
 * @param req
 * @param res
 */
ReportsController.getUsersByKeyAndQuestionnaire = function (req, res) {
  if (!req.query.companiesIds || !req.query.questionnaireId) {
    utils.sendJSONresponse(res, 400, {
      "message": "Questionnaire id and companies ids fields required"
    });
    return;
  }

  let companiesIds = req.query.companiesIds.split(',');
  let questionnaireId = parseInt(req.query.questionnaireId, 10);

  const userAttributes = ['id', 'job_title', 'organization', 'department', 'state_name', 'last_attempt', 'city',
    'first_name', 'last_name', 'p_location', 'p_date', 'p_date2', 'company_id', 'p_saved', 'p_groups'];

  User.findAll({
    where: {
      company_id: {
        [Op.or]: companiesIds
      }
    },
    attributes: userAttributes,
    include: [
      {
        model: Attempt,
        as: 'attempts',
        attributes: ['id', 'status', 'end_date'],
        where: {
          /*status: {
            [Op.or]: utils.activeAttemptsStatuses
          },*/
          questionnaire_id: questionnaireId
        },
        include: [{
          model: UserAnswer,
          as: 'answers',
          attributes: ['id', 'comment', 'answer', 'question_id']
        }]
      },
      {
        model: Country,
        as: 'country',
        attributes: ['name']
      },
      {
        model: CareerCategory,
        as: 'career',
        attributes: ['name']
      }
    ]
  })
    .then(users => {
      users = users.filter(user => user.attempts.length > 0 && user.attempts[0].answers.length > 0);
      res.status(200).send(users);
    })
    .catch(err => {
      res.status(404).json(err);
    });
};

ReportsController.sendEmailWithReports = function (req, res) {
  const reportTemplate = req.body.reportTemplate;
  const images = req.body.images;
  const emails = req.body.emails.split(/,|;/).join(',');
  const subject = req.body.subject;

  let mailOptions = {
    from: 'calum.coburn@negotiations.com',
    to: emails,
    subject: subject,
    //html: reportTemplate,
    html: send_utils.toHtml(reportTemplate), // html body
    text: (reportTemplate).replace(/<[^>]*>/g, ' '),
    attachments: []
  };
  images.forEach((image) => {
    mailOptions.attachments.push({
      fileName: 'image.jpg',
      cid: image.imgId,
      path: image.imgBase64
    });
  });

  nm.transporter.sendMail(mailOptions).then(result => {
    res.status(200).send(result);
  }).catch(err => {
    res.status(404).json(err);
  })
};

/**
 * Generates pdf.
 * Expected req.params:
 * - code (report's code)
 */
ReportsController.generatePdf = function (req, res) {
  let url = config.base_url + 'clients/download-pdf-report/' + req.params.code;

  pdfService.generatePDF(url, req.params.name, false)
    .then(pdf => {
      res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length });
      res.status(200).send(pdf);
    }).catch(error => {
      console.log(error);
      res.status(404).json(error);
    });
};

module.exports = ReportsController;
