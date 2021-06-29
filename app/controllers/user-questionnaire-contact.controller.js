'use strict';
const { UserQuestionnaireContact } = require('../models');

let UserQuestionnaireContactController = {};

// Create or Update records with new contact value
UserQuestionnaireContactController.updateContacts = function (req, res) {
  if (!req.body.data) {
    res.status(200).json({
      message: 'No records to update!'
    });
    return;
  }
  req.body.data.forEach((element, index) => {
    if (!element.user_id || !element.id_questionnaire || !element.contact) {
      res.status(400).json({
        message: 'You need to pass Questionnare id, User id and Contact for each user!'
      });
      return;
    }
    UserQuestionnaireContact
    .findOrCreate({where: {user_id: element.user_id, id_questionnaire: element.id_questionnaire},
      defaults: {contact: element.contact}})
    .spread((contact, created) => {
      if(created && (index === req.body.data.length - 1)) res.status(200).send(contact);
      else {
        UserQuestionnaireContact
        .findOne({where: {user_id: element.user_id, id_questionnaire: element.id_questionnaire}})
        .then(function (user) {
          user.update({contact: element.contact});
        })
        .then(() => {
          if(index === req.body.data.length - 1) res.status(200).send({message: 'Contacts Updated!'});
        })
      }
    }).catch(function (error) {
      console.log(error);
      res.status(404).json(error);
    });
  });
}

module.exports = UserQuestionnaireContactController;
