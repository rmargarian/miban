const {
  Company, Questionnaire, Attempt, QuestionGroupsQuestionsMap, UserAnswer,
  SendEmailTemplate, QuestionGroup, CompanyQuestionnaireMap, Sequelize
} = require('../models');
const Op = Sequelize.Op;
const utils = require('../utils');
const errorHandlers = require('../error-handlers');
const shared = require('../../shared');

let QuestionnaireController = {};

/**
 * Creates new acronym if acronym not empty.
 * Max acronym's length = 4 symbols,
 * so if origin acronym length <= 3, we are adding 'count' at the tail,
 * else we replace last acronym's character with count.
 * @param acronym (string: origin acronym)
 * @param count (number: count of Questionnare copies)
 */
let setNewAcronym = function (acronym, count) {
  if (!acronym) return '';
  if (count === 0) count++;
  if (acronym.length <= 3) {
    acronym += count.toString();
  } else {
    acronym = acronym.replace(/.$/, count.toString());
  }

  return acronym;
}

let setQuestionnairesEnabledStatus = function (questionnaires, selectedUserIds) {
  let questionnairesWithStatusPromises = [];
  questionnaires.forEach(questionnaire => {
    if (questionnaire) {
      questionnairesWithStatusPromises.push(
        Attempt.findAll({
          where: {
            questionnaire_id: questionnaire.id,
            [Op.or]: [{user_id: selectedUserIds}],
            /*status: {
              [Op.or]: utils.activeAttemptsStatuses
            }*/
          },
          include: [{model: UserAnswer, as: 'answers'}]
        }).then(attempts => {
          for (let i = 0; i < attempts.length; i++) {
            if (attempts[i] !== null && attempts[i].dataValues.answers && attempts[i].dataValues.answers.length > 0) {
              questionnaire.dataValues.enabled = true;
              break;
            }
          }
          return questionnaire;
        })
      );
    }

  });

  return Promise.all(questionnairesWithStatusPromises);
};

