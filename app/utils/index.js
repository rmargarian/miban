'use strict';

const moment = require('moment');
const crypto = require('crypto');
const {
  Sequelize,
  sequelize,
  Company,
  Currency,
  CareerCategory,
  TrainingCourse,
  Country,
  Attempt,
  Questionnaire,
  QuestionAnswerOption,
  LabelSetOption,
  LabelSet,
  QuestionGroup,
  Question,
  QuestionGroupsQuestionsMap,
  UserAnswerOption,
  UserAnswer,
  User,
  HtmlReports
} = require('../models');

const secret = "rt89w41c75381sf85cf6a61283c9df3f";
const algorithm = "aes256";

/**
 * Returns current date in format 'DD-MMM-YY'
 */
module.exports.getCurrentDate = function() {
  const date = moment(new Date()).format('DD-MMM-YY');
  return date;
};

/**
 * Generate random unique code string
 * @returns {string}
 */
module.exports.getRandomCode = function(size) {
  size = parseInt(size, 10) || 15;
  let text = "";
  let possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < size; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/**
 * Function returns unique HtmlReport code with 'size' length
 * Use 10 attempts to generate the code.
 */
module.exports.getRandomCodeAsync = async function(size) {
  for (let i = 0; i < 10; i++) {
    let code = module.exports.getRandomCode(size);
    const reports = await HtmlReports.findAll({where: {code: code}, attributes: ['code']});
    if (reports.length === 0) {
      return code;
    }
  }
  return 0;
};

module.exports.sendJSONresponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.activeAttemptsStatuses = [2, 3, 4];

module.exports.filterQueryFileds = function (possible, query) {
  return possible.filter((item) => {
    return query.indexOf(item) > -1;
  });
};

/**
 * Helper function to use in sort function as callback for multy sorting
 * @returns {Function}
 */
module.exports.multiSort = function () {
  const sortingOptions = [].slice.call(arguments);

  /**
   * We can pass multiple sort configurations of interface
   *  {
        fieldName?: string
        valueConverterFn?: (value): any,
        reverse?: boolean
        sortFn?: (value): number (-1, 0, 1)
      }
   */

  return function (A, B) {
    let a, b, key, sortingOption, reverse, result, i;

    for (i = 0; i < sortingOptions.length; i++) {
      result = 0;
      sortingOption = sortingOptions[i];

      key = sortingOption.fieldName;

      a = key ? A[key] : A;
      b = key ? B[key] : B;

      /**
       * We can convert value to convenient format before sorting
       */
      if (typeof sortingOption.valueConverterFn !== 'undefined') {
        a = sortingOption.valueConverterFn(a);
        b = sortingOption.valueConverterFn(b);
      }

      /**
       * We can specify the direction either by providing one of the sorting options as a string or passing the reverse option
       *
       * Example:
       * array.sort(multiSort(
         'desc'
         {
           fieldName: 'length',
           valueConverterFn: lengthConverter,
           reverse: true
         }
         ));
       */

      if(typeof sortingOption === 'string') {
        reverse = sortingOption === 'desc' ? -1 : 1;
      } else {
        reverse = (sortingOption.reverse) ? -1 : 1;
      }

      /**
       * We can also pass custom sorting function in sortingOptions
       */
      if (typeof sortingOption.sortFn !== 'undefined') {
        result = sortingOption.sortFn(a, b);
      } else {
        if (a < b) result = reverse * -1;
        if (a > b) result = reverse * 1;
        if (result !== 0) break;
      }
    }
    return result;
  }
};

/**
 * Helper function that formats the report date field to format dd-mm-yyyy hh:mm
 * @param reports
 * @returns {reports: Report[]}
 */

module.exports.formatReportsDate = function (reports) {
  reports.forEach(report => {
    if (report) {
      const oldDateFormat = new Date(report.dt);
      report.dataValues.dt = ('0' + oldDateFormat.getDate()).slice(-2) + '-' + ('0' + (oldDateFormat.getMonth() + 1)).slice(-2) +
        '-' + oldDateFormat.getFullYear() + ' ' + ('0' + oldDateFormat.getHours()).slice(-2) + ':' +
        ('0' + oldDateFormat.getMinutes()).slice(-2);
    }
  });

  return reports;
};

/**
 * Helper function that generates unique count value by field and entity for cloning
 * @param model
 * @param fieldName
 * @param fieldValue
 * @returns {Promise.<TResult>|Promise<never | T>}
 */
module.exports.getUniqueFieldCloneValue = function (model, fieldName, fieldValue) {

  if (fieldValue.indexOf('Clone') === -1) {
    fieldValue = fieldValue + '.+Clone';
  } else {
    fieldValue = fieldValue.slice(0, fieldValue.indexOf('Clone'));
  }
  const query = {where: {}};
  query.attributes = [fieldName];
  query.where[fieldName] = {
    [Sequelize.Op.regexp]: fieldValue
  };

  return model.findAll(query).then(function (clonedRecords) {

    let newCloneValue = 0;

    if (clonedRecords.length > 0) {
      const clonedRecordsValues = [];
      clonedRecords.forEach(model => {
        let splited = model.dataValues[fieldName].split(/([()])/).filter(val => val !== '');
        if (!splited[2]) {
          clonedRecordsValues.push(0);
        } else {
          clonedRecordsValues.push(parseInt(splited[2]));
        }
      });
      clonedRecordsValues.sort();
      const maxNewCloneValue = clonedRecordsValues[clonedRecordsValues.length - 1] + 1;

      for (let i = 0; i < maxNewCloneValue; i++) {
        if (newCloneValue === clonedRecordsValues[i]) {
          newCloneValue++;
          /**Jump on 2 */
          if (newCloneValue === 1) { newCloneValue++; }
        } else {
          break;
        }
      }
    }
    /**
     * Jump on 2 because if we already have one copy (title + ' Clone') without counter,
     * the second copy must have counter (2)
    */
    if (newCloneValue === 1) { newCloneValue++; }
    return newCloneValue;
  });
};

function getUsersAnswerByCompanyIdQuery(companyId, questionnaire_id, userIds, differentKey) {
  const where = differentKey ? {} : { company_id: companyId };
  let userQuery = {
    attributes: ['id', 'first_name', 'last_name',
      'email', 'department', 'organization', 'manager_name', 'job_title', 'p_location', 'p_date',
      'country_id', 'state_name', 'industry_sector', 'city'],
    where: where,
    include: [
      // {model: Country, as: 'country', attributes: ['name']},
      {model: Currency, as: 'curr', attributes: ['currency_name', 'currency']},
      {model: Company, as: 'company', attributes: ['title', 'company_key']},
      {
        model: Attempt,
        as: 'attempts',
        attributes: ['id', 'questionnaire_id', 'user_id', 'end_date', 'status', 'passed_time'],
        where: {
          questionnaire_id: questionnaire_id
          //status: {[Sequelize.Op.or]: [2, 3, 4]}
        },
        include: [{
          model: UserAnswer,
          as: 'answers',
          attributes: ['id', 'comment', 'answer', 'question_id'],
          include: [
            {
              model: UserAnswerOption,
              as: 'answer_options',
              order: ['user_order_pos'],
              attributes: ['question_answer_options_id', 'user_order_pos'],
              include: [
                {
                  model: QuestionAnswerOption,
                  as: 'question_answer_option',
                  attributes: ['id', 'title', 'order_pos']
                },
                {
                  model: LabelSetOption,
                  as: 'label_set_option',
                }
              ],
            },
            {
              model: Question,
              as: 'question',
              where: {
                is_active: 1
              },
              attributes: ['id'],
              include: [
                {
                  model: QuestionAnswerOption,
                  as: 'question_options',
                  attributes: ['id'],
                },
                {
                  model: LabelSet,
                  as: 'label_set',
                  include: {
                    model: LabelSetOption, as: 'label_set_options'
                  }
                }

              ]
            }
          ]
        }]
      },
    ]
  };

  if (userIds) {
    userQuery.where.id = {
      [Sequelize.Op.or]: userIds.split(',')
    }
  }

  return userQuery;
}

module.exports.getUsersAnswerByCompanyIdQuery = getUsersAnswerByCompanyIdQuery;

/**
 * Get data for exports that are based on participants responses
 * Returns array of users and their attempts as well as overall information about questionnaire
 * @param companyId
 * @param questionnaire_id
 * @param userIds
 * @param differentKey (if user not from report key)
 */
module.exports.getDataForReports = function (companyId, questionnaire_id, userIds, differentKey) {
  let returnData = {};

  return Company.findById(companyId)
    .then(company => {
      let userQuery = getUsersAnswerByCompanyIdQuery(companyId, questionnaire_id, userIds, differentKey);

      // Export next fields only if Sh parameter is set to true - check add/edit key modal on front end(right checkboxes)
      removeUnShownFields(userQuery, company);

      return Promise.all([
        User.findAll(userQuery),
        Questionnaire.findById(questionnaire_id, {
          attributes: ['title', 'abbreviation', 'id', 'type'],
        })
      ]);
    })
    .then(([users, questionnaire]) => {
      returnData.users = JSON.parse(JSON.stringify(users));
      returnData.questionnaireInfo = questionnaire;

      return QuestionGroup.findAll({
        attributes: ['id', 'order_pos', 'questionnaire_id', 'title'],
        where: {
          questionnaire_id: questionnaire_id,
          is_active: 1
        },
        order: [
          'order_pos',
          [{model: QuestionGroupsQuestionsMap, as: 'group_questions_map'}, 'question_order', 'asc'],
          [
            {model: QuestionGroupsQuestionsMap, as: 'group_questions_map'},
            {model: Question, as: 'question'},
            {model: QuestionAnswerOption, as: 'question_options'},
            'order_pos', 'desc'
          ],
          [
            {model: QuestionGroupsQuestionsMap, as: 'group_questions_map'},
            {model: Question, as: 'question'},
            {model: LabelSet, as: 'label_set'},
            {model: LabelSetOption, as: 'label_set_options'},
            'order_pos', 'asc'
          ]
        ],
        include: [{
          model: QuestionGroupsQuestionsMap,
          as: 'group_questions_map',
          include: [
            {
              model: Question,
              as: 'question',
              where: {
                is_active: 1
              },
              attributes: ['title', 'order_pos', 'id', 'type', 'is_bonus', 'is_cloud', 'is_sort_hide',
                'is_faces', 'is_active', 'explanation', 'quest_type', 'switch_type_graph',
                'question_graph_type', 'range_interval', 'label_set_id'],
              include: [
                {
                  model: QuestionAnswerOption,
                  as: 'question_options',
                  attributes: ['title', 'order_pos', 'score', 'id', 'correct_answer', 'face_type'],
                },
                {
                  model: LabelSet,
                  as: 'label_set',
                  include: [{
                    model: LabelSetOption, as: 'label_set_options'
                  }]
                }
              ]
            },
          ]
        }],
      });
    })
    .then((questionGroups) => {
      returnData.questionGroups = questionGroups;
      returnData.users.forEach(user => {
        user.attempts.forEach(attempt => {
          //attempt = JSON.parse(JSON.stringify(attempt));
          if (attempt && attempt.answers.length) {
             /**Block needed for support incorrect (duplicated answers) stored in DB */
            const seen = new Set();
            const filteredArr = attempt.answers.filter(el => {
              const duplicate = seen.has(el.question_id);
              seen.add(el.question_id);
              return !duplicate;
            });
            attempt.answers = JSON.parse(JSON.stringify(filteredArr));
            /********************************************************************** */

            attempt.answers.forEach(answer => {
              /**Block needed for support incorrect (duplicated answer_options) stored in DB */
              if (answer && answer.answer_options && answer.answer_options.length) {
                const seenOpt = new Set();

                const filteredOptArr = answer.answer_options.filter(el => {
                  const duplicate = seenOpt.has(el.question_answer_options_id);
                  seenOpt.add(el.question_answer_options_id);
                  return !duplicate;
                });
                answer.answer_options = JSON.parse(JSON.stringify(filteredOptArr));
              }
              /********************************************************************************* */
            });
          }
        })
      });
      return returnData;
    });
};

/**
 * Export next fields only if Sh parameter is set to true - check add/edit key modal on front end(right checkboxes)
 * @param userQuery
 * @param company
 */

function removeUnShownFields(userQuery, company) {
  if (company.show_dept !== 1) {
    userQuery.attributes.splice(userQuery.attributes.indexOf('department'), 1);
  }
  if (company.show_state !== 1) {
    userQuery.attributes.splice(userQuery.attributes.indexOf('state_name'), 1);
  }
  if (company.show_city !== 1) {
    userQuery.attributes.splice(userQuery.attributes.indexOf('city'), 1);
  }
  if (company.show_job_title !== 1) {
    userQuery.attributes.splice(userQuery.attributes.indexOf('job_title'), 1);
  }
  if (company.show_manager_name !== 1) {
    userQuery.attributes.splice(userQuery.attributes.indexOf('manager_name'), 1);
  }
  if (company.show_country === 1) {
    userQuery.include.push({model: Country, as: 'country', attributes: ['name']});
  }
  if (company.show_industry_sector !== 1) {
    userQuery.attributes.splice(userQuery.attributes.indexOf('industry_sector'), 1);
  }
  if (company.show_career_category === 1) {
    userQuery.include.push({model: CareerCategory, as: 'career', attributes: ['name']});
  }
  if (company.show_training_cource === 1) {
    userQuery.include.push({model: TrainingCourse, as: 'training_course', attributes: ['name']});
  }
}

/**
 * Utitlity function configures and returns tree in returnData.users property
 * for each user -> questionnaire -> questionnaire groups -> questions -> answers
 * @param returnData ({questionGroups:..., questionnaireInfo:..., users:...})
 */
module.exports.MakeQuestionnaireAnswersTree = function (returnData) {
  let userInformations = [];

  returnData.users.forEach(user => {
    let userInfo = {
      info: user,
      questionGroups: []
    };

    userInfo.attempt = JSON.parse(JSON.stringify(user.attempts[0]));

    if (!userInfo.attempt || userInfo.attempt.answers.length === 0) {
      return;
    }

    userInfo.questionGroups = returnData.questionGroups.map(group => {
      const groupQuestions = group.group_questions_map.map(questionsMap => {
        if (questionsMap.question.question_options) {
          questionsMap.question.question_options.sort((a, b) => a.order_pos - b.order_pos);
        }
        const answer = userInfo.attempt.answers.find(a => a.question_id === questionsMap.question.id);
        return {
          info: questionsMap.question,
          options: questionsMap.question.question_options,
          answer: answer
        };
      });
      return {
        info: group,
        questions: groupQuestions
      };
    });
    userInformations.push(userInfo);
  });

  returnData.users = userInformations;
  delete returnData.questionGroups;

  return returnData;
};

/**
 * Returns all needed Question includes for supporting 'Edit Question' functionality
 * and to show info to which Questionnaires groups each question is included.
 */
module.exports.getQuestionsIncludes = function () {
  return [
    {
      model: QuestionAnswerOption,
      as: 'question_answer_options'
    },
    {
      model: QuestionGroupsQuestionsMap,
      as: 'question_groups_questions_map',
      attributes: ['question_group_id'],
      include: {
        model: QuestionGroup,
        as: 'question_group',
        attributes: ['questionnaire_id', 'title'],
        include: {
          model: Questionnaire,
          as: 'questionnaire',
          attributes: ['title', 'deleted']
        }
      }
    },
  ];
};

module.exports.unique = function (arr) {
  let obj = {};

  for (let i = 0; i < arr.length; i++) {
    let str = arr[i];
    obj[str] = true;
  }
  return Object.keys(obj);
};

/**
 * Utility function returns number from string.
 * Needed to get first and the last number of filled rows in excel file.
 * Every worksheet has '!ref' property. It's value e.g: "A1:H40".
 * We need to retreive 1 (first row) and 40 (last row).
 * @param value (string in format: firts part - characters, second - numbers. E.g. 'A1')
 */
module.exports.getNumber = function (value) {
  let number = '';
  for (let i = 0; i < value.length; i++) {
    if (!isNaN(parseInt(value[i], 10))) {
      number += value[i];
    }
  }

  return parseInt(number, 10);
}

/**
 * Utility function returns file's extention
 * @param fileName (string)
 * @returns (string)
 */
module.exports.getFileExt = function (fileName) {
  let ext = '';
  const split = fileName.split('.');
  if (split) { ext = split[split.length - 1]; }
  return ext;
}

/**
 * Utility function checks if Object has at least one property.
 * isEmptyObject({}); // true
 * isEmptyObject({foo:'bar'});  // false
 * @param obj (any)
 */
module.exports.isEmptyObject = function (obj) {
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop) && obj[prop]) {
      return false;
    }
  }
  return true;
}

