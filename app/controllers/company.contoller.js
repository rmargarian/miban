'use strict';

const {
  Sequelize,
  sequelize,
  Company,
  Currency,
  Country,
  Attempt,
  Questionnaire,
  QuestionAnswerOption,
  CompanyQuestionnaireMap,
  HtmlReports,
  UserAnswerOption,
  UserAnswer,
  TrainingCourse,
  User
} = require('../models');
const errorHandlers = require('../error-handlers');
const utils = require('../utils');
const MoneyConverter = require('../services/money-converter');
const simDelegate = require('../utils/sim-delegate');

/**
 * check for checkbox fields
 * @param key
 * @returns {boolean}
 */
function isCheckboxKey(key) {
  /**
   * Looking for key with mn,show,edit prefixes
   * Those keys have values(ed,sh,mn) of checkboxes in UI
   */
  if (key.indexOf('mn_') !== -1 || key.indexOf('show_') !== -1 || key.indexOf('edit_') !== -1) {
    return true;
  }
}

function booleanToNumber(boolVal) {
  return boolVal ? 1 : 0
}

function convertBooleans(req) {
  for (let k in req.body) {
    if (isCheckboxKey(k)) {
      req.body[k] = booleanToNumber(req.body[k]);
    }
  }
}

/**
 * Remove old company to questionnaire relations and create new
 * @param companyId
 * @param questionnaire_ids
 */
function updateCompanyQuestionnaires(companyId, questionnaire_ids) {
  return CompanyQuestionnaireMap.destroy({
    where: {
      company_id: companyId,
      questionnaire_id: {
        [Sequelize.Op.notIn]: questionnaire_ids,
      }
    }
  })
    .then(() => {

      const findOrCreateQueryPromises = [];

      questionnaire_ids.forEach((id) => {
        findOrCreateQueryPromises.push(CompanyQuestionnaireMap.findOrCreate({
          where: {
            company_id: companyId,
            questionnaire_id: id
          },
          defaults: {company_id: companyId}
        }))
      });

      return Promise.all(findOrCreateQueryPromises)
    });
};


/**
 * Create Company instance in database
 * @param req
 * @param res
 */
module.exports.create = function (req, res) {
  //key == company_key, title == key_name, email == email, currency_id==RpT Currency in DB
  //those fields are mandatory in app UI
  if (!req.body.title || !req.body.currency_id || !req.body.company_key) {
    utils.sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }
  //If mandatory fields aren't empty  Create a new model of a company(the whole code below)
  req.body.is_set_training_date = req.body.is_set_training_date ? 1 : 0;
  req.body.is_set_training_day = req.body.is_set_training_day ? 1 : 0;
  //get a date of creation of a coompany
  req.body.date_create = new Date();
  // convertBooleans(req);
  // After editing req.body create a new company obj
  let company = new Company(req.body);

  // Save obj
  company.save()
    .then(saved => {
      company = saved;
      if (req.body.questionnaires) {
        return updateCompanyQuestionnaires(company.get('id'), req.body.questionnaires);
      }
    })
    .then(() => {
      return Company.findById(company.get('id'), getCompanyQuery(req))
    })
    .then((company) => {
      /**Send create pfa key request to SIM */
      simDelegate.commandCreatePfaKey(company);
      res.status(200).send(company);
    })
    .catch(err => {
      errorHandlers.dataBaseErrorHandler(err, res);
    });

};

/**
 * Update Company instance by company id
 * @param req
 * @param res
 */
module.exports.update = function (req, res) {
  let company, companyId = req.body.id;
  Company.findById(companyId)
    .then(c => {
      company = c;
      return updateCompanyQuestionnaires(company.get('id'), req.body.questionnaires);
    })
    .then(() => {
      delete req.body.id;
      convertBooleans(req);
      return company.update(req.body);
    })
    .then(() => {
      return Promise.all([Company.findById(companyId, getCompanyQuery(req)), getCompanyLastActivity(company)]);
    })
    .then(([updatedCompany, lastActivity]) => {
      updatedCompany.dataValues['lastActivity'] = lastActivity[0]['lastActivity'];
      /**Send update pfa key request to SIM */
      simDelegate.commandUpdatePfaKey(updatedCompany);
      res.status(200).json(updatedCompany);
    })
    .catch(err => {
      res.status(404).json(err);
    });
};


