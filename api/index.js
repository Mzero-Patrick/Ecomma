const serverless = require('serverless-http');
const { createApp } = require('../server/app');

const handler = serverless(createApp());

module.exports = async (req, res) => {
  return handler(req, res);
};
