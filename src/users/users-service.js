'use strict';

const xss = require('xss');
const bcrypt = require('bcryptjs');

// eslint-disable-next-line no-useless-escape
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
    hasUserWithUserName(db, user_name) {
        return db('users')
            .where({ user_name })
            .first()
            .then(user => !!user);
    },

    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('users')
            .returning('*')
            .then(([user]) => user);
    },

    hashPassword(password) {
        return bcrypt.hash(password, 12);
    },


    validatePassword(password) {
        if (password.length < 8) {
            return 'Password must be longer than 8 characters';
        }
        if (password.length > 72) {
            return 'Password must be less than 72 characters';
        }
        if ((password.startsWith(' ')) || (password.endsWith(' '))) {
            return 'Password must not start or end with empty spaces';
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must contain 1 upper case, lower case, number and special character';
        }
        return null;
    },

    serializeUser(user) {
        return {
            id: user.id,
            full_name: xss(user.full_name),
            user_name: xss(user.user_name),
            date_created: new Date(user.date_created),
        };
    },
};

module.exports = UsersService;