module.exports.activateQuestionnaire = function (req, res) {
  if (!req.body.cId ||
    !req.body.qId) {
    res.status(400).send({message: 'Some of required fields are missing!'});
    return;
  }
  const cId = req.body.cId;
  const qId = req.body.qId;
  const item = {questionnaire_id: qId, company_id: cId};

  CompanyQuestionnaireMap.create(item)
    .then((resp) => {
      res.status(200).send({
        message: 'Questionnaire Activated'
      });
    })
    .catch(err => {
      res.status(404).json(err);
    });
};

/**
 * Helper function to build get Company query
 * @param req
 * @returns {{where: {}}}
 */
function getCompanyQuery(req) {
  let query = {where: {}};

  query.include = [
    {
      model: CompanyQuestionnaireMap,
      as: 'company-questionnaire-maps',
      include: {model: Questionnaire, as: 'questionnaire', attributes: ['id', 'type', 'title']}
    },
    {
      model: User, attributes: {
        exclude: ['ip']
      },
      as: 'users',
    }
  ];

  // include all attributes by default
  let attributes = Object.keys(Company.attributes);


  // if fields parameter provided include only them and id, date_create
  if (req.query.fields) {
    attributes = JSON.parse(req.query.fields);
    if (attributes.indexOf('id') === -1) {
      attributes.unshift('id');
    }
    if (attributes.indexOf('date_create') === -1) {
      attributes.unshift('date_create');
    }
  }

  // Add real entities
  if (attributes.indexOf("currency_id") > -1) {
    //let index = attributes.indexOf("currency_id");
    //if (index !== -1) attributes.splice(index, 1);
    query.include.push(Currency);
  }

  if (attributes.indexOf("country_id") > -1) {
    //let index = attributes.indexOf("country_id");
    //if (index !== -1) attributes.splice(index, 1);
    query.include.push(Country);
  }

  if (attributes.indexOf("training_course_id") > -1) {
    //let index = attributes.indexOf("training_course_id");
    //if (index !== -1) attributes.splice(index, 1);
    query.include.push(TrainingCourse);
  }

  // calculate participants count by company
  query.attributes = attributes
    .concat([[Sequelize.fn("COUNT", Sequelize.col("users.id")), "usersCount"]]);
  query.group = [Sequelize.col("Company.id"), Sequelize.col("questionnaire_id")];

  return query;
}

/**
 * Get company last activity by the most recent activity of the participants
 * @param company
 * @returns {*}
 */
function getCompanyLastActivity(company) {
  return sequelize.query(
    "select MAX(last_activity_date) as lastActivity from attempts, (select * from users where company_id = :companyId) as usersByCompany where attempts.user_id = usersByCompany.id;",
    {replacements: {companyId: company.get('id')}, type: sequelize.QueryTypes.SELECT});
}

/**
 * Delete Company instance by  company id
 * @param req
 * @param res
 */
module.exports.delete = function (req, res) {
  //get a company id
  const companyId = req.params.id;
  //delete a company instance from the DB by using destroy method
  Company.destroy({
    where: {
      id: companyId
    }
  }).then(id => {
    /**Send delete pfa key request to SIM */
    simDelegate.commandRemovePfaKey({companyId});
    res.status(200).json(id);
  }).catch(err => {
    errorHandlers.dataBaseErrorHandler(err, res);
  });
};

/**
 * Get Company instance by  company id
 * @param req
 * @param res
 */
