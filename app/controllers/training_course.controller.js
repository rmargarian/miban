'use strict';
const {TrainingCourse} = require('../models');
var Sequelize = require('sequelize');
let TrainingCourseController = {};
const utils = require('../utils');

TrainingCourseController.getAll = function (req, res) {
  TrainingCourse.findAll().then(function (courses) {
    res.status(200).send(courses);
  }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

TrainingCourseController.create = function (req, res) {
  let newTrainingCourse = req.body;

  if (!req.body.order_pos || !req.body.name) {
    utils.sendJSONresponse(res, 400, {
      "message": "Name field required"
    });
    return;
  } else {
    TrainingCourse.create(newTrainingCourse)
      .then(function () {
        res.status(200).send({message: 'New training course created!'});
      })
      .catch(function (err) {
        console.log(err);
        res.status(404).json(err);
      });
  }
};

/**
 * Method to remove training course and reduces the position number of each next one
 * @param req
 * @param res
 */

TrainingCourseController.remove = function (req, res) {
  const id = req.params.id;
  const order = req.params.order;

  TrainingCourse.destroy({
    where: {id: id}
  }).then(function () {
    TrainingCourse.decrement(
      'order_pos', {
        where: {order_pos: {[Sequelize.Op.gt]: order}}
      })
  }).then(function (ok) {
    res.json(ok);
    res.status(200);
  }).catch(function (err) {
    console.log(err);
    res.status(404).json(err);
  });
};

/**
 * Update training course order_pos field after dragging on front-end
 * @param req
 * @param res
 */
TrainingCourseController.update = function (req, res) {
  const trainingCourses = req.body;

  TrainingCourse.destroy({
    where: {},
    truncate: true
  }).then(() => {
    let promises = [];
    trainingCourses.forEach(course => {
      promises.push(TrainingCourse.create(course));
    });
    Promise.all(promises).then(courses => {
      res.status(200).send(courses);
    }).catch(err => {
      res.status(404).json(err);
    })
  });
};

TrainingCourseController.updateName = function (req, res) {
  const trainingCourse = req.body;
  TrainingCourse.findById(req.body.id)
    .then(course => {
      course.update(trainingCourse)
        .then(() => {
          res.status(200).json({message: 'Update success'});
        })
        .catch(err => {
          res.status(404).json(err);
        })
    })
};

TrainingCourseController.isNameValid = function (req, res) {
  TrainingCourse.find({where: {name: req.params.name}})
    .then(function (course) {
      res.status(200).send(!course);
    }).catch(function (err) {
    res.status(404).json(err);
  });
};

TrainingCourseController.getUniqueFieldCloneValue = function (req, res) {
  if (!req.query.field || !req.query.fieldValue) {
    utils.sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }
  utils.getUniqueFieldCloneValue(TrainingCourse, req.query.field, req.query.fieldValue).then(newValue => {
    res.status(200).json(newValue);
  });
};


module.exports = TrainingCourseController;
