/* eslint-disable quotes */
'use strict';

const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

const expected = [
    {
        id: 1,
        appt_date: 'Thu Sep 10 2020 08:00:00 GMT-0600 (Mountain Daylight Time)',
        available: "true"
    },
    {
        id: 2,
        appt_date: 'Sat Sep 11 2021 08:00:00 GMT-0600 (Mountain Daylight Time)',
        available: "true"
    },
    {
        id: 3,
        appt_date: 'Mon Sep 12 2022 08:00:00 GMT-0600 (Mountain Daylight Time)',
        available: "true"
    }
];


describe('ApptTimes Endpoints', function() {
    let db;

    const {
        testUsers,
        testTimes
    } = helpers.makeJollyLubeFixtures();

    const {
        connectedUsers,
        connectedApptTimes
    } = helpers.makeConnectedFixtures();

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('cleanup tables', () => helpers.cleanTables(db));

    afterEach('cleanup tables', () => helpers.cleanTables(db));

    // GET /api/times returns all appt times in the db
    describe('GET /api/times', () => {

        //Need users to create an Auth Header
        beforeEach('seed users', () => 
            helpers.seedUsers(db, testUsers)
        );

        context('Given no appt times in db', () => {

            it('Responds with 200, and an empty list', () => {
                return supertest(app)
                    .get('/api/times')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });

        });

        context('Given there are appts. in the db', () => {

            //seed the appt times db
            beforeEach('seed appt times', () =>
                helpers.seedApptTimes(
                    db, 
                    testTimes
                )
            );

            it('Given an id in the db, responds with 200, and a list of appt times', () => {
                const expectedTimes = expected;
                return supertest(app)
                    .get('/api/times')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedTimes);
            });


        });

        context('Given and XSS attack on appt times db', () => {});

    });

    //POST /api/times creates a new entry in the appt times db
    describe('POST /api/times', () => {

        //Need users to create an Auth Header
        beforeEach('seed users', () => 
            helpers.seedUsers(db, testUsers)
        );

        context('Given no appt times in db', () => {

            it('Responds with 200', () => {

                const newApptTime = {
                    appt_date: '2020-06-23T14:00:00.000Z',
                    available: true
                };

                const expectedTime = {
                    id: 1,
                    appt_date: `Tue, 23 June 2020 14:00:00 GMT`,
                    available: true
                };

                return supertest(app)
                    .post('/api/times')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newApptTime)
                    .expect(201)
                    .expect(res => 
                        db
                            .from('appt_times')
                            .select('*')
                            .where({ id: res.body.id })
                            .first()
                            .then(row => {
                                // expect(row.appt_date).to.eql(expectedTime.appt_date);
                                expect(row.available).to.eql(expectedTime.available);  
                            })
                    );
            });

        });

        context('Given there are appts in the db', () => {

            //seed the appt times db
            beforeEach('seed appt times', () =>
                helpers.seedApptTimes(db, testTimes)
            );

            it('Responds with 200, and the new appt time', () => {
                const newApptTime = {
                    appt_date: '2020-06-23T14:00:00.000Z',
                    available: true
                };

                const expectedTime = {
                    id: 1,
                    appt_date: `Tue, 23 June 2020 14:00:00 GMT`,
                    available: true
                };

                return supertest(app)
                    .post('/api/times')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newApptTime)
                    .expect(201)
                    .expect(res => 
                        db
                            .from('appt_times')
                            .select('*')
                            .where({ id: res.body.id })
                            .first()
                            .then(row => {
                                // expect(row.appt_date).to.eql(expectedTime.appt_date);
                                expect(row.available).to.eql(expectedTime.available);  
                            })
                    );
            });

        });

    });

    //GET /api/times/:apptId gets the specific apptId from the appt times db
    //The client does not need this route -- remove it.
    describe('GET /api/times/:apptId', () => {});

    //PATCH /api/times/:apptID updates the specific apptId in the appt times db
    describe('PATCH /api/times/:apptId', () => {

        //Need users to create an Auth Header
        beforeEach('seed users', () => 
            helpers.seedUsers(db, testUsers)
        );

        context('Given no appt. times in db', () => {

            
            it('Responds with 404', () => {
                const fakeApptTimeId = 1234;

                return supertest(app)
                    .patch(`/api/times/${fakeApptTimeId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404);
            });

        });

        context('Given there are appts. in the db', () => {

            //seed the appt times db
            beforeEach('seed appt times', () =>
                helpers.seedApptTimes(db, testTimes)
            );

            it('Given an id in the db, responds with 200', () => {

                const ApptTimeId = testTimes[0].id;

                return supertest(app)
                    .patch(`/api/times/${ApptTimeId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200);
            });

            it('Given an id not in the db, responds with 404', () => {
                const fakeApptTimeId = 1234;

                return supertest(app)
                    .patch(`/api/times/${fakeApptTimeId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404);
            });

        });

    });

    //GET /api/userappts retrieves all appts for the current user
    describe('GET /api/userappts', () => {

        context('Given users in db', () => {
            //seed users
            beforeEach('seed users', () => 
                helpers.seedUsers(db, connectedUsers)
            );

            context('Given appt connected appt times in db', () => {

                //seed connected appt times
                beforeEach('seed appt times', () => {
                    helpers.seedApptTimes(db, connectedApptTimes);
                });

                it('Responds with 200 and a list of appt times', () => {

                    return supertest(app)
                        .get('/api/userappts')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200);
                });
            
            });
        });
    });
});