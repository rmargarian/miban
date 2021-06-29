'use strict';

const dateFormat = require('dateformat');
const config = require('../config/config');
const enums = require('../enums/enums');
const secure = require('./auth');
const faceServise = require('../services/faces.service');
const { User, Attempt, Currency, CareerCategory, Country, Company, Unsubscribe } = require('../models');
/**
 * Utility function returns current date in format 'YYYY-MM-DD HH:mm:ss'
 */
module.exports.getFormatedCurrentDate = function () {
  return dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
};

/**
 * Utility function returns template with correct data from
 * user, key, questionnaire instead of CONSTATNTS in curly brackets.
 * @param tpl ({email_subject:..., tpl_content:...})
 * @param user (User) can be empty object ({})
 * @param key (Company)
 * @param q (Questionnaire)
 * @param path ('change-key'/'auth'/'reg'...) can be empty string ('')
 * @param completedList (string with users emails) can be empty string ('')
 * @param timeoutList (string with users emails) can be empty string ('')
 */
module.exports.parseTemplate = function (tpl, user, key, q, path, completedList, timeoutList) {
  const fullName = (user.first_name || '') + ' ' + (user.last_name || '');
  const regLink = user.id ? createRegUrl(key.id, q.id, user.id, q.type, path) : '';
  const peLink = createPeUrl(q.type);
  const userLink = user.id ? createChangeKeyUrl(key.id, q.id, user.id, user.passwd, q.type, path) : '';
  const currDate = dateFormat(new Date(), "mm/dd/yy");

  tpl.email_subject = tpl.email_subject.replace(/{FIRSTNAME}/g, user.first_name || '');
  tpl.email_subject = tpl.email_subject.replace(/{LASTNAME}/g, user.last_name || '');
  tpl.email_subject = tpl.email_subject.replace(/{KEY}/g, key.company_key || '');
  tpl.email_subject = tpl.email_subject.replace(/{PENAME}/g, q.title || '');
  tpl.email_subject = tpl.email_subject.replace(/{SPONSORNAME}/g, key.sponsor_name || '');

  tpl.tpl_content = tpl.tpl_content.replace(/{SPONSORNAME}/g, key.sponsor_name || '');
  tpl.tpl_content = tpl.tpl_content.replace(/{MANAGERNAME}/g, user.manager_name || '');
  tpl.tpl_content = tpl.tpl_content.replace(/{FIRSTNAME}/g, user.first_name || '');
  tpl.tpl_content = tpl.tpl_content.replace(/{LASTNAME}/g, user.last_name || '');
  tpl.tpl_content = tpl.tpl_content.replace(/{FULLNAME}/g, fullName);
  tpl.tpl_content = tpl.tpl_content.replace(/{PASSWORD}/g, user.passwd || '');
  tpl.tpl_content = tpl.tpl_content.replace(/{PENAME}/g, q.title || '');
  tpl.tpl_content = tpl.tpl_content.replace(/{PEDESCRIP}/g, q.description || '');

  tpl.tpl_content = tpl.tpl_content.replace(/{PEURL}/g, peLink || '');
  tpl.tpl_content = tpl.tpl_content.replace(/{REG_FORM_LINK}/g, regLink || '');
  tpl.tpl_content = tpl.tpl_content.replace(/{USER_LINK}/g, userLink || '');

  tpl.tpl_content = tpl.tpl_content.replace(/{EMAIL}/g, user.email || '');

  tpl.tpl_content = tpl.tpl_content.replace(/{KEY}/g, key.company_key || '');
  tpl.tpl_content = tpl.tpl_content.replace(/{KEY_NAME}/g, key.title || '');
  tpl.tpl_content = tpl.tpl_content.replace(/{KEY_OLD}/g, user.company ? (user.company.company_key || '') : '');
  tpl.tpl_content = tpl.tpl_content.replace(/{KEY_NAME_OLD}/g, user.company ? (user.company.title || '') : '');

  tpl.tpl_content = tpl.tpl_content.replace(/{DATE}/g, currDate);
  tpl.tpl_content = tpl.tpl_content.replace(/{ADMINNAME}/g, key.admin || '');
  tpl.tpl_content = tpl.tpl_content.replace(/{ADMINEMAIL}/g, key.admin_email);
  tpl.tpl_content = tpl.tpl_content.replace(/{CAREER_CATEGORY}/g, user.career ? user.career.name : '');
  tpl.tpl_content = tpl.tpl_content.replace(/{JOBTITLE}/g, user.job_title || '');
  tpl.tpl_content = tpl.tpl_content.replace(/{COUNTRY}/g, user.country ? user.country.name : '');
  tpl.tpl_content = tpl.tpl_content.replace(/{CITY}/g, user.city || '');
  tpl.tpl_content = tpl.tpl_content.replace(/{COMPLETED_LIST}/g, completedList);
  tpl.tpl_content = tpl.tpl_content.replace(/{TIMEOUT_LIST}/g, timeoutList);

  tpl.tpl_content = tpl.tpl_content.replace(/{LION}/g, faceServise.getAnimal('{LION}'));
  tpl.tpl_content = tpl.tpl_content.replace(/{LEOPARD}/g, faceServise.getAnimal('{LEOPARD}'));
  tpl.tpl_content = tpl.tpl_content.replace(/{CHEETAH}/g, faceServise.getAnimal('{CHEETAH}'));
  tpl.tpl_content = tpl.tpl_content.replace(/{HYENA}/g, faceServise.getAnimal('{HYENA}'));
  tpl.tpl_content = tpl.tpl_content.replace(/{WOLF}/g, faceServise.getAnimal('{WOLF}'));

  tpl.tpl_content = tpl.tpl_content.replace(/\n/g, "<br />");

  return tpl;
};

