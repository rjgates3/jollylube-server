'use strict';

const express = require('express');
const path = require('path');
const TimesService = require('./times-service');
const { requireAuth } = require('../middleware/jwt-auth');

const timesRouter = express.Router();
const jsonParser = express.json();

timesRouter
    .route('/times')
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
    .route('/times/:apptId') 
    .all(requireAuth)
    .all(checkTimeExists)
    .patch(jsonParser, (req, res, next) => {
        
        //check if appt time user_id is empty
        let apptTime = TimesService.getById(
            req.app.get('db'),
            req.params.apptId
        )
        //if called the first, or odd time, it sets fields to users info, and is not available
        if(apptTime.length === 0) {
            const newAptFields = {
              user_id: req.user.id,
              available: false
            };
        } 
        //if called second, or even time: user id is empty, and is available
        else {
            const newAptFields = {
                user_id: '',
                available: true
              };
        }

        TimesService.update(
          req.app.get('db'),
          req.params.apptId,
          newAptFields
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