// Fetch all Questionnaires include Companies by company id
QuestionnaireController.getAllbyCompany = (req, res) => {
  const company_id = req.params.company_id;
  Company.findOne({
    where: {id: company_id},
    attributes: ['id'],
    include: [{
      model: Questionnaire, as: 'companyQuests',
      through: {attributes: ['questionnaire_id', 'company_id']},
      where: {
        deleted: {
          [Op.eq]: 0
        }
      }
    }]
  }).then(quests => {
    res.status(200).send(quests);
  }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

QuestionnaireController.getAll = (req, res) => {
  let query = {
    where: {deleted: {[Op.eq]: 0}},
    include: [{model: QuestionGroup, as: 'q_groups'}]
  };
  let attributes;
  if (req.query.fields) {
    attributes = JSON.parse(req.query.fields);
    if (attributes.indexOf('id') === -1) {
      attributes.unshift('id');
    }
  }

  query.attributes = attributes;

  Questionnaire.findAll(query)
    .then(questionnaires => {
      res.status(200);
      res.json(questionnaires);
    }).catch(err => {
    errorHandlers.dataBaseErrorHandler(err, res);
  })
};

QuestionnaireController.create = function (req, res) {
  if (!req.body.type ||
    !req.body.title ||
    !req.body.incomplete_timeout) {
    res.status(400).send({message: 'Some of required fields are missing!'});
    return;
  }

  Questionnaire.create(req.body)
    .then(function (questionnaire) {
      res.status(200).send(questionnaire);
    }).catch(function (err) {
    res.status(404).json(err);
  });
}

QuestionnaireController.update = function (req, res) {
  if (!req.body.type ||
    !req.body.title ||
    !req.body.incomplete_timeout) {
    res.status(400).send({message: 'Some of required fields are missing!'});
    return;
  }
  Questionnaire.update(req.body, {
    where: {id: req.body.id}
  }).then((result) => {
    if (req.body.deleted) {
      CompanyQuestionnaireMap.destroy({where: {questionnaire_id: req.body.id}});
      return SendEmailTemplate.destroy({where: {quest_id: req.body.id}});
    } else
      return result;
  })
    .then(() => {
      res.status(200).send({message: 'Questionnaire Updated!'});
    }).catch(function (err) {
    res.status(404).json(err);
  });
}

/**
 * Clones Questionnaire with Questions Groups contents.
 * Expected req.body param: 'id'
 */
QuestionnaireController.clone = function (req, res) {
  if (!req.body.id) {
    res.status(400).send({message: 'Some of required fields are missing!'});
    return;
  }
  let newId;
  let newQuestionnaire;
  Questionnaire.findOne({where: {id: req.body.id}})
    .then((result) => {
      newQuestionnaire = result.dataValues;
      //data.title += ' - Clone';
      delete newQuestionnaire.id;
      return utils.getUniqueFieldCloneValue(Questionnaire, 'title', newQuestionnaire.title)

    }).then(count => {
    newQuestionnaire.title = shared.setCloneSuffix(newQuestionnaire.title, count, ' - Clone');
    newQuestionnaire.abbreviation = setNewAcronym(newQuestionnaire.abbreviation, count);
    /**Clone Questionnaire*/
    return Questionnaire.create(newQuestionnaire);
  })
    .then((newQ) => {
      newId = newQ.id;
      return QuestionGroup.findAll(
        {
          where: {questionnaire_id: req.body.id},
          include: [
            {model: QuestionGroupsQuestionsMap, as: 'group_questions_map'}
          ]
        });
    }).then((groups) => {
    /**Clone all Questionnaire's groups */
    if (!groups.length) {
      res.status(200).send(newId.toString());
      return;
    }
    let queries = [];
    groups.forEach((group, index) => {
      let newData = group.dataValues;
      newData.questionnaire_id = newId;
      delete newData.id;
      QuestionGroup.create(newData)
        .then((newG) => {
          group.group_questions_map.forEach(map => {
            let newMap = map.dataValues;
            newMap.question_group_id = newG.id;
            /**Clone all questions maps related to particular group */
            queries.push(QuestionGroupsQuestionsMap.create(newMap));
          });
          if (index === groups.length - 1) {
            Promise.all(queries).then(() => {
              res.status(200).send(newId.toString());
            }).catch(function (err) {
              res.status(404).json(err);
            });
          }
        });
    });
  }).catch(function (err) {
    res.status(404).json(err);
  });
}

QuestionnaireController.delete = function (req, res) {
  Questionnaire.destroy({where: {id: req.params.id}})
    .then(() => {
      res.status(200).send({message: 'Questionnaire Deleted!'});
    }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

QuestionnaireController.getCompletedQuestionnaires = function (req, res) {
  const selectedUserIds = req.query.usersIds.split(',');
  let companyIds = req.query.company_ids.split(',');

  CompanyQuestionnaireMap.findAll({
    where: {
      company_id: {
        [Sequelize.Op.or]: companyIds
      }
    },
    include: [{
      model: Questionnaire, as: 'questionnaire',
      attributes: ['description', 'id', 'title', 'type'],
    }]
  })
    .then(questionnairesMap => {
      const questionnaires = questionnairesMap.map(map => map.questionnaire);
      return setQuestionnairesEnabledStatus(questionnaires, selectedUserIds);
    })
    .then(questionnaires => {
      questionnaires = questionnaires.map(questionnaire => {
        questionnaire.dataValues.company_questionnaire_maps = undefined;
        return questionnaire;
      });
      res.status(200).send(questionnaires);
    })
    .catch(error => {
      console.log(error);
      res.status(404).json(error);
    });
};

/**
 * Checks if acronym is in use.
 * Expected req.body param: 'acronym' (questionnaire's acronym)
 */
QuestionnaireController.isAcronymValid = function (req, res) {
  Questionnaire.find({where: {abbreviation: req.body.acronym}})
    .then(function (questionnaire) {
      const isValid = questionnaire ? false : true;
      res.status(200).send(isValid);
    }).catch(function (err) {
    res.status(404).json(err);
  });
}

module.exports = QuestionnaireController;
