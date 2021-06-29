/**
 * Admin's api require jwt authentication
 * User's and Shared api authentication handles by comparing 'sessionId' send by client in queryParams
 * sessionId: Token ('../config/config/TOKEN') encrypted in Md5
 */
const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const config = require('../config/config');
const helpers = require('../utils/auth');
const auth = jwt({
  secret: config.jwt_encryption,
  userProperty: 'payload'
});

// Controllers
const userAdminCtrl = require('../controllers/user-admin.controller');
const trainingCourseController = require('../controllers/training_course.controller');
const userController = require('../controllers/user.controller');
const companyController = require('../controllers/company.contoller');
const configurationController = require('../controllers/configuration.controller');
const questionnaireController = require('../controllers/questionnaire.contoller');
const userAnswerController = require('../controllers/user-answer.controller');
const userQuestionnaireContactController = require('../controllers/user-questionnaire-contact.controller');
const userQuestionnaireAttemptLimitController = require('../controllers/user-questionnaire-attempt-limit.controller');
const attemptController = require('../controllers/attempts.controller');
const questionGroupController = require('../controllers/question-group.controller');
const questionsController = require('../controllers/questions.controller');
const sendEmailTemplatesController = require('../controllers/send-email-templates.controller');
const userAnswerOptionsController = require('../controllers/user-answer-options.controller.js');
const reportsController = require('../controllers/reports.controller');
const simApiController = require('../controllers/sim-api.controller');
const resultsReportController = require('../controllers/results-report.controller');
const incompleteAttemptController = require('../controllers/incomplete-attempts.controller');
const sharedApiController = require('../controllers/shared-api.controller');


router.get('/', (req, res) => {
  res.status(200).send({message: 'api works'});
});
router.get('/ping', (req, res) => {
  res.status(200).send({message: 'Server started!'});
});

/**
 * Authentication by JWT
 */
// User Admin api
router.post('/admin/login', userAdminCtrl.login);
router.post('/admin/logout', userAdminCtrl.logout);
router.post('/admin/refresh', userAdminCtrl.refresh);
router.post('/admin/register', auth, userAdminCtrl.register);
router.patch('/admin/update', auth, userAdminCtrl.update);
router.get('/admin/get-all', auth, userAdminCtrl.getAll);
router.get('/admin/:admin_id', auth, userAdminCtrl.getAdmin);
router.delete('/admin/delete/:id', auth,  userAdminCtrl.delete);
router.get('/admin/email-valid/:email', auth, userAdminCtrl.isEmailValid);
router.get('/admin/username-valid/:username', auth, userAdminCtrl.isUserNameValid);

//Training course api
router.post('/training-courses', auth, trainingCourseController.create);
router.delete('/training-courses/:id/:order', auth, trainingCourseController.remove);
router.put('/training-courses', auth, trainingCourseController.update);
router.put('/training-course/rename', auth, trainingCourseController.updateName);
router.get('/training-courses/name-valid/:name', auth, trainingCourseController.isNameValid);
router.get('/training-courses/get-field-unique-clone-count', auth, trainingCourseController.getUniqueFieldCloneValue);

// User api
router.get('/users/:company_id', auth, userController.getAllbyCompany);
router.delete('/user/:ids', auth, userController.deleteUsers);
router.patch('/users/update-fields', auth, userController.updateFields);
router.patch('/users/move', auth, userController.moveUsers);
router.patch('/users/import', auth, userController.importUsers);
router.post('/users/upload', auth, userController.uploadUsers);
router.get('/users/find/:value', auth, userController.findUsers);

// User Questionnaire Contact api
router.patch('/users/quest-contact', auth, userQuestionnaireContactController.updateContacts);

// User Questionnaire Attempts Limit api
router.patch('/users/quest-attempts-limit', auth, userQuestionnaireAttemptLimitController.updateAttemptLimits);
router.get('/users/quest-attempts-limit/:user_ids', auth, userQuestionnaireAttemptLimitController.getByUserIds);

//User Answer api
router.get('/user/answers/:attempt_id', auth, userAnswerController.getAllByAttemptId);

