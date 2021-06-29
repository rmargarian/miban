require('dotenv').config();//instatiate environment variables

let CONFIG = {} //Make this global to use all over the application

CONFIG.user_url   = process.env.BASE_URL || 'https://pfa.negotiations.com/';
CONFIG.base_url   = process.env.BASE_URL || 'https://pfa.negotiations.com/';

CONFIG.env          = process.env.NODE_ENV || 'development';
CONFIG.port         = process.env.PORT || '8080';

CONFIG.db_name      = process.env.DB_NAME || 'ne2_profiles';
CONFIG.db_user      = process.env.DB_USER || 'root';
CONFIG.db_password  = process.env.DB_PASSWORD || 'root';

CONFIG.jwt_encryption  = process.env.JWT_ENCRYPTION || 'rt89w41c75381sf85cf6a61283c9df3f';
CONFIG.jwt_expiration  = process.env.JWT_EXPIRATION || '10000';
// Key for the money converter api https://fixer.io,
// it's free for 1000 requests per month
CONFIG.fixerApiKey  = '5f2f741c75381ad833f6a61283c9df3f';

CONFIG.TOKEN = 'SEcretPFA18+neGotiaT*toK;en';
CONFIG.REPORT_CODE_SIZE = 8;

CONFIG.db_details = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '3306',
  dialect: process.env.DB_DIALECT || 'mysql',
  timezone: process.env.DB_TIMEZONE || 'America/New_York',
  define: {
    timestamps: false,
    freezeTableName: true,
    engine: 'InnoDB'
  },
  pool: {
    max: 10,
    min: 0,
    idle: 2000000,
    acquire: 2000000
  }
  //, logging: false
};

CONFIG.smtp_details = {
  host: process.env.SMTP_HOST || 'mail.negotiations.com',
  port: process.env.SMTP_PORT || 587,
  user: process.env.SMTP_USER || 'pfa@negotiations.com',
  pass: process.env.SMTP_PASS || 'whrVCvvEecWW'
};

CONFIG.imap_service_port = process.env.IMAP_SERVICE_PORT || 8081;
CONFIG.imap_unsub_details = {
  host: process.env.IMAP_HOST || 'mail.negotiations.com',
  port: process.env.IMAP_PORT || 993,
  user: process.env.IMAP_USER || 'unsubscribe-pfa-dev@negotiations.com',
  pass: process.env.IMAP_PASS || 'UoJ3AfoCVCcn'
};

CONFIG.sim = {
  apiUrl: process.env.SIM_API_URL || 'https://igor-sim-test.negotiations.com/admin/api/',
  authKey: {
      toSIM: 'efKHJHFGDRXC15fepoIbszwqRESERX86',
      fromSIM: 'HGVGFg54654DDFDDcdJHGhcdvNJ15'
  }
};

module.exports = CONFIG;


