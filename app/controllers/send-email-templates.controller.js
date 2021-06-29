'use strict';

const inlineBase64 = require('nodemailer-plugin-inline-base64');
const send_utils = require('../utils/send-template');
const utils = require('../utils');
const nm = require('../services/nodemailer');
const enums = require('../enums/enums');
const config = require('../config/config');
const resTable = require('../utils/result-table');

const { SendEmailTemplate, User, Company, Attempt, Questionnaire, ResultReport, Unsubscribe } = require('../models');

/************************Send Emails with timeout functions********************* */
function timer(ms) { return new Promise(res => setTimeout(res, ms)); }

async function sendBatch(batch) { 
  const queries = [];
  
  batch.forEach(mailOptions => {
    queries.push(nm.transporter.sendMail(mailOptions))
  })
  return Promise.all(queries);
}

async function sendEmailsWithTimeout(queries) {
  let allSent = [];
  for (let i = 0; i < queries.length; i += 4) {
    const batch = [];
    for (let j = i; j < (i + 4); j++) {
      if (queries[j]) {
        batch.push(queries[j]);
      }
    }
    //Don't set delay for the first batch sending
    if (i !== 0) {
      await timer(3000);
    }
    
    const sent = await sendBatch(batch);
    allSent = [...allSent, ...sent];
  }
  return allSent;
}
/******************************************************************************* */

let SendEmailTemplateController = {};

