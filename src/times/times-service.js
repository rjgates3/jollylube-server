'use strict';

const xss = require('xss');
const Treeize = require('treeize');

const dbTimesTable = 'appt_times';

const TimesService = {

    getAll(db) {
        return db
            .from(dbTimesTable)
            .select('*');
    },
    
    getById(db, id) {
        return db
            .from(dbTimesTable)
            .select('*')
            .where('id', id)
            .first();
    },
    
    serializeAllTimes(times) {
        return times.map(this.serializeTime);
    },
    
    serializeTime(time) {
        const timeTree = new Treeize();

        const timeData = timeTree.grow([ time ]).getData()[0];

        return {
            id: timeData.id,
            appt_date: xss(timeData.appt_date),
            available: xss(timeData.available),
            user_id: timeData.user_id
        };
    },
    
    update(db, id, newAptFields) {
        return db(dbTimesTable)
            .where({ id })
            .update(newAptFields)
            .returning('*')
            .then(([ aptTime ]) => aptTime)
            .then(aptTime =>
                TimesService.getById(db, aptTime.id)
            );
    },

    insertAptTime(db, newAptFields) {
        return db
            .insert(newAptFields)
            .into(dbTimesTable)
            .returning('*')
            .then(([ aptTime ]) => aptTime)
            .then(aptTime => 
                TimesService.getById(db, aptTime.id));
    }

};

module.exports = TimesService;