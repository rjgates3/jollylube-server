'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const validateBearerToken = require('./validateBearerToken.js');
const errorHandler = require('./errorHandler');

const app = express();

app.use(morgan((NODE_ENV === 'production')
    ? 'tiny'
    : 'common', {
    skip: () => NODE_ENV === 'test'
}));

app.use(validateBearerToken);

app.use(cors());
app.use(helmet());

app.use(errorHandler);

module.exports = app;