//Quest-Company api
router.get('/quest-by-company/:company_id', auth, questionnaireController.getAllbyCompany);
router.get('/quest/get-all', auth, questionnaireController.getAll);
router.post('/quest', auth, questionnaireController.create);
router.patch('/quest', auth, questionnaireController.update);
router.delete('/quest/:id', auth, questionnaireController.delete);
router.patch('/quest/clone', auth, questionnaireController.clone);
router.get('/quest/get-completed-questionnaires', auth, questionnaireController.getCompletedQuestionnaires);
router.post('/quest/acronym-valid', questionnaireController.isAcronymValid);

// Attempts api
router.delete('/attempt/:attempt_id', auth, attemptController.deleteAttempt);

// Company api
router.get('/company/get-all', auth, companyController.getAll);
router.get('/company/export-best-negotiators/:company_id', auth, companyController.ExportBestNegotiators);
router.get('/company/export-participants-responses/:company_id/:questionnaire_id', auth, companyController.ExportParticipantsResponses);
router.post('/company',auth,companyController.create);
router.patch('/company',auth,companyController.update);
router.delete('/company/:id',auth, companyController.delete);
router.get('/company/company-key-valid/:company_key', auth, companyController.isCompanyKeyValid);
router.get('/company/company-title-valid/:title', auth, companyController.isCompanyTitleValid);
router.get('/company/sorted-by-activity/:id', auth, companyController.getSortedByActivity);
router.patch('/company/activate-questionnaire', auth, companyController.activateQuestionnaire);
router.get('/company/get-field-unique-clone-count', auth, companyController.getUniqueFieldCloneValue);


//Configuration api
router.put('/configuration', auth,configurationController.update);

// QuestionGroup api
router.get('/question-group/:id', auth, questionGroupController.getAllbyQuestionnaireId);
router.post('/question-group', auth, questionGroupController.create);
router.patch('/question-group', auth, questionGroupController.update);
router.delete('/question-group/:ids', auth, questionGroupController.delete);
router.patch('/question-group/move-to-group', auth, questionGroupController.moveToGroup);
router.patch('/question-group/move-to-item', auth, questionGroupController.moveToItem);
router.patch('/question-group/sort-group', auth, questionGroupController.sortGroup);
router.patch('/question-group/maps-delete', auth, questionGroupController.deleteMaps);

//Questions api
router.get('/questions/get-all',auth,questionsController.getAll);
router.get('/questions/:id', auth, questionsController.getQuestionById);
router.get('/question-slider-tags/:id', auth, questionsController.getSliderTagsByQuestionId);
router.get('/question/label-options-by-id/:id', auth, questionsController.getLabelOptionsById);
router.post('/question/create-label-set', auth, questionsController.createNewLabelSet);
router.delete('/question/delete-label-set/:id', auth, questionsController.deleteLabelSet);
router.put('/question/update-label-set/',auth, questionsController.editLabelSet);
router.post('/question', auth, questionsController.create);
router.put('/question', auth, questionsController.edit);
router.delete('/question/:ids', auth, questionsController.delete);
router.delete('/question-permanently/:id', auth, questionsController.deletePermanently);
router.patch('/question/restore', auth, questionsController.restore);
router.get('/question/get-field-unique-clone-count', auth, questionsController.getUniqueFieldCloneValue);
router.post('/question/title-valid', questionsController.isTitleValid);

router.get('/question-label-options', auth, questionsController.getQuestionsLabelOptions);

//Send Email Templates api
router.get('/email-templates/:id', auth, sendEmailTemplatesController.getAllbyQuestionnaireId);
router.post('/email-templates', auth, sendEmailTemplatesController.create);
router.patch('/email-templates', auth, sendEmailTemplatesController.update);
router.delete('/email-templates/:id', auth, sendEmailTemplatesController.delete);
router.get('/email-templates/validate/:params', auth, sendEmailTemplatesController.isTemplateValid);
router.post('/email-templates/copy', auth, sendEmailTemplatesController.copy);
router.post('/email-templates/send', auth, sendEmailTemplatesController.sendByAdmin);
router.post('/email-templates/send-result', auth, sendEmailTemplatesController.sendResultEmails);

