'use strict';

const express = require('express');
const path = require('path');
const TimesService = require('./times-service');
const { requireAuth } = require('../middleware/jwt-auth');

const timesRouter = express.Router();
const jsonParser = express.json();

timesRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        TimesService.getAll(req.app.get('db'))
            .then(appts => {
                res.json( appts.map( TimesService.serializeTime ));
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const { appt_date } = req.body
        
        if(!appt_date) return res.status(401).json({ error: 'An appt_date timestamp is required' })
        
        const newApptTime = { 
            appt_date: appt_date,
            available: true,
        }

        TimesService.insertAptTime(
            req.app.get('db'),
            newApptTime
        )
            .then(apptTime => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${apptTime.id}`))
                    .json(TimesService.serializeTime(apptTime))
            })
        .catch(next);
    })



timesRouter
    .route('/cancelAppt/:apptId') 
    .all(requireAuth)
    .all(checkTimeExists)
    .patch(jsonParser, (req, res, next) => {
        
        //check if appt time user_id is empty
        let apptTime = TimesService.getById(
            req.app.get('db'),
            req.params.apptId
        )
        
        const newApptFields = {
            user_id: null,
            available: true
        };

        TimesService.update(
          req.app.get('db'),
          req.params.apptId,
          newApptFields
        )
            .then(appt => {
                res.status(200)
                    .json(TimesService.serializeTime(appt))
            })
            .catch(next);
    })

timesRouter
    .route('/userappts')
    .all(requireAuth)
    .get((req, res, next) => {
        // console.log('----------------- started getting appts --------------')
        TimesService.getAll(req.app.get('db'))
            .then(appts => {
                return appts = appts.filter(appt => appt.user_id === req.user.id)
            })
                .then(appts => {
                    res.status(200)
                        .json(TimesService.serializeAllTimes(appts))
                })
                    .catch(next)
    })

    timesRouter
    .route('/:apptId') 
    .all(requireAuth)
    .all(checkTimeExists)
    .patch(jsonParser, (req, res, next) => {
        
        //check if appt time user_id is empty
        let apptTime = TimesService.getById(
            req.app.get('db'),
            req.params.apptId
        )
        
        const newApptFields = {
            user_id: req.user.id,
            available: false
        };

        TimesService.update(
          req.app.get('db'),
          req.params.apptId,
          newApptFields
        )
            .then(appt => {
                res.status(200)
                    .json(TimesService.serializeTime(appt))
            })
            .catch(next);
    })


/* async/await syntax for promises */
async function checkTimeExists(req, res, next) {
    try {
      const time = await TimesService.getById(
        req.app.get('db'),
        req.params.apptId
      )
  
      if (!time)
        return res.status(404).json({
          error: `That time doesn't exist`
        })
  
      res.time = time
      next()
    } catch (error) {
      next(error)
    }
  }


module.exports = timesRouter