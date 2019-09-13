'use strict';

const express = require('express');
const path = require('path');
const TimesService = require('./times-service');
const { requireAuth } = require('../middleware/jwt-auth');

const timesRouter = express.Router();
const jsonParser = express.json();

//return appointment times for a given date 
//return a given appointment time given a timeid  --done
//update a given appointment time given a timeid  --done
//return all appointment times for a given userName/user_name 


// should the server return all appointment times?

//need another route /api/times/year/month to get appts for a given month
timesRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        TimesService.getAll(req.app.get('db'))
            .then(times => {
                res.json( times.map( TimesService.serializeTime ));
            })
            .catch(next);
    })
    .post(jsonParser, (req, res, next) => {
        const { apt_date } =req.body
        
        if(!apt_date) return res.status(401).json({ error: 'A apt_date stamp is required' })
        
        //are the apt_dates unique?
        
        const newAptTime = { 
            apt_date: apt_date,
            available: true,
        }

        TimesService.insertAptTime(
            req.app.get('db'),
            newAptTime
        )
            .then(aptTime => {
                res
                    .status(200)
                    .location(path.posix.join(req.originalUrl, `/${aptTime.id}`))
                    .json(TimesService.serializeTime(aptTime))
            })



        .catch(next);
    })

timesRouter
    .route('/:aptId') 
    .all(requireAuth)
    .all(checkTimeExists)
    .get((req, res) => {
        res.json(TimesService.serializeTime(res.time))
    })
    .patch(jsonParser, (req, res, next) => {
        
        //check if apt time is available

        console.log(`${req.user.id}, ${typeof req.user.id}`);
        
        const newAptFields = {
          user_id: req.user.id
          // available: false
        };
        
        TimesService.update(
          req.app.get('db'),
          req.params.aptId,
          newAptFields
        )
            .then(aptTime => {
                res.status(200)
                    .json(TimesService.serializeTime(aptTime))
            })
            .catch(next);
    })

/* async/await syntax for promises */
async function checkTimeExists(req, res, next) {
    try {
      const time = await TimesService.getById(
        req.app.get('db'),
        req.params.aptId
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