'use strict';
const { UsersQuestionnaireAttemptLimit, Attempt } = require('../models');

let UserQuestionnaireAttemptLimitController = {};

/**
 * Creates or Updates records with new status, attempts limit and report values
 * If new status === 1 (REOPENED) sets attempt's passed_time to 0
 * Expected params in req.body:
 * 'data': {values: {status: ..., limit: ..., report: ...}}
 * 'ids': number[] - array with user ids
 */
UserQuestionnaireAttemptLimitController.updateAttemptLimits = function (req, res) {
  let queries = [];
  req.body.data.forEach((element, index) => {
    if(element.values.status) {
      const attempt = { status: element.values.status };
      if (element.values.status === 1) {  //REOPENED
        attempt.passed_time = 0;
        attempt.is_note_sent = 0;
      }
      queries.push(
        Attempt.update(attempt, {
          where: { user_id: req.body.ids, questionnaire_id: element.id }
        })
      );

      if(index === req.body.data.length - 1 && (!element.values.limit && !element.values.report)) {
        Promise.all(queries)
        .then(function () {
          res.status(200).end();
        }).catch(function (err) {
          res.status(404).json(err);
        });
      }
    }
    if(element.values.limit || element.values.report) {
      req.body.ids.forEach((id, index2) => {
        UsersQuestionnaireAttemptLimit
        .findOne({where: {user_id: id, id_questionnaire: element.id}})
        .then(function (attempt_limit) {
          if(attempt_limit) {
            queries.push(attempt_limit.update({
              attempts_limit: element.values.limit || attempt_limit.attempts_limit || 1,
              report_completion: element.values.report || attempt_limit.report_completion || 1 })
            );
          } else {
            queries.push(UsersQuestionnaireAttemptLimit.create({
              user_id: id,
              id_questionnaire: element.id,
              attempts_limit: element.values.limit || 1,
              report_completion: element.values.report || 1})
            );
          }

          if(index === req.body.data.length - 1 && index2 === req.body.ids.length - 1) {
            Promise.all(queries)
            .then(function () {
              res.status(200).end();
            }).catch(function (err) {
              res.status(404).json(err);
            });
          }
        });
      });
    }
  });
}

UserQuestionnaireAttemptLimitController.getByUserIds = function (req, res) {
  const ids = req.params.user_ids.split(',');
  UsersQuestionnaireAttemptLimit.findAll(
    {where: {user_id: ids}})
  .then(function (attempts_limits) {
    res.status(200).send(attempts_limits);
  }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

module.exports = UserQuestionnaireAttemptLimitController;
