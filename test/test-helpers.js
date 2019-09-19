/* eslint-disable quotes */
'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


function makeUsersArray() {
    return [
        {
            id: 1,
            user_name: 'test-user-1@example.com',
            full_name: 'Test user 1',
            password: 'password',
        },
        {
            id: 2,
            user_name: 'test-user-2@example.com',
            full_name: 'Test user 2',
            password: 'password',
        },
        {
            id: 3,
            user_name: 'test-user-3@example.com',
            full_name: 'Test user 3',
            password: 'password',
        },
        {
            id: 4,
            user_name: 'test-user-4@example.com',
            full_name: 'Test user 4',
            password: 'password',
        },
    ];
}

function makeApptTimesArray() {
    return[
        {
            id: 1,
            appt_date: '2020-09-10T14:00:00.000Z',
            available: true
        },
        {
            id: 2,
            appt_date: '2021-09-11T14:00:00.000Z',
            available: true
        },
        {
            id: 3,
            appt_date: '2022-09-12T14:00:00.000Z',
            available: true
        }
    ]
}

function cleanTables(db) {
    return db.transaction(trx => 
        trx.raw(
            `TRUNCATE
            users,
            appt_times
            `
        )
            .then(() => 
                Promise.all([
                    trx.raw(`ALTER SEQUENCE appt_times_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('appt_times_id_seq', 0)`),
                    trx.raw(`SELECT setval('users_id_seq', 0)`),
                ])
            )
    );
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('users').insert(preppedUsers)
        .then(() => 
        // update the auto sequence to stay in sync
        db.raw(
            `SELECT setval('users_id_seq', ?)`,
            [users[users.length-1].id]
        )
      )
  }

function seedApptTimes(db, appt_times) {
    return db.into('appt_times').insert(appt_times)
        .then(() => 
        // update the auto sequence to stay in sync
        db.raw(
            `SELECT setval('appt_times_id_seq', ?)`,
            [appt_times[appt_times.length-1].id]
        )
        )
  }

function makeConnectedFixtures() {
    const connectedUsers = makeUsersArray();
    let connectedApptTimes = makeApptTimesArray();
    //Conneceted part: insert user[0] id into testApptTimes
    for (let i=0; i<connectedApptTimes.length; i++) {
        connectedApptTimes[i].user_id = connectedUsers[0].id;
    }
    return { connectedUsers, connectedApptTimes };
}

function makeJollyLubeFixtures() {
    const testUsers = makeUsersArray()
    // const testTimes = makeTimesArray(testUsers)
    const testTimes = makeApptTimesArray();
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
    makeApptTimesArray,

    seedUsers,
    seedApptTimes,

    makeConnectedFixtures,
    makeJollyLubeFixtures,
    
    cleanTables,
    
    makeAuthHeader,
}
