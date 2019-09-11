'use strict';

const xss = require('xss');
const Treeize = require('treeize');

const dbTimesTable = 'apt_times';

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
            apt_date: xss(timeData.apt_date),
            avaliable: xss(timeData.avaliable),
            user_id: timeData.user_id
        };
    },
    
    update(db, id, newAptFields) {
        console.log('reaced times service');
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