module.exports.encrypt = (text) => {
    if(!text) return '';
    const cipher = crypto.createCipher(algorithm, secret);
    let crypted = cipher.update(text, 'utf-8', 'base64');
    crypted += cipher.final('base64');
    return crypted;
};

module.exports.decrypt = (text) => {
    if(!text) return '';
    text = text.replace(/ /g, '+');
    const decipher = crypto.createDecipher(algorithm, secret);
    let decrypted = decipher.update(text, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
};


/**
 * Fills validUsers array if user in users array is valid:
 * - has first_name, last_name, email,
 * - email is valid
 * Parse date from file (if not empty) and configures Date object.
 * Adds company_id for not existing users (we shouldn't move existing user to another key)
 * @param users (User[])
 * @param companyId (Company id)
 * @returns User[]
 */
module.exports.validateUsers = (users, companyId) => {
  const validUsers = [];
  var emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_\.]+@((([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var nameRegex = /^[a-z][a-z\s-\']*$/i;
  users.forEach(function(us) {
    var user = JSON.parse(JSON.stringify(us));
    var obj = validUsers.find(function (u)  {return u.email === user.email;});
    //Configure correct Date
    if (user.p_date) {
      var parts = user.p_date.toString().split('/');
      var timestamp = Date.parse(parts[1] + '/' + parts[0] + '/' + parts[2]);
      if (!isNaN(timestamp)) {
        user.p_date = moment(new Date(timestamp)).format('YYYY-MM-DD');
      } else {
        user.p_date = '';
      }
    }
    //Add company_id for not existing users
    if (!user.id) {
      user.company_id = companyId;
    }

    if (user.first_name && user.last_name && user.email &&
      emailRegex.test(user.email) && nameRegex.test(user.last_name) &&
      nameRegex.test(user.first_name) && !obj) {
      validUsers.push(user);
    }
  });

  return validUsers;
};