/**
 * Utility function Finds users which have attempt status (in param)
 * for questionnaire (in param)
 * and which belongs to key (in param).
 * Returns promise with string (contains users emails separated by comma).
 * @param {company id} companyId
 * @param {questionnaire id} qId
 * @param {attempt's status} status
 */
module.exports.getUserListByAttemptStatus = function(companyId, qId, status) {
  let query = {
    attributes: ['id', 'email', 'first_name', 'last_name', 'job_title', 'state_name'],
    where: {company_id: companyId},
    include: [
      {model: Country, as: 'country'},
      {model: Attempt, as: 'attempts',
        attributes: ['id', 'end_date'],
        where: {questionnaire_id: qId, status: status}},
    ]
  };

  return User.findAll(query)
   .then(users => {
      users.sort((a, b) => {
        return new Date(b.attempts[0].end_date).getTime() - new Date(a.attempts[0].end_date).getTime();
      });
      let list = '';
      const size = users.length;
      users.forEach((user, index) => {
        let person = size - (index) + ')  ';
        person += (user.first_name || '') + ' ' + (user.last_name || '') + ' - ';
        if (user.job_title) { person += user.job_title + ', '; }
        if (user.state_name) { person += user.state_name + ', '; }
        if (user.country) { person += user.country.name + ', '; }
        person += user.email || '';
        person += '\n';

        list += person;
      });
      return list;
    })
    .catch(err => {
      return err;
    });
};

/**
 * Utility function Finds users which have attempt status (in param) for questionnaire (in param)
 * from ALL keys
 * Returns promise with string (contains users emails separated by comma).
 * @param {questionnaire id} qId
 * @param {attempt's status} status
 */
module.exports.getUserListByAttemptStatusAll = function(qId, status) {
  let query = {
    attributes: ['id', 'email', 'first_name', 'last_name', 'job_title', 'state_name'],
    include: [
      {model: Country, as: 'country'},
      {model: Company, as: 'company', attributes: ['title', 'company_key'] },
      {model: Attempt, as: 'attempts',
        attributes: ['id', 'end_date'],
        where: {questionnaire_id: qId, status: status}},
    ]
  };

  return User.findAll(query)
   .then(users => {
      users.sort((a, b) => {
        return new Date(b.attempts[0].end_date).getTime() - new Date(a.attempts[0].end_date).getTime();
      });
      let list = '';
      const size = users.length;
      users.forEach((user, index) => {
        let person = size - (index) + ')  ';
        person += (user.first_name || '') + ' ' + (user.last_name || '') + ' - ';
        if (user.job_title) { person += user.job_title + ', '; }
        if (user.state_name) { person += user.state_name + ', '; }
        if (user.country) { person += user.country.name + ', '; }
        person += user.email || '';
        person += ' [' + (user.company.title || '') + ']';
        person += '\n';

        list += person;
      });
      return list;
    })
    .catch(err => {
      return err;
    });
};

