var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const {UserAdmin} = require('../models');

passport.use(new LocalStrategy({
    usernameField: 'username'
  },
  function (username, password, done) {
    UserAdmin.findOne({where: {username: username}}).then(userAdmin => {
      if (!userAdmin) {
        return UserAdmin.findOne({where: {email: username}}).then(userAdmin => {
          // Return if user not found in database
          if (!userAdmin) {
            return done(null, false, {
              message: 'User admin not found'
            });
          }

          // Return if password is wrong
          if (!userAdmin.validPassword(password)) {
            return done(null, false, {
              message: 'Password is wrong'
            });
          }

          return done(null, userAdmin);
        })
      }

      // Return if password is wrong
      if (!userAdmin.validPassword(password)) {
        return done(null, false, {
          message: 'Password is wrong'
        });
      }

      return done(null, userAdmin);
    })
      .catch(err => {
        return done(err);
      });
  }
));