module.exports.getCompanyById = function (req, res) {
  const companyId = req.params.id;
  const query = {where: {id: companyId}};
  query.include = [
    {
      model: CompanyQuestionnaireMap,
      as: 'company-questionnaire-maps',
      include: {
        model: Questionnaire,
        as: 'questionnaire',
        //attributes: ['id', 'type', 'title'],
        where: {
          deleted: {
            [Sequelize.Op.eq]: 0
          }
        }
      }
    },
    {
      model: User, attributes: {
        exclude: ['ip']
      },
      as: 'users',
    },
  ];

  Company.findOne(query)
    .then(company => {
      res.status(200).send(company);
    })
    .catch(err => {
      res.status(404).json(err);
    });
};

function getReportQuery() {
  let attributes = ['id'];

  let query = {where: {}};
  query.include = {
    model: HtmlReports,
    as: 'reports',
    attributes: ['id', 'cid', 'qid', 'name', 'dt', 'code'],
    include: {
      model: Questionnaire,
      as: 'reportQuestionnaire',
      attributes: ['abbreviation']
    }
  };

  query.attributes = attributes;

  return query;
}

/**
 * Get all the Companies from db filtered by query parameters daysLimit, fields
 * Query parameters: daysLimit: number, fields: string[]
 * @param req
 * @param res
 */
