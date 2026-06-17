const serverless = require('serverless-http');
const { createApp } = require('../server/app');

module.exports = serverless(createApp());
