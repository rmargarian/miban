const Sequelize = require('sequelize');
const sequelize = require('./app/services/db');
const crypto = require('crypto');
let sql = ``;

/*TODO
Delete deligate_id COLUMN from `attempts` table
DROP `deligates` table
DROP `delegates_questionnaire_attempt_limit` table
DROP `delegates_questionnaire_contact` table
DROP `delegates_questionnaire_info` table

ALTER TABLE users DROP full_name
*/

const Users = sequelize.define('users', {
  salt: Sequelize.STRING,
  pass_hash: Sequelize.STRING,
  passwd: Sequelize.STRING
});

//users table************************************************************************************************************
//Add company_id
sql = `ALTER TABLE users ADD COLUMN company_id int(10) unsigned NOT NULL AFTER id;`;
sequelize.query(sql).then(myTableRows => {
  sql = `ALTER TABLE users ADD FOREIGN KEY (company_id) REFERENCES companies(id);`;
  return sequelize.query(sql);
}).then(myTableRows => {
  //Fill company_id
  sql = `UPDATE users SET users.company_id = (SELECT deligates.company_id FROM deligates WHERE deligates.user_id = users.id);`;
  sequelize.query(sql);
});
//
//Add first_name
sql = `ALTER TABLE users ADD COLUMN first_name varchar(512) COLLATE 'utf8_general_ci' NOT NULL AFTER full_name;`;
sequelize.query(sql).then(myTableRows => {
  //Fill first_name
  sql = `UPDATE users SET users.first_name = users.full_name;`;
  sequelize.query(sql);
});
//
//Add p_date
sql = `ALTER TABLE users ADD COLUMN p_date datetime DEFAULT NULL;`;
sequelize.query(sql).then(myTableRows => {
  //Fill p_date
  sql = `UPDATE users SET users.p_date = (SELECT deligates.p_date FROM deligates WHERE deligates.user_id = users.id);`;
  sequelize.query(sql);
});
//
//Add p_location
sql = `ALTER TABLE users ADD COLUMN p_location varchar(150) COLLATE 'utf8_general_ci' DEFAULT NULL;`;
sequelize.query(sql).then(myTableRows => {
  //Fill p_location
  sql = `UPDATE users SET users.p_location = (SELECT deligates.p_location FROM deligates WHERE deligates.user_id = users.id);`;
  sequelize.query(sql);
});
//
//Add last_attempt
sql = `ALTER TABLE users ADD COLUMN last_attempt datetime DEFAULT NULL;`;
sequelize.query(sql).then(myTableRows => {
  //Fill last_attempt
  sql = `UPDATE users SET users.last_attempt = (SELECT deligates.last_attempt FROM deligates WHERE deligates.user_id = users.id);`;
  sequelize.query(sql);
});
//
//Add tick
sql = `ALTER TABLE users ADD COLUMN tick int(1) NOT NULL DEFAULT 1;`;
sequelize.query(sql).then(myTableRows => {
  //Fill tick
  sql = `UPDATE users SET users.tick = (SELECT deligates.tick FROM deligates WHERE deligates.user_id = users.id);`;
  sequelize.query(sql);
});
//
//Add salt
sql = `ALTER TABLE users ADD COLUMN salt varchar(128) COLLATE 'utf8_general_ci' DEFAULT NULL AFTER passwd;`;
sequelize.query(sql).then(myTableRows => {
  //Add pass_hash
  sql = `ALTER TABLE users ADD COLUMN pass_hash varchar(256) COLLATE 'utf8_general_ci' DEFAULT NULL AFTER salt;`;
  return sequelize.query(sql);
}).then(myTableRows => {
  //Fill salt by zerros
  sql = `UPDATE users SET users.salt = 0;`;
  return sequelize.query(sql);
}).then(myTableRows => {
  Users.findAll({where: {salt: 0}})
    .then(function (users) {
      users.forEach(function (user) {
        //Generate salt for each user
        let query = `UPDATE users SET users.salt = $1 where id = $2`;
        sequelize.query(query, {bind: [crypto.randomBytes(16).toString('hex'), user.id]}).then(myTableRows => {
          //Get user with new generated salt
          Users.findOne({where: {id: user.id}}).then(function (user2) {
            if(typeof user.passwd === 'string' || user.passwd instanceof String){
              let hash = crypto.pbkdf2Sync(user.passwd, user2.salt, 1000, 64, 'sha512').toString('hex');
              let query = `UPDATE users SET users.pass_hash = $1 where id = $2`;
              sequelize.query(query, {bind: [hash, user.id]});
            }
          });
        });
      });
    });
});
//
//attempts table************************************************************************************************************
//Add user_id
sql = `ALTER TABLE attempts ADD COLUMN user_id int(10) unsigned NOT NULL AFTER id;`;
sequelize.query(sql).then(myTableRows => {
  sql = `ALTER TABLE attempts ADD FOREIGN KEY (user_id) REFERENCES users(id);`;
  return sequelize.query(sql);
}).then(myTableRows => {
  //Fill user_id
  sql = `UPDATE attempts SET attempts.user_id = (SELECT deligates.user_id FROM deligates WHERE deligates.id = attempts.deligate_id);`;
  sequelize.query(sql)
});
//
//users_questionnaire_contact table************************************************************************************************************
//Create users_questionnaire_contact instead of delegates_questionnaire_contact table
sql = `CREATE TABLE users_questionnaire_contact
(   user_id int(10) unsigned NOT NULL DEFAULT 0 references users(id),
    del int(10) unsigned NOT NULL DEFAULT 0 references users(id),
    id_questionnaire int(10) unsigned NOT NULL DEFAULT 0 references questionnaires(id),
    contact char(1) COLLATE 'utf8_general_ci' NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, id_questionnaire)
)`;
sequelize.query(sql).then(myTableRows => {
  //Fill table from delegates_questionnaire_contact
  sql = `INSERT INTO users_questionnaire_contact (user_id, id_questionnaire, contact, del)
  SELECT id_delegate, id_questionnaire, contact, id_delegate
  FROM delegates_questionnaire_contact`;
  return sequelize.query(sql);
}).then(myTableRows => {
  //Get all users ids by delegate_id
  sql = `UPDATE users_questionnaire_contact SET users_questionnaire_contact.del =
  (SELECT deligates.user_id FROM deligates WHERE deligates.id = users_questionnaire_contact.del)`;
  return sequelize.query(sql);
}).then(myTableRows => {
  //Delete all records with unexisting users
  sql = `DELETE from users_questionnaire_contact WHERE del=0;`;
  return sequelize.query(sql);
}).then(myTableRows => {
  //Move all records from del to user_id column
  sql = `UPDATE users_questionnaire_contact SET users_questionnaire_contact.user_id = users_questionnaire_contact.del`;
  return sequelize.query(sql);
}).then(myTableRows => {
  //Remove del column
  sql = `ALTER TABLE users_questionnaire_contact DROP COLUMN del`;
  return sequelize.query(sql);
});
//
//users_questionnaire_info table************************************************************************************************************
//Create users_questionnaire_info instead of delegates_questionnaire_info table
sql = `CREATE TABLE users_questionnaire_info
(   user_id int(10) unsigned NOT NULL DEFAULT 0 references users(id),
    del int(10) unsigned NOT NULL DEFAULT 0 references users(id),
    id_questionnaire int(10) unsigned NOT NULL DEFAULT 0 references questionnaires(id),
    info text COLLATE 'latin1_swedish_ci' NOT NULL,
    PRIMARY KEY (user_id, id_questionnaire)
)`;
sequelize.query(sql).then(myTableRows => {
  //Fill table from delegates_questionnaire_contact
  sql = `INSERT INTO users_questionnaire_info (user_id, id_questionnaire, info, del)
  SELECT id_delegate, id_quest, info, id_delegate
  FROM delegates_questionnaire_info`;
  return sequelize.query(sql);
}).then(myTableRows => {
  //Get all users ids by delegate_id
  sql = `UPDATE users_questionnaire_info SET users_questionnaire_info.del =
  (SELECT deligates.user_id FROM deligates WHERE deligates.id = users_questionnaire_info.del)`;
  return sequelize.query(sql);
}).then(myTableRows => {
  //Delete all records with unexisting users
  sql = `DELETE from users_questionnaire_info WHERE del=0;`;
  return sequelize.query(sql);
}).then(myTableRows => {
  //Move all records from del to user_id column
  sql = `UPDATE users_questionnaire_info SET users_questionnaire_info.user_id = users_questionnaire_info.del`;
  return sequelize.query(sql);
}).then(myTableRows => {
  //Remove del column
  sql = `ALTER TABLE users_questionnaire_info DROP COLUMN del`;
  return sequelize.query(sql);
});
//
//users_questionnaire_attempt_limit table************************************************************************************************************
//Create users_questionnaire_attempt_limit instead of delegates_questionnaire_attempt_limit table
sql = `CREATE TABLE users_questionnaire_attempt_limit
(   user_id int(10) unsigned NOT NULL DEFAULT 0 references users(id),
    del int(10) unsigned NOT NULL DEFAULT 0 references users(id),
    id_questionnaire int(10) unsigned NOT NULL DEFAULT 0 references questionnaires(id),
    attempts_limit int(1) DEFAULT 1,
    report_completion int(1) DEFAULT 1,
    PRIMARY KEY (user_id, id_questionnaire)
)`;
sequelize.query(sql).then(myTableRows => {
  //Fill table from delegates_questionnaire_contact
  sql = `INSERT INTO users_questionnaire_attempt_limit (user_id, id_questionnaire, attempts_limit, report_completion, del)
  SELECT delegate_id, questionnaire_id, attempts_limit, report_completion, delegate_id
  FROM delegates_questionnaire_attempt_limit`;
  return sequelize.query(sql);
}).then(myTableRows => {
  //Get all users ids by delegate_id
  sql = `UPDATE users_questionnaire_attempt_limit SET users_questionnaire_attempt_limit.del =
  (SELECT deligates.user_id FROM deligates WHERE deligates.id = users_questionnaire_attempt_limit.del)`;
  return sequelize.query(sql);
}).then(myTableRows => {
  //Delete all records with unexisting users
  sql = `DELETE from users_questionnaire_attempt_limit WHERE del=0;`;
  return sequelize.query(sql);
}).then(myTableRows => {
  //Move all records from del to user_id column
  sql = `UPDATE users_questionnaire_attempt_limit SET users_questionnaire_attempt_limit.user_id = users_questionnaire_attempt_limit.del`;
  return sequelize.query(sql);
}).then(myTableRows => {
  //Remove del column
  sql = `ALTER TABLE users_questionnaire_attempt_limit DROP COLUMN del`;
  sequelize.query(sql);
});
//
//User Admin table************************************************************************************************************

