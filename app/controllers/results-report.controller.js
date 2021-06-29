'use strict';
const { ResultReport, Questionnaire } = require('../models');
const resTable = require('../utils/result-table');

let ResultsReportController = {};

ResultsReportController.getByCode = function (req, res) {

  ResultReport.findOne({
    where: { code: req.params.code },
      include: [{ model: Questionnaire, as: 'questionnaire' }]
  })
  .then(function (report) {
    res.status(200).send(report);
  }).catch(function (error) {
    res.status(404).json(error);
  });
};

module.exports = ResultsReportController;
