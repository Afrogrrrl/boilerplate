const Sequelize = require('sequelize');
const db = require('../database');
const crypto = require('crypto')
const _ = require('lodash')


const exampleUser = db.define('user', {
  google_id: {
    type: Sequelize.STRING
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    unique: true
  },
  password: {
    type: Sequelize.STRING
  },
  salt: {
    type: Sequelize.STRING
  }
}, {
  hooks: {
    beforeCreate: setSaltAndPassword,
    beforeUpdate: setSaltAndPassword
  }
})

// instance methods
exampleUser.prototype.correctPassword = function (candidatePassword) {
  // should return true or false for if the entered password matches
  return this.Model.encryptPassword(candidatePassword, this.salt) === this.password;
};

exampleUser.prototype.sanitize = function () {
  //sanitize our outputs so we don't overshare info with server
  return _.omit(this.toJSON(), ['password', 'salt']);
};

// class methods
exampleUser.generateSalt = function () {
  // this should generate our random salt
  return crypto.randomBytes(16).toString('base64');
};

exampleUser.encryptPassword = function (plainText, salt) {
  // accepts a plain text password and a salt, and returns its hash
  const hash = crypto.createHash('sha1');
  hash.update(plainText);
  hash.update(salt);
  return hash.digest('hex');
};

function setSaltAndPassword (user) {
  // we need to salt and hash again when the user enters their password for the first time
  // and do it again whenever they change it
  if (user.changed('password')) {
    user.salt = exampleUser.generateSalt()
    user.password = exampleUser.encryptPassword(user.password, user.salt)
  }

}

module.exports = exampleUser;