// Clients
router.post('/clients/create-report', auth, reportsController.createReport);
router.post('/clients/report-email', auth, reportsController.sendEmailWithReports);
router.get('/clients/generate-report', auth, reportsController.generateReport);
router.get('/clients/get-users-by-keys', auth, reportsController.getUsersByKeyAndQuestionnaire);
router.get('/clients/:code', helpers.isAuthenticated, reportsController.getReportByCode);
router.get('/clients/by-company-id/:companyId', auth, reportsController.getReportsByCompanyId);
router.post('/clients/rename', auth, reportsController.updateName);
router.delete('/clients/:id', auth, reportsController.deleteReport);
router.delete('/clients/delete-by-code/:code', auth, reportsController.deleteReportByCode);
router.get('/clients/get-companies/:quest_id', auth, reportsController.getKeysByQuestId);
router.get('/clients/get-all-companies/:quest_id', auth, reportsController.getAllKeysByQuestId);
router.get('/clients/generate-pdf/:code/:name', auth, reportsController.generatePdf);


//Incomplete Attempts api
router.get('/incomplete-attempt/get-by-qid/:qId', auth, incompleteAttemptController.getAllByQId);

/**
 * Authentication by 'sessionId'
 */
// Shared api (api used by admin and user) and User Attempts api (PFT)
router.get('/training-courses', trainingCourseController.getAll);
router.get('/shared', sharedApiController.getAll);

router.get('/configuration', configurationController.getAll);
router.get('/configuration/user-url', configurationController.getUserUrl);
router.post('/email-templates/user/send', helpers.isAuthenticated, sendEmailTemplatesController.sendByUser);
router.post('/email-templates/user/send-timeout', helpers.isAuthenticated, sendEmailTemplatesController.sendTimeoutEmail);
router.post('/email-templates/complete-send-result', helpers.isAuthenticated, sendEmailTemplatesController.completeAndSendRes);
router.post('/attempt/complete', helpers.isAuthenticated, sendEmailTemplatesController.complete);

router.get('/user/email-valid/:email', userController.isEmailValid);
router.post('/user/passwd-valid', helpers.isAuthenticated, userController.isPasswordValid);
router.get('/user/find/:emails', userController.getUsersByEmails);
router.get('/user-company-include', userController.getUserWithCompanyId);
router.get('/user/attempts', userController.getUserAttempts);
router.post('/user', helpers.isAuthenticated, userController.createUser);
router.post('/user-update', helpers.isAuthenticated, userController.updateUser);
router.post('/user/update-ip', helpers.isAuthenticated, userController.updateUserIp);
router.post('/user/find-or-create', helpers.isAuthenticated, userController.findOrCreate);

router.get('/company/company-by-id/:id', companyController.getCompanyById);
router.get('/company/get-id/:key', companyController.getIdByKey);

router.get('/question-group/full/:id', questionGroupController.getAllbyQuestionnaireIdWithFullData);

router.get('/attempt/:id', attemptController.getById);
router.post('/attempt', helpers.isAuthenticated, attemptController.create);
router.post('/attempt-update', helpers.isAuthenticated, attemptController.update);
router.get('/attempt/taken/:email/:qId', attemptController.isAttemptValid);

router.post('/user/answer/find-or-create', helpers.isAuthenticated, userAnswerController.findOrCreate);
router.post('/user/answer', helpers.isAuthenticated, userAnswerController.create);
router.post('/user/answer-update', helpers.isAuthenticated, userAnswerController.update);

router.post('/user/answer-option', helpers.isAuthenticated, userAnswerOptionsController.createOrUpdate);

router.get('/results-report/bycode/:code', resultsReportController.getByCode);

//Incomplete Attempts api
router.get('/incomplete-attempt/:id', incompleteAttemptController.getById);
router.post('/incomplete-attempt', helpers.isAuthenticated, incompleteAttemptController.create);
router.post('/incomplete-attempt/update', helpers.isAuthenticated, incompleteAttemptController.update);
router.post('/incomplete-attempt/delete', incompleteAttemptController.delete);

/**
 * Apis for SIM.
 * All api should be started with 'sim' path.
 */

router.post('/sim/all-pfa-keys', helpers.validateSimToken, simApiController.getAllPfaKeys);
router.post('/sim/create-sim-key', helpers.validateSimToken, simApiController.createSimKey);
router.post('/sim/update-sim-key', helpers.validateSimToken, simApiController.updateSimKey);
router.post('/sim/remove-sim-key', helpers.validateSimToken, simApiController.removeSimKey);
router.post('/sim/add-user-sim-key', helpers.validateSimToken, simApiController.addUserSimKey);
router.post('/sim/remove-user-sim-key', helpers.validateSimToken, simApiController.removeUserSimKey);

module.exports = router;
