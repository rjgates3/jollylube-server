/* eslint-disable quotes */
'use strict';

const bcrypt = require('bcryptjs');


function makeUsersArray() {
    return [
        {
            id: 1,
            user_name: 'test-user-1@mailinator.com',
            full_name: 'Test user 1',
            password: 'password',
            date_created: '2029-01-22T16:28:32.615Z',
        },
        {
            id: 2,
            user_name: 'test-user-2@mailinator.com',
            full_name: 'Test user 2',
            password: 'password',
            date_created: '2029-01-22T16:28:32.615Z',
        },
        {
            id: 3,
            user_name: 'test-user-3@mailinator.com',
            full_name: 'Test user 3',
            password: 'password',
            date_created: '2029-01-22T16:28:32.615Z',
        },
        {
            id: 4,
            user_name: 'test-user-4@mailinator.com',
            full_name: 'Test user 4',
            password: 'password',
            date_created: '2029-01-22T16:28:32.615Z',
        },
    ];
}

function cleanTables(db) {
    return db.transaction(trx => 
        trx.raw(
            `TRUNCATE
            jollylube_users,
            jollylube_times
            `
        )
            .then(() => 
                Promise.all([
                    trx.raw(`ALTER SEQUENCE jollylube_times_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE jollylube_users_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('jollylube_times_id_seq', 0)`),
                    trx.raw(`SELECT setval('jollylube_users_id_seq', 0)`),
                ])
            )
    );
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('jollylube_users').insert(preppedUsers)
      .then(() => 
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('jollylube_users_id_seq', ?)`,
        [users[users.length-1].id]
      )
    )
  }

  function makeJollyLubeFixtures() {
    const testUsers = makeUsersArray()
    // const testTimes = makeTimesArray(testUsers)
    const testTimes = {};
    return { testUsers, testTimes }
  }

  function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
      subject: user.user_name,
      algorithm: "HS256"
    })
    return `Bearer ${token}`;
  }

  module.exports = {
      makeUsersArray,
      cleanTables,
      seedUsers,

      makeJollyLubeFixtures,
      makeAuthHeader,

      
  }
