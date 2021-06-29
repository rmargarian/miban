'use strict';

const {
  Sequelize,
  Question,
  QuestionAnswerOption,
  LabelSet,
  SlidersTag,
  LabelSetOption
} = require('../models');
const errorHandlers = require('../error-handlers');
const utils = require('../utils');

function getQuestionQuery(include_questionnaires, attributes) {
  let query = {
    attributes: attributes,
    //where: { deleted: { [Sequelize.Op.ne]: 1 } }
  };
  if (!include_questionnaires) {
    return query;
  }
  query.include = utils.getQuestionsIncludes();

  return query;
}

module.exports.getAll = function (req, res) {
  let fieldsAttributes;
  if (!req.query.fields) {
    fieldsAttributes = Object.keys(Question.attributes);
  } else {
    fieldsAttributes = req.query.fields.split(',');
  }

  Question.findAll(getQuestionQuery(req.query.include_questionnaires, fieldsAttributes))
    .then(questions => {
      questions = sortQuestionAnswerOptions(questions);
      res.status(200).send(updateNumberAnswers(questions));
    }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

function sortQuestionAnswerOptions(questions) {
  for (let i = 0; i < questions.length; i++) {
    if (questions[i].question_answer_options && questions[i].question_answer_options.length > 0) {
      questions[i].question_answer_options.sort(function (a, b) {
        return a.order_pos - b.order_pos;
      });
    }
  }
  return questions;
}

function updateNumberAnswers(questions) {
  questions.forEach(question => {
    if (question.question_answer_options) {
      question.dataValues.item_numbers = question.question_answer_options.length;
    }
  });
  return questions;
}

module.exports.getQuestionById = function (req, res) {
  let questionId = req.params.id;
  Question.findById(questionId).then(question => {
    res.status(200).send(question);
  }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

module.exports.getQuestionsLabelOptions = function (req, res) {
  LabelSet.findAll().then(labels => {
    res.status(200).send(labels);
  }).catch(function (err) {
    console.log(err);
    res.status(404).json(err);
  });
};

module.exports.create = function (req, res) {
  if (!req.body.title || !req.body.question_graph_type || !req.body.type || !req.body.quest_type) {
    utils.sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }

  let promise;
  switch (req.body.type) {
    case 5:
    case 6:
    case 8:
      promise = createQuestionWithNoOptions(req.body);
      break;
    case 1:
    case 2:
    case 3:
    case 4:
      promise = createQuestionWithOptions(req.body);
      break;
    default:
      utils.sendJSONresponse(res, 400, {
        "message": "Provided question type doesn't exist"
      });
      return;
  }

  return promise
    .then(function (question) {
      res.status(200).send(question);
    })
    .catch(function (err) {
      console.log(err);
      res.status(404).json(err);
    });
};

function createQuestionWithNoOptions(question) {
  let promises = [];
  let newQuestion;
  let sliderTags = question.slider_tags;

  return Question.create(question).then(createdQuestion => {
    newQuestion = createdQuestion;
    if (sliderTags && sliderTags.length > 0) {
      sliderTags.forEach(tag => {
        tag.id_question = createdQuestion.id;
        tag.is_default === true ? tag.is_default = 1 : tag.is_default = 0;
        tag.slider = 'min';
        promises.push(SlidersTag.create(tag));
      });
      return Promise.all(promises)
        .then(options => {
          return newQuestion;
        })
    }
    return createdQuestion;
  });
}

function createQuestionWithOptions(question) {
  let questAnswerOption = question.question_answer_options;
  delete question["question_answer_options"];
  const promises = [];
  let newQuestion;

  return Question.create(question).then(quest => {
    newQuestion = quest;
    questAnswerOption.forEach(option => {
      delete option.id;
      option.question_id = quest.dataValues.id;
      option.correct_answer = 0;
      if (!option.score) {
        option.score = 0;
      }
      promises.push(QuestionAnswerOption.create(option));
    });
    return Promise.all(promises)
      .then(options => {
        return newQuestion;
      })
  });
}

module.exports.edit = function (req, res) {
  let promise;
  switch (req.body.type) {
    case 5:
    case 6:
    case 8:
      promise = updateQuestionWithNoOptions(req.body);
      break;
    case 1:
    case 2:
    case 3:
    case 4:
      promise = updateQuestionWithOptions(req.body);
      break;
    default:
      utils.sendJSONresponse(res, 400, {
        "message": "Provided question type doesn't exist"
      });
      return;
  }

  promise.then(function () {
    res.status(200).send({message: 'Question updated!'});
  }).catch(function (err) {
    console.log(err);
    res.status(404).json(err);
  });
};

function updateQuestionWithOptions(questionInfo) {
  const answerOptions = questionInfo.question_answer_options;
  answerOptions.forEach(option => {
    option.correct_answer = 0;
    option.question_id = questionInfo.id;
    if (!option.score) {
      option.score = 0;
    }
  });
  delete questionInfo['question_answer_options'];
  let promises = [];

  return Question.findById(questionInfo.id)
    .then(question => {
      if (questionInfo.type === 1 || questionInfo.type === 2) {
        questionInfo.label_set_id = null;
      }
      promises.push(question.update(questionInfo));
    })
    .then(function () {
      return QuestionAnswerOption.destroy({
        where: {question_id: questionInfo.id}
      })
        .then(function () {
          return answerOptions.forEach(option => {
            promises.push(QuestionAnswerOption.create(option));
          });
        });
    })
    .then(function () {
      return Promise.all(promises);
    });
}

function updateQuestionWithNoOptions(questionInfo) {
  let promises = [];

  let sliderTags = questionInfo.slider_tags;
  let questionId = questionInfo.id;

  return SlidersTag.destroy({where: {id_question: questionId}})
    .then(function () {
      if (sliderTags && sliderTags.length > 0) {
        questionInfo.range_from_tag = null;
        questionInfo.range_from_value = null;
        questionInfo.range_to_tag = null;
        questionInfo.range_to_value = null;
        questionInfo.range_percentages = null;
        questionInfo.range_interval = null;
        sliderTags.forEach(tag => {
          tag.id_question = questionInfo.id;
          tag.is_default === true ? tag.is_default = 1 : tag.is_default = 0;
          tag.slider = 'min';
          promises.push(SlidersTag.create(tag));
        });
        return Promise.all(promises).then(function () {
          return Question.findById(questionInfo.id).then(question => {
            delete question.slider_tags;
            return QuestionAnswerOption.destroy({where: {question_id: questionInfo.id}}).then(function () {
              return question.update(questionInfo);
            });
          });
        })
      } else {
        return Question.findById(questionInfo.id).then(question => {
          return QuestionAnswerOption.findAll({where: {question_id: questionInfo.id}}).then(answer_options => {
            if (answer_options && answer_options.length > 0) {
              return QuestionAnswerOption.destroy({where: {question_id: questionInfo.id}}).then(function () {
                return question.update(questionInfo);
              })
            } else {
              return question.update(questionInfo);
            }
          });
        });
      }
    })
}

/**
 * Sets questions 'deleted' value to 1.
 * Expected req.params: string with questions ids separated by comma
 * or only one id.
 */
module.exports.delete = function (req, res) {
  const ids = req.params.ids.split(',');
  const queries = [];

  Question.findAll({where: {id: ids}}).then(questions => {
    questions.forEach(question => {
      queries.push(question.update({deleted: 1}));
    });
    return Promise.all(queries)
  }).then(result => {
    res.status(200);
    res.send({message: 'Question deleted!'});
  })
    .catch(err => {
      errorHandlers.dataBaseErrorHandler(err, res);
    });
};

/**
 * Delete question (by id) Permanently
 */
module.exports.deletePermanently = function (req, res) {
  Question.destroy({where: {id: req.params.id}})
    .then(() => {
      res.status(200).send({message: 'Question Deleted!'});
    }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
}

/**
 * Sets question's 'deleted' value to 0.
 * Expected req.body param: id
 */
module.exports.restore = function (req, res) {
  Question.update({deleted: 0}, {
    where: {id: req.body.id}
  })
    .then(() => {
      res.status(200).send({message: 'Question Updated!'});
    }).catch(function (err) {
    res.status(404).json(err);
  });
}

module.exports.getSliderTagsByQuestionId = function (req, res) {
  console.log(req.params.id);

  SlidersTag.findAll({where: {id_question: req.params.id}, attributes: ['tag', 'value', 'is_default', 'position']})
    .then(sliderTags => {
      res.status(200).send(sliderTags);
    })
    .catch(err => {
      res.status(404).json(err);
    });
};

module.exports.getLabelOptionsById = function (req, res) {
  console.log(req.params.id);

  LabelSetOption.findAll({
    where: {label_set_id: req.params.id},
    order: ['order_pos'],
    attributes: ['order_pos', 'value', 'id']
  })
    .then(labesSetOptions => {
      res.status(200).send(labesSetOptions);
    })
    .catch(err => {
      res.status(404).json(err);
    })
};

module.exports.createNewLabelSet = function (req, res) {
  const title = req.body.title;
  const options = req.body.data;
  let promises = [];

  LabelSet.create({title: title, is_system: 0}).then(label => {
    console.log(label);
    options.forEach(option => {
      option.label_set_id = label.dataValues.id;
      promises.push(LabelSetOption.create(option));
    });
    Promise.all(promises)
      .then(function () {
        res.status(200).send({message: 'label options created'});
      })
      .catch(function (err) {
        res.status(404).json(err);
      });
  });
};

module.exports.deleteLabelSet = function (req, res) {
  const id = req.params.id;

  LabelSetOption.destroy({where: {label_set_id: id}}).then(function () {
    LabelSet.destroy({where: {id: id}})
      .then(function () {
        res.status(200).send({message: 'Label set deleted'});
      })
      .catch(err => {
        res.status(404).json(err);
      });
  });
};

module.exports.editLabelSet = function (req, res) {
  const id = req.body.id;
  const title = req.body.title;
  const options = req.body.data;

  let promises = [];
  LabelSet.findOne({where: {id: id}})
    .then(label => {
      if (label.title !== title) {
        promises.push(label.update({title: title}));
      }
    })
    .then(function () {
      LabelSetOption.destroy({where: {label_set_id: id}})
        .then(function () {
          options.forEach(option => {
            option.label_set_id = id;
            promises.push(LabelSetOption.create(option));
          });
          Promise.all(promises)
            .then(function () {
              res.status(200).send({message: 'Options updated'});
            })
            .catch(err => {
              res.status(404).json(err);
            })
        })
    });
};

module.exports.getUniqueFieldCloneValue = function (req, res) {
  if (!req.query.field || !req.query.fieldValue) {
    utils.sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }
  utils.getUniqueFieldCloneValue(Question, req.query.field, req.query.fieldValue).then(newValue => {
    res.status(200).json(newValue);
  });
};

/**
 * Checks if title is in use.
 * Expected req.body param: 'title' (question's title)
 */
module.exports.isTitleValid = function (req, res) {
  Question.find({where: {title: req.body.title}})
    .then(function (question) {
      const isValid = question ? false : true;
      res.status(200).send(isValid);
    })
    .catch(function (err) {
      res.status(404).json(err);
    });
};