let dropUsersAdminColumns = 'ALTER TABLE ne2_profiles.users_admin ' +
  'DROP COLUMN email2,' +
  'DROP COLUMN username_canonical,' +
  'DROP COLUMN currency_country,' +
  'DROP COLUMN password_requested_at,' +
  'DROP COLUMN expires_at,' +
  'DROP COLUMN expired,' +
  'DROP COLUMN locked,' +
  'DROP COLUMN email_canonical;';
let changeUsersAdminColumns = 'ALTER TABLE `users_admin` CHANGE COLUMN `confirmation_token` `password_change_token` VARCHAR(255) NULL DEFAULT NULL,' +
  'CHANGE COLUMN `default_currency` `currency_country` SMALLINT(5) UNSIGNED NOT NULL DEFAULT \'145\',' +
  'ADD COLUMN `password_change_token_date_expiration` DATETIME NULL AFTER `password_change_token`,' +
  'CHANGE COLUMN `credentials_expired` `credentials_expired` TINYINT(1) NULL;';

sequelize.query(dropUsersAdminColumns).then(sequelize.query(changeUsersAdminColumns));

/*
const Sequelize = require('sequelize');
const sequelize = require('./app/services/db');
const crypto = require('crypto');
let sql = ``;

const Users = sequelize.define('users', {
  salt: Sequelize.STRING,
  pass_hash: Sequelize.STRING,
  passwd: Sequelize.STRING
});

// users table************************************************************************************************************

let selectUsersIds = `SELECT users.id FROM users`;

let addColumnCompanyIdToUsers = `ALTER TABLE users ADD COLUMN company_id int(10) unsigned AFTER id;`;
let addForeignKeyToUsers = `ALTER TABLE users ADD FOREIGN KEY (company_id) REFERENCES companies(id);`;
let addColumnFirstNameToUsers = `ALTER TABLE users ADD COLUMN first_name varchar(512) COLLATE 'utf8_general_ci' NOT NULL AFTER full_name;`;
let updateUsersFirstName = `UPDATE users SET users.first_name = users.full_name;`;
let dropUsersFullName = `ALTER TABLE users DROP full_name;`;

let updateDeligatesPDate = `UPDATE deligates SET deligates.p_date = NULL WHERE CAST(deligates.p_date AS CHAR(20)) = '0000-00-00 00:00:00';`;
let addColumnPDateToUsers = `ALTER TABLE users ADD COLUMN p_date datetime DEFAULT NULL;`;

let addColumnPLocationToUsers = `ALTER TABLE users ADD COLUMN p_location varchar(150) COLLATE 'utf8_general_ci' DEFAULT NULL;`;

let addColumnLastAttemptToUsers = `ALTER TABLE users ADD COLUMN last_attempt datetime DEFAULT NULL;`;

let addColumnTickToUsers = `ALTER TABLE users ADD COLUMN tick int(1) NULL DEFAULT 1;`;

let addColumnSaltToUsers = `ALTER TABLE users ADD COLUMN salt varchar(128) COLLATE 'utf8_general_ci' DEFAULT NULL AFTER passwd;`;
let addColumnPassHashToUsers = `ALTER TABLE users ADD COLUMN pass_hash varchar(256) COLLATE 'utf8_general_ci' DEFAULT NULL AFTER salt;`;
let updateUsersSalt = `UPDATE users SET users.salt = '0';`;

function recursiveQuery(invokeCounter, rows, queryBuilderCb) {
  let row = rows[invokeCounter];
  let updateUserIdQuery = queryBuilderCb(row);
  sequelize.query(updateUserIdQuery).then(() => {
    if (invokeCounter > 0) {
      invokeCounter--;
      recursiveQuery(invokeCounter, rows, queryBuilderCb);
    }
  })
}

sequelize.query(addColumnCompanyIdToUsers).then(x => {
  return sequelize.query(addForeignKeyToUsers)
})
  .then(x => {
    return sequelize.query(selectUsersIds)
      .then(rows => {
        let length = rows[0].length - 1;
        recursiveQuery(length, rows[0], (row) => {
          return `UPDATE users SET users.company_id = (SELECT IF(
              (SELECT deligates.company_id FROM deligates WHERE deligates.user_id = ` + row.id + `) is null, 0,
              (SELECT deligates.company_id FROM deligates WHERE deligates.user_id = ` + row.id + `)))
               WHERE users.id = ` + row.id + `; `;
        });
      })
  })
  .then(x => {
    return sequelize.query(addColumnFirstNameToUsers)
  })
  .then(x => {
    return sequelize.query(updateUsersFirstName)
  })
  .then(x => {
    sequelize.query(dropUsersFullName)
  })
  .then(x => {
    return sequelize.query(updateDeligatesPDate)
  })
  .then(x => {
    return sequelize.query(addColumnPDateToUsers)
  })
  .then(x => {
    sequelize.query(selectUsersIds)
      .then(rows => {
        let length = rows[0].length - 1;
        recursiveQuery(length, rows[0], (row) => {
          return `UPDATE users SET users.p_date = (SELECT IF(
              (SELECT deligates.p_date FROM deligates WHERE deligates.user_id = ` + row.id + `) is null, DEFAULT(p_date),
              (SELECT deligates.p_date FROM deligates WHERE deligates.user_id = ` + row.id + `)))
               WHERE users.id = ` + row.id + `; `;
        });
      })
  })
  .then(x => {
    return sequelize.query(addColumnPLocationToUsers)
  })
  .then(x => {
    sequelize.query(selectUsersIds)
      .then(rows => {
        let length = rows[0].length - 1;
        recursiveQuery(length, rows[0], (row) => {
          return `UPDATE users SET users.p_location = (SELECT IF(
              (SELECT deligates.p_location FROM deligates WHERE deligates.user_id = ` + row.id + `) is null, DEFAULT(p_location),
              (SELECT deligates.p_location FROM deligates WHERE deligates.user_id = ` + row.id + `)))
               WHERE users.id = ` + row.id + `; `;
        });
      })
  })
  .then(x => {
    return sequelize.query(addColumnLastAttemptToUsers)
  })
  .then(x => {
    sequelize.query(selectUsersIds)
      .then(rows => {
        let length = rows[0].length - 1;
        recursiveQuery(length, rows[0], (row) => {
          return `UPDATE users SET users.last_attempt = (SELECT IF(
              (SELECT deligates.last_attempt FROM deligates WHERE deligates.user_id = ` + row.id + `) is null, DEFAULT(last_attempt),
              (SELECT deligates.last_attempt FROM deligates WHERE deligates.user_id = ` + row.id + `)))
               WHERE users.id = ` + row.id + `; `;
        });
      })

  })
  .then(x => {
    return sequelize.query(addColumnTickToUsers)
  })
  .then(x => {
    sequelize.query(selectUsersIds)
      .then(rows => {
        let length = rows[0].length - 1;
        recursiveQuery(length, rows[0], (row) => {
          return `UPDATE users SET users.tick = (SELECT IF(
              (SELECT deligates.tick FROM deligates WHERE deligates.user_id = ` + row.id + `) is null, DEFAULT(tick),
              (SELECT deligates.tick FROM deligates WHERE deligates.user_id = ` + row.id + `)))
               WHERE users.id = ` + row.id + `; `;
        });
      })
  })
  .then(x => {
    return sequelize.query(addColumnSaltToUsers)
  })
  .then(x => {
    return sequelize.query(addColumnPassHashToUsers)
  })
  .then(x => {
    return sequelize.query(updateUsersSalt)
  })
  .then(myTableRows => {
    Users.findAll({where: {salt: '0'}})
      .then(function (users) {
        users.forEach(function (user) {
          // Generate salt for each user
          let query = `UPDATE users SET users.salt = $1 where id = $2`;
          let salt = crypto.randomBytes(16).toString('hex');
          sequelize.query(query, {bind: [salt, user.id]}).then(myTableRows => {
            //Get user with new generated salt
            if (typeof user.passwd === 'string' || user.passwd instanceof String) {
              let hash = crypto.pbkdf2Sync(user.passwd, salt, 1000, 64, 'sha512').toString('hex');
              let query = `UPDATE users SET users.pass_hash = $1 where id = $2`;
              sequelize.query(query, {bind: [hash, user.id]});
            }
          });
        });
      });
  });


// attempts table************************************************************************************************************

let selectDeligatesIds = `SELECT attempts.deligate_id FROM attempts;`;
let addColumnUserIdToAttempts = `ALTER TABLE attempts ADD COLUMN user_id int(10) unsigned NOT NULL AFTER id;`;
sequelize.query(addColumnUserIdToAttempts).then(x => {
  return sequelize.query(selectDeligatesIds).then(rows => {
    let length = rows[0].length - 1;
    recursiveQuery(length, rows[0], (row) => {
      return `UPDATE attempts SET attempts.user_id = (SELECT IF(
          (SELECT deligates.user_id FROM deligates WHERE deligates.id = ` + row.deligate_id + `) is null, DEFAULT(attempts.id),
          (SELECT deligates.user_id FROM deligates WHERE deligates.id = ` + row.deligate_id + `)))
           WHERE attempts.deligate_id = ` + row.deligate_id + `; `;
    })
  })
});

// users_questionnaire_contact table************************************************************************************************************

let createUsersQCTable = `CREATE TABLE users_questionnaire_contact
(   user_id int(10) unsigned NOT NULL DEFAULT 0 references users(id),
    del int(10) unsigned NOT NULL DEFAULT 0 references users(id),
    id_questionnaire int(10) unsigned NOT NULL DEFAULT 0 references questionnaires(id),
    contact char(1) COLLATE 'utf8_general_ci' NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, id_questionnaire)
    );`;

let mergeDataFromDelegatesQCToUsersQC = `INSERT INTO users_questionnaire_contact (user_id, id_questionnaire, contact, del)
                                        SELECT id_delegate, id_questionnaire, contact, id_delegate
                                        FROM delegates_questionnaire_contact;`;

let selectDelegatesId = `SELECT users_questionnaire_contact.del FROM users_questionnaire_contact;`;
let deleteUnexistingDelegates = `DELETE from users_questionnaire_contact WHERE del=0;`;
let updateDelegatesUserId = `UPDATE users_questionnaire_contact SET users_questionnaire_contact.user_id = users_questionnaire_contact.del;`;
let dropDelegatesDelColumn = `ALTER TABLE users_questionnaire_contact DROP del;`;

sequelize.query(createUsersQCTable)
  .then(x => {
    return sequelize.query(mergeDataFromDelegatesQCToUsersQC)
  })
  .then(sequelize.query(selectDelegatesId))
  .then(rows => {
    let length = rows[0].length;
    for (let i = 0; i < length; i++) {
      let updateUserIdQuery = `UPDATE users_questionnaire_contact SET users_questionnaire_contact.del = (SELECT IF(
      (SELECT deligates.user_id FROM deligates WHERE deligates.id = ` + rows[0][i].del + `) is null, DEFAULT(users_questionnaire_contact.del),
      (SELECT deligates.user_id FROM deligates WHERE deligates.id = ` + rows[0][i].del + `)))
       WHERE users_questionnaire_contact.user_id = ` + rows[0][i].del + `;`;
      sequelize.query(updateUserIdQuery);
    }
  })
  .then(x => {
    return sequelize.query(deleteUnexistingDelegates)
  })
  .then(x => {
    return sequelize.query(updateDelegatesUserId)
  })
  .then(x => {
    sequelize.query(dropDelegatesDelColumn)
  });

// users_questionnaire_info table************************************************************************************************************
//Create users_questionnaire_info instead of delegates_questionnaire_info table

let creareUsersQITable = `CREATE TABLE users_questionnaire_info
(   user_id int(10) unsigned NOT NULL DEFAULT 0 references users(id),
    del int(10) unsigned NOT NULL DEFAULT 0,
    id_questionnaire int(10) unsigned NOT NULL DEFAULT 0 references questionnaires(id),
    info text COLLATE 'latin1_swedish_ci' NOT NULL,
    PRIMARY KEY (user_id, id_questionnaire)
)`;

let mergeDataFromDelegatesQIToUsersQI = `INSERT INTO users_questionnaire_info (user_id, id_questionnaire, info, del)
  SELECT id_delegate, id_quest, info, id_delegate
  FROM delegates_questionnaire_info;`;
let deleteUsersQIUnexistingUsers = `DELETE from users_questionnaire_info WHERE del=0;`;
let updateUsersQIUserId = `UPDATE users_questionnaire_info SET users_questionnaire_info.user_id = users_questionnaire_info.del;`;
let dropUsersQIDelColumn = `ALTER TABLE users_questionnaire_info DROP  del;`;

sequelize.query(creareUsersQITable)
  .then(x => {
    return sequelize.query(mergeDataFromDelegatesQIToUsersQI)
  })
  .then(rows => {
    let length = rows[0].length;
    for (let i = 0; i < length; i++) {
      let updateUserIdQuery = `UPDATE users_questionnaire_info SET users_questionnaire_info.del = (SELECT IF(
      (SELECT deligates.user_id FROM deligates WHERE deligates.id = ` + rows[0][i].del + `) is null, DEFAULT(users_questionnaire_info.del),
      (SELECT deligates.user_id FROM deligates WHERE deligates.id = ` + rows[0][i].del + `)))
       WHERE users_questionnaire_info.user_id = ` + rows[0][i].del + `;`;
      sequelize.query(updateUserIdQuery);
    }
  })
  .then(x => {
    sequelize.query(deleteUsersQIUnexistingUsers)
  })
  .then(x => {
    return sequelize.query(updateUsersQIUserId)
  })
  .then(x => {
    sequelize.query(dropUsersQIDelColumn)
  });

// // users_questionnaire_attempt_limit table************************************************************************************************************
// //Create users_questionnaire_attempt_limit instead of delegates_questionnaire_attempt_limit table

let createUsersQALTable = `CREATE TABLE users_questionnaire_attempt_limit
(   user_id int(10) unsigned NOT NULL DEFAULT 0 references users(id),
    del int(10) unsigned NOT NULL DEFAULT 0 references users(id),
    id_questionnaire int(10) unsigned NOT NULL DEFAULT 0 references questionnaires(id),
    attempts_limit int(1) DEFAULT 1,
    report_completion int(1) DEFAULT 1,
    PRIMARY KEY (user_id, id_questionnaire)
)`;

let mergeDataFromDelegatesQALToUsersAL = `INSERT INTO users_questionnaire_attempt_limit (user_id, id_questionnaire, attempts_limit, report_completion, del)
  SELECT delegate_id, questionnaire_id, attempts_limit, report_completion, delegate_id
  FROM delegates_questionnaire_attempt_limit;`;
let deleteUsersQALUnexistingUsers = `DELETE from users_questionnaire_attempt_limit WHERE del=0;`;
let updateUsersQALUserId = `UPDATE users_questionnaire_attempt_limit SET users_questionnaire_attempt_limit.user_id = users_questionnaire_attempt_limit.del;`;
let dropUsersQALDelColumn = `ALTER TABLE users_questionnaire_attempt_limit DROP del;`;
sequelize.query(createUsersQALTable)
  .then(x => {
    return sequelize.query(mergeDataFromDelegatesQALToUsersAL)
  })
  .then(rows => {
    let length = rows[0].length;
    for (let i = 0; i < length; i++) {
      let updateUserIdQuery = `UPDATE users_questionnaire_attempt_limit SET users_questionnaire_attempt_limit.del = (SELECT IF(
      (SELECT deligates.user_id FROM deligates WHERE deligates.id = ` + rows[0][i].del + `) is null, DEFAULT(users_questionnaire_attempt_limit.del),
      (SELECT deligates.user_id FROM deligates WHERE deligates.id = ` + rows[0][i].del + `)))
       WHERE users_questionnaire_attempt_limit.user_id = ` + rows[0][i].del + `;`;
      sequelize.query(updateUserIdQuery);
    }
  })
  .then(x => {
    return sequelize.query(deleteUsersQALUnexistingUsers)
  }).then(x => {
  return sequelize.query(updateUsersQALUserId)
})
  .then(x => {
    sequelize.query(dropUsersQALDelColumn)
  });

// User Admin table************************************************************************************************************

let dropUsersAdminColumns = 'ALTER TABLE ne2_profiles.users_admin ' +
  'DROP COLUMN email2,' +
  'DROP COLUMN username_canonical,' +
  'DROP COLUMN currency_country,' +
  'DROP COLUMN password_requested_at,' +
  'DROP COLUMN expires_at,' +
  'DROP COLUMN expired,' +
  'DROP COLUMN locked,' +
  'DROP COLUMN email_canonical;';
let changeUsersAdminColumns = 'ALTER TABLE `users_admin` CHANGE COLUMN `confirmation_token` `password_change_token` VARCHAR(255) NULL DEFAULT NULL,' +
  'CHANGE COLUMN `default_currency` `currency_country` SMALLINT(5) UNSIGNED NOT NULL DEFAULT \'145\',' +
  'ADD COLUMN `password_change_token_date_expiration` DATETIME NULL AFTER `password_change_token`,' +
  'CHANGE COLUMN `credentials_expired` `credentials_expired` TINYINT(1) NULL;';

sequelize.query(dropUsersAdminColumns).then(sequelize.query(changeUsersAdminColumns));
*/
