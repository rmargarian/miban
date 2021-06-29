const enums = {};

enums.QuestionnaireType = {
  ASSESSMENT: 1,
  PROFILE: 2,
  FEEDBACK: 3
};

enums.Routes = {
  ASSESSMENTS: 'assessments',
  PROFILES: 'profiles',
  FEEDBACK: 'feedback',
  AUTHENTICATE: 'auth',
  CHANGE_KEY: 'change-key',
  RESULT: 'result'
};

enums.QuestionnaireStatus = {
  OPEN: 0,
  REOPENED: 1,
  STARTED_REGISTER: 2,
  COMPLETED: 3,
  TIMEOUT: 4
};

enums.PFA_EMAILS = {
  ASSESSMENTS: 'assessment@negotiations.com',
  PROFILES: 'profiles@negotiations.com',
  FEEDBACK: 'feedback@negotiations.com'
};

enums.FaceTypes = {
  HAPPY: 1,
  NEUTRAL: 2,
  SAD: 3,
  LION: '{LION}',
  LEOPARD: '{LEOPARD}',
  CHEETAH: '{CHEETAH}',
  HYENA: '{HYENA}',
  WOLF: '{WOLF}',
  NONE: 0
};

enums.FaceColors = {
  HAPPY: '#03c504',
  NEUTRAL: '#f9ce01',
  SAD: '#e90004',
  NONE: '#9c9d9d'
};

enums.FaceIcons = {
  HAPPY: 'fa-smile',
  NEUTRAL: 'fa-meh',
  SAD: 'fa-frown',
  /*HAPPY: '&#xf118;',
  SAD: '&#xf119;',
  NEUTRAL: '&#xf11a;',*/
  NONE: ''
};

enums.FaceSvgPaths = {
  HAPPY: "M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm80 168c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm-160 0c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm194.8 170.2C334.3 380.4 292.5 400 248 400s-86.3-19.6-114.8-53.8c-13.6-16.3 11-36.7 24.6-20.5 22.4 26.9 55.2 42.2 90.2 42.2s67.8-15.4 90.2-42.2c13.4-16.2 38.1 4.2 24.6 20.5z",
  NEUTRAL: "M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm-80 168c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm176 192H152c-21.2 0-21.2-32 0-32h192c21.2 0 21.2 32 0 32zm-16-128c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z",
  SAD: "M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm80 168c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm-160 0c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm170.2 218.2C315.8 367.4 282.9 352 248 352s-67.8 15.4-90.2 42.2c-13.5 16.3-38.1-4.2-24.6-20.5C161.7 339.6 203.6 320 248 320s86.3 19.6 114.7 53.8c13.6 16.2-11 36.7-24.5 20.4z",
  NONE: ""
};

module.exports = enums;