SendEmailTemplateController.getAllbyQuestionnaireId = (req, res) => {
	SendEmailTemplate.findAll(
    {where: {quest_id: req.params.id}
	}).then(templates => {
    res.status(200).send(templates);
	}).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

SendEmailTemplateController.create = function (req, res) {
  let queries = [];

  req.body.forEach(element => {
    if (!element.quest_id ||
      !element.email_type ||
      !element.email_subject ||
      !element.email_desc ||
      !element.tpl_content) {
      res.status(400).send({message: 'Some of required fields are missing!'});
      return;
    }

    queries.push(SendEmailTemplate.create(element));
  });

  Promise.all(queries)
    .then(function (templates) {
      if (templates.length > 0) res.status(200).send(templates[0]);
      else res.status(404).send({message: 'Create templates ERROR'});
    }).catch(function (err) {
      res.status(404).json(err);
    });
};

SendEmailTemplateController.update = function (req, res) {
  const queries = [];

  req.body.forEach(template => {
    queries.push(SendEmailTemplate.update(template, { where: { id: template.id } }));
  });
  Promise.all(queries)
  .then(() => {
    res.status(200).send({message: 'Templates are Updated!'});
  }).catch(function (err) {
    res.status(404).json(err);
  });
};

SendEmailTemplateController.delete = function (req, res) {
  SendEmailTemplate.destroy({ where: { id: req.params.id }})
  .then(() => {
    res.status(200).send({message: 'SendEmailTemplate Deleted!'});
  }).catch(function (error) {
    console.log(error);
    res.status(404).json(error);
  });
};

SendEmailTemplateController.isTemplateValid = function (req, res) {
  const params = req.params.params.split(',');
  if (!params || params.length < 3) {
    res.status(400).json({
      message: 'Some of required fields are missing!'
    });
    return;
  }
  SendEmailTemplate.find({
      where: {
        quest_id: params[0],
        email_type: params[1],
        email_desc: params[2]
      }
    })
    .then(function (template) {
      const isValid = template ? false : true;
      res.status(200).send(isValid);
    }).catch(function (err) {
      res.status(404).json(err);
    });
};

SendEmailTemplateController.copy = function (req, res) {
  let queries = [];
  const ids = req.body.ids.split(',');

  SendEmailTemplate.findAll({
    where: {
      id: ids
    }
  }).then(function (templates) {
    templates.forEach(el => {
      const template = {
        quest_id: req.body.quest_id,
        email_type: el.email_type,
        email_subject: el.email_subject,
        email_desc: el.email_desc,
        tpl_content: el.tpl_content,
        important: 0
      }
      queries.push(SendEmailTemplate.create(template));
    });
    return Promise.all(queries);
  }).then(function (templates) {
    if (templates.length > 0) res.status(200).send(templates.length.toString());
    else res.status(404).send({
      message: 'Create templates ERROR'
    });
  }).catch(function (err) {
    res.status(404).json(err);
  });
};

/**
 * Separate method for sending emails by admin (for security purpose)
 * Expected query params:
 * template (SendEmailTemplate object)
 * userIds (string with User ids separated by comma)
 * key (Key object)
 * questionnaire (Questionnaire object)
 * path ('change-key'/'auth'/'reg'...)
 * emails (string[] with entered emails)
 */
SendEmailTemplateController.sendByAdmin = function (req, res) {
  const mailOptionsArray = [];
  const key = req.body.key;
  const q = req.body.questionnaire;
  const ids = req.body.userIds.split(',');
  const path = req.body.path;
  const priority = req.body.template.important ? 'high' : 'normal';
  let completedList = '';
  let timeoutList = '';
  let emails = [];
  let users = [];

  User.findAll({where: {email: req.body.emails}})
  .then(function (found_users) {
    /**Check if entered emails belongs to existing users */
    req.body.emails.forEach(email => {
      const obj = found_users.find(user => user.email === email);
      if (obj && !ids.find(id => id === obj.id.toString())) {
        ids.push(obj.id);
      } else if (!obj) {
        emails.push(email);
      }
    });
    return send_utils.getUserListByAttemptStatus(key.id, q.id, enums.QuestionnaireStatus.COMPLETED);
  })
  .then(completed => {
    completedList = completed;
    return send_utils.getUserListByAttemptStatus(key.id, q.id, enums.QuestionnaireStatus.TIMEOUT);
  })
  .then(timeout => {
    timeoutList = timeout;
    return send_utils.getUserDataForEmail(ids);
  })
  .then((USERS) => {
    users = USERS;
    const allEmails = [...emails];
    users.forEach((us) => {
      allEmails.push(us.email);
    });
    return Unsubscribe.findAll({where:{ email: allEmails}});
  })
  .then(async (unsubs) =>  {
    /**Don't send emails to unsubscribed emails */
    unsubs.forEach((unsub) => {
      users = users.filter((user) => user.email !== unsub.email);
      emails = emails.filter((email) => email !== unsub.email);
    });
    users.forEach(user => {
      const tpl = JSON.parse(JSON.stringify(req.body.template));
      const parsedTpl = send_utils.parseTemplate(tpl, user, key, q, path, completedList, timeoutList);

      let params = {email: user.email, questionnaire_id: q.id};
      params = utils.encrypt(JSON.stringify(params));
      const listUnsubscribe = `<mailto:${config.imap_unsub_details.user}?subject=${params}>, <${config.base_url}unsubscribe?data=${params}>`;
      let mailOptions = {
        from: (key.admin || "") + ' <' + key.admin_email + '>', // sender address
        to: (user.first_name || "") + ' <' + user.email + '>',
        subject: parsedTpl.email_subject, // Subject line
        priority: priority,
        headers: {
          'List-Unsubscribe': listUnsubscribe,
          'X-Mailer': 'PFA System of negotiation.com',
          'X-MimeOLE': 'Produced By PFA System V2'
        },
        html: send_utils.toHtml(parsedTpl.tpl_content), // html body
        text: (parsedTpl.tpl_content).replace(/<[^>]*>/g, ' ')
      };

      mailOptionsArray.push(mailOptions);
    });

    emails.forEach((email) => {
      let params = {email: email, questionnaire_id: q.id};
      params = utils.encrypt(JSON.stringify(params));
      const listUnsubscribe = `<mailto:${config.imap_unsub_details.user}?subject=${params}>, <${config.base_url}unsubscribe?data=${params}>`;
      const tpl = JSON.parse(JSON.stringify(req.body.template));
      const parsedTpl = send_utils.parseTemplate(tpl, {}, key, q, '', '', '');
      let mailOptions = {
        from: (key.admin || "") + ' <' + key.admin_email + '>', // sender address
        to: email, // list of receivers
        subject: parsedTpl.email_subject, // Subject line
        priority: priority,
        headers: {
          'List-Unsubscribe': listUnsubscribe,
          'X-Mailer': 'PFA System of negotiation.com',
          'X-MimeOLE': 'Produced By PFA System V2'
        },
        html: send_utils.toHtml(parsedTpl.tpl_content), // html body
        text: (parsedTpl.tpl_content).replace(/<[^>]*>/g, ' ')
      };

      mailOptionsArray.push(mailOptions);
    });
    
    const sentRes = await sendEmailsWithTimeout(mailOptionsArray);
    return sentRes;
  })
  .then(function (result) {
    res.status(200).send(result.length.toString());
  }).catch(function (err) {
    console.log("********************Send error: " + err);
    res.status(500).json(err);
  });
}

/**
 * Separate method for sending emails by user (for security purpose)
 * Expected query params:
 * template (SendEmailTemplate object)
 * userId (User id)
 * key (Key object)
 * questionnaire (Questionnaire object)
 * path ('change-key'/'auth'/'reg'...)
 * toAdminSubject (subject for email that will be send to admin)
 */
SendEmailTemplateController.sendByUser = function (req, res) {
  const queries = [];
  const key = req.body.key;
  const q = req.body.questionnaire;
  const path = req.body.path;
  let completedList = '';
  let timeoutList = '';
  const pfaEmail = send_utils.getPFAEmail(q.type);

  send_utils.getUserListByAttemptStatus(key.id, q.id, enums.QuestionnaireStatus.COMPLETED)
  .then(completed => {
    completedList = completed;
    return send_utils.getUserListByAttemptStatus(key.id, q.id, enums.QuestionnaireStatus.TIMEOUT);
  })
  .then(timeout => {
    timeoutList = timeout;
    return send_utils.getUserDataForEmail(req.body.userId);
  })
  .then((users) => {
    const user = users[0];
      const tpl = JSON.parse(JSON.stringify(req.body.template));
      const parsedTpl = send_utils.parseTemplate(tpl, user, key, q, path, completedList, timeoutList);

      let mailOptions = {
        from: (key.admin || "") + ' <' + key.admin_email + '>', // sender address
        to: (user.first_name || "") + ' <' + user.email + '>',
        subject: parsedTpl.email_subject, // Subject line
        html: send_utils.toHtml(parsedTpl.tpl_content), // html body
        text: (parsedTpl.tpl_content).replace(/<[^>]*>/g, ' ')
      };

      // send mail with defined transport object
      queries.push(nm.transporter.sendMail(mailOptions));

      if(req.body.toAdminSubject) {
        const userKey = user.company;
        let adminMsg = req.body.toAdminSubject;
        adminMsg = adminMsg.replace(/{EMAIL}/g, user.email);
        adminMsg += '<br /><br />';
        adminMsg += `${parsedTpl.tpl_content}`;
        let mailOptions = {
          from: pfaEmail, // sender address
          to: (userKey.admin || "") + ' <' + userKey.admin_email + '>', // list of receivers
          subject: parsedTpl.email_subject, // Subject line
          html: send_utils.toHtml(adminMsg), // html body
          text: (adminMsg).replace(/<[^>]*>/g, ' ')
        };
        queries.push(nm.transporter.sendMail(mailOptions));
      }

    return Promise.all(queries);
  })
  .then(function (emails) {
    if (emails.length > 0) res.status(200).send(emails.length.toString());
    else res.status(404).send({message: 'Send emails ERROR'});
  }).catch(function (err) {
    res.status(404).json(err);
  });
}

/**
 * Sends timeout email to user.
 * Expected query params:
 * userId (User id)
 * key (Key object)
 * questionnaire (Questionnaire object)
 */
SendEmailTemplateController.sendTimeoutEmail = function (req, res) {
  const queries = [];
  const key = req.body.key;
  const q = req.body.questionnaire;
  const path = enums.Routes.AUTHENTICATE;
  const tpl = {email_subject: q.pubreg_email_subject, tpl_content: q.pubreg_email_template};

  send_utils.getUserDataForEmail(req.body.userId)
  .then(users => {
    const user = users[0];
    const parsedTpl = send_utils.parseTemplate(tpl, user, key, q, path, '', '');

    let mailOptions = {
      from: (key.admin || "") + ' <' + key.admin_email + '>', // sender address
      to: (user.first_name || "") + ' <' + user.email + '>',
      subject: parsedTpl.email_subject, // Subject line
      html: send_utils.toHtml(parsedTpl.tpl_content), // html body
      text: (parsedTpl.tpl_content).replace(/<[^>]*>/g, ' ')
    };

    // send mail with defined transport object
    queries.push(nm.transporter.sendMail(mailOptions));

    return Promise.all(queries)
  })
  .then(function (emails) {
    if (emails.length > 0) res.status(200).send(emails.length.toString());
    else res.status(404).send({
      message: 'Send emails ERROR'
    });
  }).catch(function (err) {
    res.status(404).json(err);
  });
}

/**
 * Sends Results emails with answers on Assessment questionnaires
 * Expected query params:
 * template (SendEmailTemplate object)
 * userIds (string with User ids separated by comma)
 * key (Key object)
 * questionnaire (Questionnaire object)
 */
SendEmailTemplateController.sendResultEmails = function (req, res) {
  const mailOptionsArray = [];
  const createReportsQueries = [];
  const key = req.body.key;
  const q = req.body.questionnaire;
  const ids = req.body.userIds.split(',');
  const path = enums.Routes.AUTHENTICATE;
  const priority = req.body.template.important ? 'high' : 'normal';
  const isPIA = q.id === 124 ? true : false;
  let responses;
  let users = [];

  utils.getDataForReports(key.id, q.id, req.body.userIds)
  .then(returnData => {
    return utils.MakeQuestionnaireAnswersTree(returnData);
  })
  .then(responsesRes => {
    responses = responsesRes;
    return send_utils.getUserDataForEmail(ids);
  })
  .then((USERS) => {
    users = USERS;
    const emails = [];
    users.forEach((us) => {
      emails.push(us.email);
    });
    return Unsubscribe.findAll({where:{ email: emails}});
  })
  .then((unsubs) => {
    /**Don't send emails to unsubscribed emails */
    unsubs.forEach((unsub) => {
      users = users.filter((user) => user.email !== unsub.email);
    });
    const parsedResponses = getParticipantsResponses(responses);
    nm.transporter.use('compile', inlineBase64({cidPrefix: 'neg-pfa_'}));
    users.forEach(user => {
      const tpl = JSON.parse(JSON.stringify(req.body.template));
      const parsedTpl = send_utils.parseTemplate(tpl, user, key, q, path, '', '');
      /**Find user's responses */
      for (const resps of parsedResponses) {
        if (resps.find(resp => (resp._id === user.id))) {
          const obj = resps.find(resp => (resp._result));
          parsedTpl.tpl_content = parsedTpl.tpl_content.replace(/{RESULTS}/g, obj._result);

          /**Create Results report link and store configured report into the DB */
          if (parsedTpl.tpl_content.indexOf('{RES_LINK}') !== -1 && q.type === 1) {
            const score = obj._result;
            const code = utils.getRandomCode();
            const resultsLink = createResultsUrl(code).link;
            parsedTpl.tpl_content = parsedTpl.tpl_content.replace(/{RES_LINK}/g, resultsLink || '');

            const resultReport = {};
            resultReport.user_id = user.id;
            resultReport.questionnaire_id = q.id;
            resultReport.code = code;
            resultReport.score = score;
            resultReport.html = JSON.stringify(resps);
            resultReport.with_faces = isPIA ? true : false;
            createReportsQueries.push(ResultReport.create(resultReport));
          }

          let table;
          if (isPIA) {
            table = resTable.createParticipantsResponsesTableWithFaces(resps);
          } else {
            table = resTable.createParticipantsResponsesTable(resps);
          }

          parsedTpl.tpl_content += table;
          break;
        }
      }
      /**In case if there were no responses */
      parsedTpl.tpl_content = parsedTpl.tpl_content.replace(/{RES_LINK}/g, '');
      parsedTpl.tpl_content = parsedTpl.tpl_content.replace(/{RESULTS}/g, '');

      let params = {email: user.email, questionnaire_id: q.id};
      params = utils.encrypt(JSON.stringify(params));
      const listUnsubscribe = `<mailto:${config.imap_unsub_details.user}?subject=${params}>, <${config.base_url}unsubscribe?data=${params}>`;
      let mailOptions = {
        from: (key.admin || "") + ' <' + key.admin_email + '>', // sender address
        to: (user.first_name || "") + ' <' + user.email + '>',
        subject: parsedTpl.email_subject, // Subject line
        priority: priority,
        headers: {
         // 'List-ID': listId,
          'List-Unsubscribe': listUnsubscribe,
          'X-Mailer': 'PFA System of negotiation.com',
          'X-MimeOLE': 'Produced By PFA System V2'
        },
        html: send_utils.toHtml(parsedTpl.tpl_content), // html body
        text: (parsedTpl.tpl_content).replace(/<[^>]*>/g, ' ')
      };

      //queries.push(nm.transporter.use('compile', inlineBase64({cidPrefix: 'neg-pfa_'})));
      //queries.push(nm.transporter.sendMail(mailOptions));
      mailOptionsArray.push(mailOptions);
    });

    return Promise.all(createReportsQueries);
  })
  .then(async function (reports) {
    const sentRes = await sendEmailsWithTimeout(mailOptionsArray);
    return sentRes;
  })
  .then(function (emails) {
    res.status(200).send((emails.length).toString());
  }).catch(function (err) {
    res.status(404).json(err);
  });
}

/**
   * Sets attempt's status to completed.
   * If in questionnaire settings added auto emails:
   *  - Sends Confirmation email of completed questionnaire to user,
   *  - Sends Confirmation email of completed questionnaire by user to admin.
   * Expected param in req.body: {aId: attempt id, uId: user id, qId: questionnaire id, kId: key id, passed_time: passed time, isAdmin}
   */
  SendEmailTemplateController.complete = function (req, res) {
    if (!req.body.aId || !req.body.uId || !req.body.qId || !req.body.kId) {
      res.status(400).send({message: 'Some of required fields are missing!'});
      return;
    }

    const queries = [];
    const isPIA = req.body.qId === 124 ? true : false;
    const path = enums.Routes.AUTHENTICATE;
    let key;
    let q;
    let completedList = '';
    let timeoutList = '';
    let responses;
    const ids = [req.body.uId];
    let pfaEmail;

    const attempt = {id: req.body.aId, passed_time: req.body.passed_time};
    attempt.last_activity_date = send_utils.getFormatedCurrentDate();
    attempt.end_date = send_utils.getFormatedCurrentDate();
    attempt.status = enums.QuestionnaireStatus.COMPLETED;
    console.log('************completed attempt with dates: ' + JSON.stringify(attempt));
    Attempt.update(attempt, {where: { id: attempt.id }})
    .then(att => {
      return Questionnaire.findById(req.body.qId)
    })
    .then(questionnaire => {
      q = questionnaire;
      pfaEmail = send_utils.getPFAEmail(q.type);
      return Company.findById(req.body.kId)
    })
    .then(company => {
      key = company;
      return send_utils.getUserListByAttemptStatus(req.body.kId, q.id, enums.QuestionnaireStatus.COMPLETED)
    })
    .then(completed => {
      completedList = completed;
      return send_utils.getUserListByAttemptStatus(req.body.kId, q.id, enums.QuestionnaireStatus.TIMEOUT);
    })
    .then(timeout => {
      timeoutList = timeout;
      return utils.getDataForReports(req.body.kId, q.id, req.body.uId.toString(), true);
    })
    .then(returnData => {
      return utils.MakeQuestionnaireAnswersTree(returnData);
    })
    .then(responsesRes => {
      responses = responsesRes;
      return send_utils.getUserDataForEmail(ids);
    })
    .then(users => {
      /**Don't send emails if Questionnaire is completed by admin */
      if (req.body.isAdmin) {
        return Promise.all(queries);
      }

      const user = users[0];
      //Send email to user
      if (q.conf_email_subject && q.conf_email_template) {
        const parsedResponses = getParticipantsResponses(responses);
        const tpl = {email_subject: q.conf_email_subject, tpl_content: q.conf_email_template};
        const parsedTpl = send_utils.parseTemplate(tpl, user, key, q, path, completedList, timeoutList);

        for (const resps of parsedResponses) {
          if (resps.find(resp => (resp._id === user.id))) {
            const obj = resps.find(resp => (resp._result));
            parsedTpl.tpl_content = parsedTpl.tpl_content.replace(/{RESULTS}/g, obj._result);

            /**Create Results report link and store configured report into the DB */
            if (parsedTpl.tpl_content.indexOf('{RES_LINK}') !== -1 && q.type === 1) {
              const score = obj._result;
              const code = utils.getRandomCode();
              const resultsLink = createResultsUrl(code).link;
              parsedTpl.tpl_content = parsedTpl.tpl_content.replace(/{RES_LINK}/g, resultsLink || '');

              const resultReport = {};
              resultReport.user_id = user.id;
              resultReport.questionnaire_id = q.id;
              resultReport.code = code;
              resultReport.score = score;
              resultReport.html = JSON.stringify(resps);
              resultReport.with_faces = isPIA ? true : false;
              queries.push(ResultReport.create(resultReport));
            }
            break;
          }
        }
        /**In case {RES_LINK} was added to not Assessment or if there were no responses */
        parsedTpl.tpl_content = parsedTpl.tpl_content.replace(/{RES_LINK}/g, '');

        const mailOptions = {
          from: (key.admin || "") + ' <' + key.admin_email + '>', // sender address
          to: (user.first_name || "") + ' <' + user.email + '>',
          subject: parsedTpl.email_subject, // Subject line
          html: send_utils.toHtml(parsedTpl.tpl_content), // html body
          text: (parsedTpl.tpl_content).replace(/<[^>]*>/g, ' ')
        };

        queries.push(nm.transporter.sendMail(mailOptions));
      }
      //Send email to admin
      if (q.sponsor_email_subject && q.sponsor_email_template) {
        const tpl = {email_subject: q.sponsor_email_subject, tpl_content: q.sponsor_email_template};
        const parsedTpl = send_utils.parseTemplate(tpl, user, key, q, path, completedList, timeoutList);

        const emails = [];
        emails.push((key.admin || "") + ' <' + key.admin_email + '>');
        if (key.email) { emails.push((key.sponsor_name || "") + ' <' + key.email + '>'); }

        const mailOptions = {
          from: (key.admin || "") + ' <' + pfaEmail + '>', // sender address
          to: emails, // list of receivers
          subject: parsedTpl.email_subject, // Subject line
          html: send_utils.toHtml(parsedTpl.tpl_content), // html body
          text: (parsedTpl.tpl_content).replace(/<[^>]*>/g, ' ')
        };

        queries.push(nm.transporter.sendMail(mailOptions));
      }

      return Promise.all(queries);
    })
    .then(function (info) {
      res.status(200).send(info);
    }).catch(function (err) {
      res.status(404).json(err);
    });
  }

/**
   * Sets attempt's status to completed.
   * If in questionnaire settings added auto emails:
   *  - Sends Result email to user,
   *  - Sends email of completed questionnaire by user to admin.
   * Expected param in req.body: {aId: attempt id, uId: user id, qId: questionnaire id, kId: key id, passed_time: passed time}
   */
SendEmailTemplateController.completeAndSendRes = function (req, res) {
  if (!req.body.aId || !req.body.uId || !req.body.qId || !req.body.kId) {
    res.status(400).send({ message: 'Some of required fields are missing!' });
    return;
  }

  const queries = [];
  const path = enums.Routes.AUTHENTICATE;
  const kId = req.body.kId;
  let q;
  let template;
  let completedList = '';
  let timeoutList = '';
  const ids = [req.body.uId];
  let pfaEmail;
  let resultsUrl = '';
  let responses;

  const attempt = {id: req.body.aId, passed_time: req.body.passed_time};
  attempt.last_activity_date = send_utils.getFormatedCurrentDate();
  attempt.end_date = send_utils.getFormatedCurrentDate();
  Attempt.update(attempt, {where: { id: attempt.id }})
  .then(att => {
    return Questionnaire.findById(req.body.qId)
  })
  .then(questionnaire => {
    q = questionnaire;
    pfaEmail = send_utils.getPFAEmail(q.type);
    /**Template with id 5695 Created in PIA Result, it's used as a Completion  email for WP PIA visitors.  */
    return SendEmailTemplate.findById(getTemplateId(q.id))
  })
  .then(tpl => {
    template = tpl;
    return send_utils.getUserListByAttemptStatus(kId, q.id, enums.QuestionnaireStatus.COMPLETED);
  })
  .then(completed => {
      completedList = completed;
      return send_utils.getUserListByAttemptStatus(kId, q.id, enums.QuestionnaireStatus.TIMEOUT);
    })
    .then(timeout => {
      timeoutList = timeout;
      return utils.getDataForReports(kId, q.id, req.body.uId.toString(), true);
    })
    .then(returnData => {
      return utils.MakeQuestionnaireAnswersTree(returnData);
    })
    .then(responsesRes => {
      responses = responsesRes;
      return send_utils.getUserDataForEmail(ids);
    })
    .then((users) => {
      const parsedResponses = getParticipantsResponses(responses);
      users.forEach(user => {
        const userKey = user.company;
        if (template) {
          const tpl = template;
          const parsedTpl = send_utils.parseTemplate(tpl, user, userKey, q, path, completedList, timeoutList);
          /**Find user's responses */
          for (const resps of parsedResponses) {
            if (resps.find(resp => (resp._id === user.id))) {
              const obj = resps.find(resp => (resp._result));
              parsedTpl.tpl_content = parsedTpl.tpl_content.replace(/{RESULTS}/g, obj._result);

              /**Create Results report link and store configured report into the DB */
              if (parsedTpl.tpl_content.indexOf('{RES_LINK}') !== -1 && q.type === 1) {
                const score = obj._result;
                const code = utils.getRandomCode();
                const resultsLink = createResultsUrl(code).link;
                resultsUrl = createResultsUrl(code).url;
                parsedTpl.tpl_content = parsedTpl.tpl_content.replace(/{RES_LINK}/g, resultsLink || '');

                const resultReport = {};
                resultReport.user_id = user.id;
                resultReport.questionnaire_id = q.id;
                resultReport.code = code;
                resultReport.score = score;
                resultReport.html = JSON.stringify(resps);
                resultReport.with_faces = true;
                queries.push(ResultReport.create(resultReport));
              }

              const table = resTable.createParticipantsResponsesTableWithFaces(resps);
              parsedTpl.tpl_content += table;
              break;
            }
          }
          const mailOptions = {
            from: (userKey.admin || "") + ' <' + userKey.admin_email + '>', // sender address
            to: (user.first_name || "") + ' <' + user.email + '>',
            subject: parsedTpl.email_subject, // Subject line
            html: send_utils.toHtml(parsedTpl.tpl_content), // html body
            text: (parsedTpl.tpl_content).replace(/<[^>]*>/g, ' ')
          };
          queries.push(nm.transporter.use('compile', inlineBase64({cidPrefix: 'neg-pfa_'})));
          queries.push(nm.transporter.sendMail(mailOptions));
        }

        //Send email to admin
        if (q.sponsor_email_subject && q.sponsor_email_template) {
          const tpl = { email_subject: q.sponsor_email_subject, tpl_content: q.sponsor_email_template };
          const parsedTpl = send_utils.parseTemplate(tpl, user, userKey, q, path, completedList, timeoutList);

          const emails = [];
          emails.push((userKey.admin || "") + ' <' + userKey.admin_email + '>');
          if (userKey.email) { emails.push((userKey.sponsor_name || "") + ' <' + userKey.email + '>'); }

          const mailOptions = {
            from: (userKey.admin || "") + ' <' + pfaEmail + '>', // sender address
            to: emails, // list of receivers
            subject: parsedTpl.email_subject, // Subject line
            html: send_utils.toHtml(parsedTpl.tpl_content), // html body
            text: (parsedTpl.tpl_content).replace(/<[^>]*>/g, ' ')
          };

          queries.push(nm.transporter.sendMail(mailOptions));
        }
      });

      return Promise.all(queries);
    })
    .then(function (info) {
      res.status(200).json({url: resultsUrl});
    }).catch(function (err) {
      res.status(404).json(err);
    });
}

/**
 * Returns CompetionResult template id by Questionnaire id
 * @param {} qId
 */
function getTemplateId(qId) {
  switch(qId) {
    case 124: /**PIA Assessment */
      return 5695;
    default:
      return 5695;
  }
}

/**
 * Returns "a" tag with Assessment results url
 * @param {report unique code} code
 */
function createResultsUrl(code) {
  const resLink = config.user_url + enums.Routes.ASSESSMENTS + '/' + enums.Routes.RESULT + '/' + code;

  const a = `<a href="${resLink}">${resLink}</a>`
  return {link: a, url: resLink};
}

/**
   * Sum scores of picked answers by user
   * @param options
   * @param answer_options
   * @returns {number}
   */
  function getCheckedScores(options, answer_options) {
    let checkedScore = 0;
    if (answer_options && answer_options.length > 0 && options && options.length > 0) {
      answer_options.forEach(answer_opt => {
        if (answer_opt['question_answer_option']) {
          const questionAnswerOption = options.find((option) => option.id === answer_opt['question_answer_options_id']);
          checkedScore += questionAnswerOption.score;
        } else {
          checkedScore = 0;
        }
      });
    } else {
      checkedScore = 0;
    }
    return checkedScore;
  }

  /**
   * Sum all scores
   * @param question
   * @returns {number}
   */
  function getAllScores(question, forScore = false) {
    let result = 0;
    if (question.info.is_bonus === 1 && forScore) {
      result = result;
    } else if (question.options && question.options.length > 0) {
      /**For MULTIPLE_CHOISE_SINGLE_OPTION returns max option */
      if (question.info.type === 2) {
        result = question.options[0].score;
        question.options.forEach(option => {
          if (option.score > result) {
            result = option.score;
          }
        });
      }
      /**For MULTIPLE_CHOISE_MULTI_OPTIONS and others calculate all positive values of options */
      else {
        question.options.forEach(option => {
          option.score < 0 ? result = result : result += option.score;
        });
      }
    } else {
      result = 0;
    }
    return result;
  }

 /**
   * Calculate and format question score rate
   * @param question
   * @returns {string}
   */
  function getQuestionScoresRate(question) {
    if (question.answer && question.answer.answer_options.length > 0 &&
      question.options && question.options.length > 0) {
      return getCheckedScores(question.options, question.answer.answer_options) + '/' + getAllScores(question);
    } else {
      return 0 + '/' + getAllScores(question);
    }
  }

  /**
   * Calculate and format group score rate
   * @param questions
   * @returns {string}
   */
  function getGroupScoresRate(questions) {
    let answered = 0;
    let total = 0;
    questions.forEach(question => {
      if (question.answer && question.answer.answer_options.length > 0 &&
        question.options && question.options.length > 0) {
          answered += getCheckedScores(question.options, question.answer.answer_options);
          total += getAllScores(question);
      } else {
        total += getAllScores(question);
      }
    });
    return answered + '/' + total;
  }

  /**
   * Get question option answer by question option id
   * @param questionOption
   * @param {any[]} answerOptions
   * @returns {any}
   */
  function getQuestionOptionAnswer(questionOption, answerOptions) {
    if (questionOption) {
      return answerOptions.find(answerOption => {
        return answerOption['question_answer_options_id'] === questionOption.id;
      });
    }
  }
/**
   * Generate export data for Participant responses export for assessment questionnaire type
   * @param {QuestGroup[]} questGroups
   * @returns {Array}
   */
  function getAssessmentsQuestItems(questGroups) {
    const rowsToExport = [];
    const groupCount = questGroups.length;

    let qNumber = 1;
    questGroups.forEach(group => {
      if (groupCount > 1) {
        rowsToExport.push({
          score: getGroupScoresRate(group.questions),
          title: groupCount > 1 ? group.info.title : '',
          group: true
        });
      }
      group.questions.forEach(question => {
        rowsToExport.push({
          score: getQuestionScoresRate(question),
          title: question.info.title,
          bold: true,
          qNumber: qNumber++
        });

        /**If question.info.type !== 5 needed to check if TEXT question has options:
         * e.g. if Question with options was changed on TEXT question, and options weren't
         * deleted from DB (in old PFA).
         * Then the 'else' block should be triggered
         */
        if (question.options && question.options.length && question.info.type !== 5) {
          question.options.forEach(option => {
            let optionAnswer;
            if (question.answer && question.answer.answer_options.length > 0) {
              optionAnswer = getQuestionOptionAnswer(option, question.answer['answer_options']);
            }

            if (optionAnswer) {
              rowsToExport.push({
                show_faces: question.info.is_faces,
                option_score: option.score,
                option_face: question.info.is_faces ? option.face_type : 0,
                title: option.title,
                checked: true,
              });
            } else {
              rowsToExport.push({
                show_faces: question.info.is_faces,
                option_score: option.score,
                option_face: question.info.is_faces ? option.face_type : 0,
                title: option.title
              });
            }
          });
          if (question.answer && question.answer.comment) {
            rowsToExport.push({
              title: question.answer.comment
            });
          }
        } else {
          if (question.answer) {
            rowsToExport.push({
              title: question.answer.comment ? question.answer.comment : '',
              checked: true
            });
          }
        }
        if (question.info.explanation) {
          rowsToExport.push({
            title: question.info.explanation,
            explanation: true
          });
        }
        rowsToExport.push({score: '', title: ''});
      });
    });
    return rowsToExport;
  }

  /**
   * Helper function to calculate and format total score of a passed questionnaire by a participant
   * @param totalArray
   * @returns {string}
   */
  function parseTotalScore(totalArray) {
    const parsedArr = [];
    let firstScore = 0;
    let secondScore = 0;
    if (totalArray.length > 0) {
      totalArray.forEach(item => {
        parsedArr.push(item.split('/'));
      });

      parsedArr.forEach(item => {
        firstScore += parseFloat(item[0]);
        secondScore += parseFloat(item[1]);
      });
      return firstScore + '/' + secondScore;
    }
  }
  /**
   * Calculate and format total score of a passed questionnaire by a participant
   * @param {QuestGroup[]} questGroups
   * @returns {string}
   */
  function getTotalScore(questGroups) {
    const totalArray = [];
    questGroups.forEach(group => {
      group.questions.forEach(question => {
        //totalArray.push(getQuestionScoresRate(question));
        if (question.answer && question.answer.answer_options.length > 0 &&
          question.options && question.options.length > 0) {
          const sc = getCheckedScores(question.options, question.answer.answer_options) + '/' + getAllScores(question, true);
          totalArray.push(sc);
        } else {
          const sc = 0 + '/' + getAllScores(question, true);
          totalArray.push(sc);
        }
      });
    });
    return parseTotalScore(totalArray);
  }

  /**
   * Format score to percentage value
   * @param totalScore
   * @returns {number}
   */
  function getPercentage(totalScore) {
    const splitedTotalScore = totalScore.split('/');
    return Math.round((parseFloat(splitedTotalScore[0]) / parseFloat(splitedTotalScore[1])) * 100);
  }

  function generateParticipantsResponsesExcelData(rowData) {
    let exportData;
    const exportByUsers = [];
    if (rowData.users && rowData.questionnaireInfo) {
      rowData.users.forEach((user) => {
        exportData = [];
        exportData.push({_id: user.info.id});
        exportData.push({_result: getPercentage(getTotalScore(user.questionGroups)) + '%'});
        exportData.push({label: '', user_info: '', question: ''});
        exportByUsers.push(exportData.concat(getAssessmentsQuestItems(user.questionGroups)));
      });
    }
    return exportByUsers;
  }

  /**
   * Returns detailed information about participants responses on questionnaire
   * @param questionnairesData
   */
  function getParticipantsResponses(questionnairesData) {
    const rows = [];
    const fields = generateParticipantsResponsesExcelData(questionnairesData);
    Array.prototype.push.apply(rows, fields);
    return rows;
  }

module.exports = SendEmailTemplateController;
