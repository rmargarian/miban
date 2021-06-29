'use strict';
const { UserAnswerOption, UserAnswer } = require('../models');

let UserAnswerOptionsController = {};

/**
 * Creates, updates or deletes UserAnswerOptions
 * CREATE: if req.body.data item doesn't contain 'id'
 * UPDATE: if req.body.data item contains 'id'
 * DELETE: All items from req.body.delete_ids array
 * Expected params in req.body:
 * 'data' - required (UserAnswerOption[])
 * 'delete_ids' - required (number[])
 */
UserAnswerOptionsController.createOrUpdate = function (req, res) {
  let queries = [];
  const answer_id = req.body.data.length ? req.body.data[0].answer_id : '';
  UserAnswer.find({
    where: { id: answer_id },
    include: {model: UserAnswerOption, as: 'answer_options'}
  }).then(answer => {
    let userAnswerOptions = [];
    if (answer && answer.answer_options && answer.answer_options.length) {
      userAnswerOptions = answer.answer_options;
    }
    req.body.data.forEach((element) => {
      if (!element.answer_id) {
        res.status(400).send({message: 'Answer id is missing!'});
        return;
      }
      if(element.id) {
        queries.push(UserAnswerOption.update(element, {where: { id: element.id }}));
      } else {
        const exists = userAnswerOptions.find(opt => opt.question_answer_options_id === element.question_answer_options_id);
        if (!exists) {
          queries.push(UserAnswerOption.create(element));
        }
      }
    });
    queries.push(UserAnswerOption.destroy({ where: { id: req.body.delete_ids }}));
  
    return Promise.all(queries)
  })
  .then(function () {
    res.status(200).end();
  }).catch(function (err) {
    res.status(404).json(err);
  });
}

module.exports = UserAnswerOptionsController;