module.exports.getAll = function (req, res) {

  let companies;
  Company.findAll(getCompanyQuery(req))
    .then(c => {
      companies = c;

      Company.findAll(getReportQuery())
        .then(companiesWithReports => {
          companies.forEach(company => {
            for (let i = 0; i < companiesWithReports.length; i++) {
              if (companiesWithReports[i].dataValues.id === company.dataValues.id) {
                company.dataValues.reports = companiesWithReports[i].dataValues.reports;
                break;
              }
            }
          });

          return companies;
        })
        .then(companies => {
          companies.forEach(company => {
            company = utils.formatReportsDate(company.dataValues.reports);
          });

          companies.forEach(company => {
            if (company.dataValues.reports && company.dataValues.reports.length > 0) {
              company.dataValues.reports = company.dataValues.reports.reverse();
            }
          });

          const lastActivityPromises = [];

          companies.forEach(company => {
            lastActivityPromises.push(getCompanyLastActivity(company));
          });

          return Promise.all(lastActivityPromises);
        })
        .then((lastActivitiesDates) => {

          let exportCompanies;

          // filter company by daysLimit
          if (req.query.daysLimit) {
            exportCompanies = [];
            const dayMilliseconds = 1000 * 60 * 60 * 24;
            const todayMilliseconds = new Date().getTime();
            const millisecondsAgo = todayMilliseconds - (dayMilliseconds * parseInt(req.query.daysLimit));
            const dateAgo = new Date(millisecondsAgo);
            for (let i = 0; i < companies.length; i++) {
              let company = companies[i];
              // compare daysLimit to lastActivity if one is present, else to the creation date
              if (lastActivitiesDates[i][0]['lastActivity']) {
                if (lastActivitiesDates[i][0]['lastActivity'] >= dateAgo) {
                  // include lastActivity to the company response object
                  company.dataValues['lastActivity'] = lastActivitiesDates[i][0]['lastActivity'];
                  exportCompanies.push(company);
                }
              } else if (company.date_create >= dateAgo) {
                exportCompanies.push(company);
              }
            }
          } else {
            let counter = 0;
            exportCompanies = companies.map(company => {
              // include lastActivity to the company response object
              company.dataValues['lastActivity'] = lastActivitiesDates[counter][0]['lastActivity'];
              counter++;
              return company;
            });
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

          res.status(200);
          res.json(exportCompanies);
        })
        .catch(err => {
          errorHandlers.dataBaseErrorHandler(err, res);
        })
    });
};

function getUserAnswersByQuestionId(questionId, attemptId) {
  return UserAnswer.findOne({
    attributes: ['id'],
    where: {
      attempt_id: attemptId,
      question_id: questionId
    }
  }).then(answer => {
    if (!answer) {
      return answer;
    }

    return UserAnswerOption.findOne({
      attributes: [],
      include: [{model: QuestionAnswerOption, as: 'question_answer_option', attributes: ['title']}],
      where: {
        answer_id: answer.get('id')
      }
    });
  });
}

/**
 * Convert string value of the length field to numeric for sorting
 * @param length
 * @returns {*}
 */
function lengthConverter(length) {
  let converted;
  if (!length) {
    return 0;
  }
  switch (length.dataValues.title) {
    case 'under a week':
      converted = 1;
      break;
    case '2-4 weeks':
      converted = 2;
      break;
    case '1-2 months':
      converted = 3;
      break;
    case '2-3 months':
      converted = 4;
      break;
    case '3-6 months':
      converted = 5;
      break;
    case '6-12 months':
      converted = 6;
      break;
    case '1 year +':
      converted = 7;
      break;
    default:
      converted = 0;
  }

  return converted;
}

/**
 * Returns unique clone counter for cloning functionality on front-end
 * @param req
 * @param res
 */
module.exports.getUniqueFieldCloneValue = function (req, res) {
  if (!req.query.field || !req.query.fieldValue) {
    utils.sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }
  utils.getUniqueFieldCloneValue(Company, req.query.field, req.query.fieldValue).then(newValue => {
    res.status(200).json(newValue);
  });
};

function sizeConverter(size) {
  if (!size) {
    return 0;
  }

  return parseFloat(size);
}

/**
 * Generate best negotiators export
 * Query parameters: userIds: number[]
 * @param req
 * @param res
 * @constructor
 */
module.exports.ExportBestNegotiators = function (req, res) {
  let exportData;
  const companyId = req.params.company_id;

  let userQuery = {
    attributes: ['id', 'first_name', 'last_name'],
    where: {
      company_id: companyId
    },
    include: [
      {model: Currency, as: 'curr', attributes: ['currency']},
      {model: Company, as: 'company', attributes: ['title']},
      {
        model: Attempt,
        as: 'attempts',
        attributes: ['id', 'questionnaire_id', 'last_activity_date'],
        order: ['last_activity_date', 'DESC'],
        include: [{
          model: Questionnaire,
          as: 'questionnaire',
          attributes: ['id', 'type']
        }]
      },
    ]
  };

  // include only a set of users if userIds query parameter is passed
  if (req.query.userIds) {
    userQuery.where.id = {
      [Sequelize.Op.or]: req.query.userIds.split(',')
    }
  }

  // Fetch relevant currencies
  MoneyConverter.updateCurrencies()
    .then(function () {
      return Company.findById(companyId);
    })
    .then(company => {
      // Export next fields only if Sh parameter is set to true - check add/edit key modal on front end(right checkboxes)
      if (company.show_manager_name === 1) {
        userQuery.attributes.push('manager_name')
      }
      if (company.show_dept === 1) {
        userQuery.attributes.push('department');
      }
      if (company.show_city === 1) {
        userQuery.attributes.push('city');
      }
      if (company.show_state === 1) {
        userQuery.attributes.push('state_name')
      }
      if (company.show_job_title === 1) {
        userQuery.attributes.push('job_title')
      }
      if (company.show_country === 1) {
        userQuery.include.push({model: Country, as: 'country', attributes: ['name']});
      }
      return User.findAll(userQuery);
    })
    .then(async (users) => {
      exportData = users.map(user => user.dataValues);
      const sizeAnswerPromises = [];
      const outcomesAnswerPromises = [];
      const booksAnswerPromises = [];
      const coursesAnswerPromises = [];
      const teamNegAnswerPromises = [];
      const teamPrepAnswerPromises = [];
      const lengthAnswerPromises = [];
      const flexibilityAnswerPromises = [];
      const prepTimeAnswerPromises = [];
      const nameRankAnswerPromises = [];
      const reviewAnswerPromises = [];
      const company = await Company.findOne({
        where: {id: companyId},
        attributes: ['id'],
        include: [{
          model: Questionnaire, as: 'companyQuests',
          through: {attributes: ['questionnaire_id', 'company_id']},
          where: {
            deleted: {
              [Sequelize.Op.eq]: 0
            },
            type: 2
          }
        }]
      });
      let qId;
      if (company && company.companyQuests && company.companyQuests.length) {
        qId = company.companyQuests[company.companyQuests.length - 1].id;
      } else {
        utils.sendJSONresponse(res, 400, {
          "message": "Empty Data"
        });
        return;
      }
      for (const user of users) {

        // Find attempt with Questionnaire type = Profile
        const negotiatorsDiagnosticProfileAttempt = user.attempts.find(attempt => (attempt.questionnaire && attempt.questionnaire.id === qId));

        // If user passed Negotiators 'Diagnostic Profile questionnaire' or
        // 'Negotiation Diagnostic Profile - Archieved' (Team Neg, Team Prep and Flexibility columns)
        // fill export data of such user with questions answers.
        // Else leave fields empty

        if (negotiatorsDiagnosticProfileAttempt) {
          const booksAnswer = await UserAnswer.findOne({
            attributes: ['question_id'],
            where: {
              attempt_id: negotiatorsDiagnosticProfileAttempt.get('id'),
              question_id: [605, 89]
            }
          });
          const booksAnswerId = booksAnswer ? booksAnswer.question_id : 89;

          const sizeAnswer = await UserAnswer.findOne({
            attributes: ['question_id'],
            where: {
              attempt_id: negotiatorsDiagnosticProfileAttempt.get('id'),
              question_id: [120, 608]
            }
          });
          const sizeAnswerId = sizeAnswer ? sizeAnswer.question_id : 120;

          sizeAnswerPromises.push(UserAnswer.findOne({
            attributes: ['answer'],
            where: {
              attempt_id: negotiatorsDiagnosticProfileAttempt.get('id'),
              question_id: sizeAnswerId
            }
          }));
          outcomesAnswerPromises.push(UserAnswer.findOne({
            attributes: ['comment'],
            where: {
              attempt_id: negotiatorsDiagnosticProfileAttempt.get('id'),
              question_id: 93
            }
          }));

          booksAnswerPromises.push(UserAnswer.findOne({
            attributes: ['comment'],
            where: {
              attempt_id: negotiatorsDiagnosticProfileAttempt.get('id'),
              question_id: booksAnswerId
            }
          }));

          coursesAnswerPromises.push(UserAnswer.findOne({
            attributes: ['comment'],
            where: {
              attempt_id: negotiatorsDiagnosticProfileAttempt.get('id'),
              question_id: 88
            }
          }));

          lengthAnswerPromises.push(getUserAnswersByQuestionId(123, negotiatorsDiagnosticProfileAttempt.get('id')));
          prepTimeAnswerPromises.push(getUserAnswersByQuestionId(106, negotiatorsDiagnosticProfileAttempt.get('id')));
          nameRankAnswerPromises.push(getUserAnswersByQuestionId(107, negotiatorsDiagnosticProfileAttempt.get('id')));
          reviewAnswerPromises.push(getUserAnswersByQuestionId(113, negotiatorsDiagnosticProfileAttempt.get('id')));

          teamNegAnswerPromises.push(getUserAnswersByQuestionId(129, negotiatorsDiagnosticProfileAttempt.get('id')));
          teamPrepAnswerPromises.push(getUserAnswersByQuestionId(128, negotiatorsDiagnosticProfileAttempt.get('id')));
          flexibilityAnswerPromises.push(getUserAnswersByQuestionId(122, negotiatorsDiagnosticProfileAttempt.get('id')));
        } else {
          sizeAnswerPromises.push(null);
          outcomesAnswerPromises.push(null);
          booksAnswerPromises.push(null);
          coursesAnswerPromises.push(null);
          lengthAnswerPromises.push(null);
          prepTimeAnswerPromises.push(null);
          nameRankAnswerPromises.push(null);
          reviewAnswerPromises.push(null);

          teamNegAnswerPromises.push(null);
          teamPrepAnswerPromises.push(null);
          flexibilityAnswerPromises.push(null);
        }
      }

      Promise.all([
        Promise.all(sizeAnswerPromises),
        Promise.all(outcomesAnswerPromises),
        Promise.all(booksAnswerPromises),
        Promise.all(coursesAnswerPromises),
        Promise.all(teamNegAnswerPromises),
        Promise.all(teamPrepAnswerPromises),
        Promise.all(lengthAnswerPromises),
        Promise.all(flexibilityAnswerPromises),
        Promise.all(prepTimeAnswerPromises),
        Promise.all(nameRankAnswerPromises),
        Promise.all(reviewAnswerPromises),
        Company.findOne({ where: {id: companyId},
          include: [ {model: Currency, attributes: ['currency']} ]
        })
      ]).then(([sizes, outcomes, books, courses, teamNegs, teamPreps, lengths, flexibilities, prepTimes, nameRanks, reviews, adminCurrencyModel]) => {

        exportData.forEach((row, index) => {

          let sizeValue = sizes[index] ? sizes[index].get('answer') : null;

          if (sizeValue) { sizeValue = sizeValue.replace(/[.,\s]/g, ''); }

          if (!isColumnEmpty(sizes)) {
            row.size = sizeValue ?
            (MoneyConverter.convertCurrency(parseFloat(sizeValue), row.curr.currency || adminCurrencyModel.Currency.currency, 'USD') / 1000000).toFixed(2) : null;
          }
          if (!isColumnEmpty(outcomes)) {
            row.outcome = outcomes[index] ? outcomes[index].get('comment') : null;
          }
          if (!isColumnEmpty(books)) {
            row.book = books[index] ? books[index].get('comment') : null;
          }
          if (!isColumnEmpty(courses)) {
            row.course = courses[index] ? courses[index].get('comment') : null;
          }
          if (!isColumnEmpty(teamNegs)) {
            row.teamNeg = teamNegs[index] && teamNegs[index].get('question_answer_option') ? teamNegs[index].get('question_answer_option') : null;
          }
          if (!isColumnEmpty(teamPreps)) {
            row.teamPrep = teamPreps[index] && teamNegs[index].get('question_answer_option') ? teamPreps[index].get('question_answer_option') : null;
          }
          if (!isColumnEmpty(lengths)) {
            row.length = lengths[index] && lengths[index].get('question_answer_option') ? lengths[index].get('question_answer_option') : null;
          }
          if (!isColumnEmpty(flexibilities)) {
            row.flexibility = flexibilities[index] && flexibilities[index].get('question_answer_option') ? flexibilities[index].get('question_answer_option') : null;
          }
          if (!isColumnEmpty(prepTimes)) {
            row.prepTime = prepTimes[index] && prepTimes[index].get('question_answer_option') ? prepTimes[index].get('question_answer_option') : null;
          }
          if (!isColumnEmpty(nameRanks)) {
            row.nameRank = nameRanks[index] && nameRanks[index].get('question_answer_option') ? nameRanks[index].get('question_answer_option') : null;
          }
          if (!isColumnEmpty(reviews)) {
            row.review = reviews[index] && reviews[index].get('question_answer_option') ? reviews[index].get('question_answer_option') : null;
          }
        });

        exportData.sort(utils.multiSort(
          {
            fieldName: 'size',
            valueConverterFn: sizeConverter,
            reverse: true
          },
          {
            fieldName: 'length',
            valueConverterFn: lengthConverter,
            reverse: true
          }
        ));
        res.status(200);
        res.json(exportData);
      });
    })
    .catch(err => {
      errorHandlers.dataBaseErrorHandler(err, res);
    });
};

function isColumnEmpty(arr) {
  for (const value of arr) {
    if (value) {
      return false;
    }
  }
  return true;
}

/**
 * Generate participants responses export
 * Params: company_id: number
 * Query parameters: userIds: number[], questionnaire_ids: number[]
 * @param req
 * @param res
 * @constructor
 */
module.exports.ExportParticipantsResponses = function (req, res) {
  const companyId = parseInt(req.params.company_id);
  const questionnaire_id = req.params.questionnaire_id;
  const userIds = req.query.userIds;

  MoneyConverter.updateCurrencies()
    .then(function () {
      return utils.getDataForReports(companyId, questionnaire_id, userIds);
    })
    .then(returnData => {
      return utils.MakeQuestionnaireAnswersTree(returnData);
    })
    .then(exportData => {
      /*exportData.users.forEach(user => {
        user.questionGroups.forEach(group => {
          group.questions.forEach(question => {
            // Numeric question
            if (question.info.type === 6 && question.answer && question.answer.answer) {
              let answer = question.answer.answer;
              //Remove currency delimeters
              answer = answer.replace(/[.,\s]/g, '');

              let numAnswer = parseFloat(answer) || 0;
              const userCurrency = user.info.curr ? user.info.curr.currency : 'USD';
              if (userCurrency !== 'USD') {
                numAnswer = MoneyConverter.convertCurrency(numAnswer, userCurrency, 'USD');
              }
              question.answer.answer = numAnswer.toString();
            }
          });
        });
      });*/
      res.status(200).json(exportData);
    })
    .catch(err => {
      errorHandlers.dataBaseErrorHandler(err, res);
    });
};

/**
 * Check if company_key field exists in db
 * Params: company_key: string
 * @param req
 * @param res
 */
module.exports.isCompanyKeyValid = function (req, res) {
  Company.find({where: {company_key: req.params.company_key}})
    .then(function (keyName) {
      const isValid = keyName ? false : true;
      res.status(200).send(isValid);
    }).catch(function (err) {
    res.status(404).json(err);
  });
};

/**
 * Check if title field exists in db
 * Params: title: string
 * @param req
 * @param res
 */
module.exports.isCompanyTitleValid = function (req, res) {
  Company.find({where: {title: req.params.title}})
    .then(function (keyTitle) {
      const isValid = keyTitle ? false : true;
      res.status(200).send(isValid);
    }).catch(function (err) {
    res.status(404).json(err);
  });
};

module.exports.getSortedByActivity = function (req, res) {
  const q_id = req.params.id;
  const d = new Date();
  d.setMonth(d.getMonth() - 9);

  Company.findAll({
    attributes: ['id', 'title', 'company_key', 'date_create', 'admin_email', 'admin',
      [Sequelize.fn("COUNT", Sequelize.col("users->attempts.id")), "attemptsCount"]
    ],
    include: [{
      model: CompanyQuestionnaireMap,
      as: 'company-questionnaire-maps',
      include: [{
        model: Questionnaire,
        as: 'questionnaire',
        attributes: ['id'],
        where: {
          id: q_id
        }
      }]
    }, {
      model: User,
      as: 'users',
      attributes: ['id'],
      include: {
        model: Attempt,
        as: 'attempts',
        attributes: ['id'],
        where: {
          last_activity_date: {
            [Sequelize.Op.gt]: d
          }
        }
      }
    }],
    group: [Sequelize.col("Company.id"),
      Sequelize.col("company-questionnaire-maps.questionnaire_id")
    ]
  })
    .then(function (keys) {
      res.status(200).send(keys);
    }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

module.exports.getIdByKey = function (req, res) {
  Company.find({
    where: {company_key: req.params.key},
    attributes: ['id']
  })
    .then(function (value) {
      res.status(200).send(value);
    })
    .catch(function (err) {
      res.status(404).json(err);
    });
};

