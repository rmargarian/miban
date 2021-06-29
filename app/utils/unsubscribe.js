const crypt = require('./');
const { Unsubscribe, User, UserQuestionnaireContact } = require('../models');

/**
 * Utility function finds or creates new unsubscriber for particular Questionnaire.
 * Updates or creates 'contact' field (set to 0) for found user for particular Questionnaire
 * @param {string contains encrypted object: {email, questionnaire_id} } data
 */
module.exports.add = function(data) {
  try {
    let unsub = crypt.decrypt(data);
    unsub = JSON.parse(unsub);
    if (unsub.email && unsub.questionnaire_id) {
      Unsubscribe.findOrCreate({where: {email: unsub.email, questionnaire_id: unsub.questionnaire_id}})
      .spread(function (record, created) {
        if (created) {
          console.log('UNSUB: ADDED new email: ' + unsub.email);
        }
        return User.findOne({where: {email: unsub.email}, attributes: ['id']});
      }).then(user => {
        if (user) {
          updateUserQuestionnaireContact(user.id, unsub.questionnaire_id);
        }
      }).catch(function (err) {
        console.log("UNSUB: Add email ERROR:");
        console.log(err);
      });
    }

  } catch (error) {
    console.log('UNSUB: Parse Email Subject error');
    console.log(error);
  }
};

function updateUserQuestionnaireContact(u_id, q_id) {
  UserQuestionnaireContact
    .findOrCreate({
      where: { user_id: u_id, id_questionnaire: q_id },
      defaults: { contact: 0 }
    })
    .spread((contact, created) => {
      console.log("UNSUB: updateUserQuestionnaireContact SUCCESS");
      if (!created) {
        return contact.update({contact: 0});
      }
    }).catch( (error) => {
      console.log("UNSUB: updateUserQuestionnaireContact ERROR:");
      console.log(error);
    });
}
