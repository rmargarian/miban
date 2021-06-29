'use strict';
const {
  Sequelize,
  QuestionGroup,
  QuestionGroupsQuestionsMap,
  Question,
  Questionnaire,
  QuestionAnswerOption,
  SlidersTag,
  LabelSet,
  LabelSetOption } = require('../models');
const utils = require('../utils');

let QuestionGroupController = {};

// Fetch all QuestionnaireGroups (with Questions in each group) by Questionnaire id

/**
 * Fetch all QuestionnaireGroups (with Questions in each group) by Questionnaire id
 * Required req.params is 'id' (Questionnaire id)
 */
QuestionGroupController.getAllbyQuestionnaireId = (req, res) => {
  const include = utils.getQuestionsIncludes();
	QuestionGroup.findAll(
    {where: {questionnaire_id: req.params.id},
    include: [
      {model: QuestionGroupsQuestionsMap, as: 'group_questions_map',
      include: [{model: Question, as: 'question', where: { deleted: 0},
        include: include
      }]
    }]
	}).then(quests => {
    res.status(200).send(quests);
	}).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

/**
 * Returns  Questionnaire ['title' field] including all groups
 * (even not active to retreive Questionnaire title even if there are no active groups)
 * Each group contains Group data with 'group_questions_map' array (with active questions only)
 * If there are no active questions in the qroup 'group_questions_map' will be empty
 * Required req.params is 'id' (Questionnaire id)
 */
QuestionGroupController.getAllbyQuestionnaireIdWithFullData = (req, res) => {
  Questionnaire.findOne(
    {where: {id: req.params.id}, attributes: ['title'],
    include: [{ model: QuestionGroup, as: 'q_groups',
      include: [{model: QuestionGroupsQuestionsMap, as: 'group_questions_map',
          include: [{model: Question, as: 'question',
          where: {deleted: {[Sequelize.Op.ne]: 1 }, is_active: {[Sequelize.Op.ne]: 0 }},
            include: [
              {model: QuestionAnswerOption, as: 'question_answer_options'},
              {model: SlidersTag, as: 'sliderTags'},
              {model: LabelSet, as: 'label_set',
                include: {model: LabelSetOption, as: 'label_set_options'}}
            ]
          }]
        }]
    }]
  }
	).then(quests => {
    res.status(200).send(quests);
	}).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

QuestionGroupController.create = function (req, res) {
  if (!req.body.questionnaire_id ||
    !req.body.title) {
    res.status(400).send({message: 'Some of required fields are missing!'});
    return;
  }

  QuestionGroup.max('order_pos',
  {where: {questionnaire_id: req.body.questionnaire_id}})
  .then(max => {
    if (!max) max = 0;
    let group = req.body;
    group.order_pos = ++max;

    return QuestionGroup.create(group);
  }).then(function (questionnaire) {
    res.status(200).send({message: 'QuestionGroup Created.'});
  }).catch(function (err) {
    res.status(404).json(err);
  });
}

// Delete QuestionGroups by ids
QuestionGroupController.delete = function (req, res) {
  const ids = req.params.ids.split(',');

  QuestionGroup.destroy({ where: { id: ids }})
  .then(() => {
    res.status(200).send({message: 'QuestionGroups Deleted!'});
  }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
}

QuestionGroupController.update = function (req, res) {
  QuestionGroup.update(req.body, {
    where: { id: req.body.id }
  })
  .then(() => {
    res.status(200).send({message: 'QuestionGroup Updated!'});
  }).catch(function (err) {
    res.status(404).json(err);
  });
}

/**
 * Moves passed questions (deletes them (if they belongs to group) from that qroup)
 * into the passed group.
 * Or Copies questions if 'isCopy' param passed.
 * Expected req.body fields:
 * - group_id: Group id to which selected questions should be moved,
 * - items {question_id:..., question_group_id:...}: Array with questions-groups map,
 *   each value contains 'question_id' and 'question_group_id' - id of group
 *   to which selected question included (or 'MoveTo' group id if question from 'UNASSIGNED' group),
 * - isCopy: passed in 'Copy Question' case.
 */
QuestionGroupController.moveToGroup = function (req, res) {
  let queries = [];
  QuestionGroupsQuestionsMap.max('question_order',
  {where: {question_group_id: req.body.group_id}})
  .then(max => {
    if(!max) max = 0;

    req.body.items.forEach((item, index) => {
      QuestionGroupsQuestionsMap
        .findOne({where: {
          question_group_id: item.question_group_id,
          question_id: item.question_id}})
        .then((q_g_map) => {
          if(q_g_map && item.question_group_id === req.body.group_id) {
            queries.push(q_g_map.update({
              question_order: ++max })
            );
          } else if(q_g_map && item.question_group_id !== req.body.group_id && !req.body.isCopy) {
            queries.push(q_g_map.destroy());
          }
          if(!q_g_map || (q_g_map && item.question_group_id !== req.body.group_id)) {
            queries.push(QuestionGroupsQuestionsMap.findOrCreate(
              { where: {
                  question_group_id: req.body.group_id,
                  question_id: item.question_id},
                defaults: {question_order: ++max}})
            );
          }
          if(index === req.body.items.length - 1) {
            Promise.all(queries)
            .then(function () {
              res.status(200).end();
            }).catch(Sequelize.ValidationError, function (err) {
              // validation errors
              res.status(422).send({message: err.error.errors[0].message});
            }).catch(function (err) {
              res.status(404).json(err.message);
            });
          }
        });
    });
  }).catch(function (err) {
    res.status(404).json(err.error.message);
  });
}

QuestionGroupController.moveToItem = function (req, res) {
  let queries = [];
  let order = req.body.order;

  QuestionGroupsQuestionsMap
    .findAll({
      where: {
        question_group_id: req.body.group_id,
        question_order: {[Sequelize.Op.gt]: req.body.order} }
    }).then((tail_questions) => {
      tail_questions.forEach((tail_question) => {
        queries.push(tail_question.update({
          question_order: tail_question.question_order + req.body.items.length
        }));
      });

      req.body.items.forEach((item, index) => {
        QuestionGroupsQuestionsMap
          .findOne({
            where: {
              question_group_id: item.question_group_id,
              question_id: item.question_id
            }
          }).then((q_g_map) => {
            if (q_g_map && item.question_group_id === req.body.group_id) {
              queries.push(q_g_map.update({
                question_order: ++order
              }));
            } else if (q_g_map && item.question_group_id !== req.body.group_id) {
              queries.push(q_g_map.destroy());
            }
            if (!q_g_map || (q_g_map && item.question_group_id !== req.body.group_id)) {
              queries.push(QuestionGroupsQuestionsMap.create({
                question_group_id: req.body.group_id,
                question_id: item.question_id,
                question_order: ++order
              }));
            }
            if (index === req.body.items.length - 1) {
              Promise.all(queries)
                .then(function () {
                  res.status(200).end();
                }).catch(Sequelize.ValidationError, function (err) {
                  // validation errors
                  res.status(422).send({message: err.error.errors[0].message});
                }).catch(function (err) {
                  res.status(404).json(err);
                });
            }
          });
      });
    });
}

QuestionGroupController.sortGroup = function (req, res) {
  let queries = [];
  let order = req.body.order;

  QuestionGroup
    .findAll({
      where: {
        questionnaire_id: req.body.questionnaire_id,
        order_pos: {
          [Sequelize.Op.gt]: req.body.order
        }
      }
    }).then((tail_groups) => {
      tail_groups.forEach((tail_group) => {
        queries.push(tail_group.update({
          order_pos: tail_group.order_pos + req.body.items.length
        }));
      });

      req.body.items.forEach((item, index) => {
        QuestionGroup
          .findOne({
            where: {
              id: item.id
            }
          }).then((group) => {
            queries.push(group.update({
              order_pos: ++order
            }));
            if (index === req.body.items.length - 1) {
              Promise.all(queries)
                .then(function () {
                  res.status(200).end();
                }).catch(Sequelize.ValidationError, function (err) {
                  // validation errors
                  res.status(422).send({
                    message: err.error.errors[0].message
                  });
                }).catch(function (err) {
                  res.status(404).json(err);
                });
            }
          });
      });
    });
}

QuestionGroupController.deleteMaps = function (req, res) {
  let queries = [];
    req.body.items.forEach((item, index) => {
      QuestionGroupsQuestionsMap
        .findOne({where: {
          question_group_id: item.question_group_id,
          question_id: item.question_id}})
        .then((q_g_map) => {
          if(q_g_map) {
            queries.push(q_g_map.destroy());
          }
          if(index === req.body.items.length - 1) {
            Promise.all(queries)
            .then(function () {
              res.status(200).end();
            }).catch(Sequelize.ValidationError, function (err) {
              // validation errors
              res.status(422).send({message: err.error.errors[0].message});
            }).catch(function (err) {
              res.status(404).json(err.error.message);
            });
          }
        });
    });
}

module.exports = QuestionGroupController;