/**
 * Utility function finds User's data needed for sending email
 * for questionnaire (in param)
 * and which belongs to key (in param).
 * Returns promise with User[] (contains 'curr', 'career', 'country', 'company').
 * @param {user ids} ids[]
 */
module.exports.getUserDataForEmail = function(ids) {
  return User.findAll({ where: { id: ids} ,
    include: [
      {model: Currency, as: 'curr', attributes: ['currency_name', 'currency']},
      {model: CareerCategory, as: 'career', attributes: ['name']},
      {model: Country, as: 'country', attributes: ['name']},
      {model: Company, as: 'company' }
    ]
  }).catch(err => {
    return err;
  });
};

/**
 * Returns 'profiles'/'assessments'/'feedback' email depends on questionnaire type
 * @param {Number} qType
 * @returns {String}
 */
module.exports.getPFAEmail = function(qType) {
  let email = enums.PFA_EMAILS.PROFILES;
  switch(qType) {
    case enums.QuestionnaireType.PROFILE:
      email = enums.PFA_EMAILS.PROFILES;
    break;
    case enums.QuestionnaireType.ASSESSMENT:
      email = enums.PFA_EMAILS.ASSESSMENTS;
    break;
    case enums.QuestionnaireType.FEEDBACK:
      email = enums.PFA_EMAILS.FEEDBACK;
    break;
  }

  return email;
};

/**
 * Returns covered in html email content
 * @param {content} qType
 * @returns {string}
 */
module.exports.toHtml = function(content) {
  return `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body>
      <div style='font-size: 15px;'>
        ${content}
      </div>
    </body>
  </html>`;
};

/**
 * Returns 'profiles'/'assessments'/'feedback' depends on questionnaire type
 * @param {Number} qType
 * @returns {String}
 */
function getQRoute(qType) {
  let childRoute = enums.Routes.PROFILES;
  switch(qType) {
    case enums.QuestionnaireType.PROFILE:
      childRoute = enums.Routes.PROFILES;
    break;
    case enums.QuestionnaireType.ASSESSMENT:
      childRoute = enums.Routes.ASSESSMENTS;
    break;
    case enums.QuestionnaireType.FEEDBACK:
      childRoute = enums.Routes.FEEDBACK;
    break;
  }

  return childRoute;
}

/**
 * Returns url which must be send in user's invitation email
 * @param {key Id} kId
 * @param {questionnaire Id} qId
 * @param {user's Id} uId
 * @param {questionnaire type} qType
 * @param {path ('auth' for user's authentication link)} path
 */
function createRegUrl(kId, qId, uId, qType, path) {
  const childRoute = getQRoute(qType);
  const regLink = config.user_url + childRoute + '/' + path + '/' +
    kId + '-' +
    qId + '-' +
    uId;
    const tag = `<a href="${regLink}">click here</a>`
  return tag;
}

/**
 * returns url which must be send in user's 'Change key' email
 * @param {new key id} kId
 * @param {user's id} uId
 * @param {user's password} uPasswd
 * @param {questionnaire type} qType
 * @param {path ('change-key' for user's 'Change key' link)} path
 */
function createChangeKeyUrl(kId, qId, uId, uPasswd, qType, path) {
  const childRoute = getQRoute(qType);
  const secretCode = secure.encrypt(uPasswd);
  const link = config.user_url + childRoute + '/' + path + '/' +
    kId + '-' +
    qId + '-' +
    uId + '-' +
    secretCode;
  return link;
}


function createPeUrl(qType) {
  const childRoute = getQRoute(qType);
  const peLink = config.user_url + childRoute;
  return peLink;
}



