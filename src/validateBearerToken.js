'use strict';

function validateBearerToken(req, res, next) {
    const authHeader = req.get('Authorization');

    if(authHeader === undefined || 
        !authHeader.toLowerCase().startsWith('bearer')) {
        return res.status(401).json({error: 'No valid Auth header found'});
    }
    const token = authHeader.split(' ')[1];

    if(token != process.env.API_TOKEN) {
        return res.status(401).json({error: 'Invalid credentials'});
    }
    next();
}

module.exports = validateBearerToken;