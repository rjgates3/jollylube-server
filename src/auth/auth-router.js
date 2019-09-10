'use strict';

const express = require('express');
const jsonBodyParser = express.json();
const authService = require('./auth-service');

const authRouter = express.Router();

authRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
        const { user_name, password } = req.body;
        const loginUser = { user_name, password };
    
        for (const [key, value] of Object.entries(loginUser)) {
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });
        }
        authService.getUserWithUserName(req.app.get('db'), user_name)
            .then(user => {
                if (!user) {
                    return res.status(401).json({error: 'Incorrect user_name or password'});
                }
                return authService.comparePasswords(password, user.password)
                    .then(comparison => {
                        if(!comparison) {
                            return res.status(401).json({error: 'Incorrect user_name or password'});
                        }
                        const payload = { user_id: user.id };
                        const subject = user.user_name;
                        res.send({
                            authToken: authService.createJwt(subject, payload),
                        });
                    }); 
            })
            .catch(next);
    });
                  
module.exports = authRouter;