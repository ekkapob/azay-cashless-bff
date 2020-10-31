const axios = require('axios');
const { v4: uuid } = require('uuid');
const config = require('./config.json');

const { url, app_key, app_secret } = config.auth;

function handler(req, res, next) {
  // TODO: Store and retrieve valid access_token

  const requestUId = uuid();
  axios({
    method: 'post',
    baseURL: config.base_url,
    url,
    headers: {
      'Content-Type': 'application/json',
      'resourceOwnerId': 'cashless',
      'requestUId': requestUId,
      'accept-language': 'EN',
    },
    data: JSON.stringify({
      applicationKey: app_key,
      applicationSecret: app_secret,
    }),
  })
    .then(response => {
      const { data } = response.data;
      const { accessToken, expiresIn, expiresAt } = data;
      req.session.auth = {
        accessToken,
        expiresIn,
        expiresAt,
      };
      req.session.requestUId = requestUId;

      next();
    })
    .catch(err => {
      res.sendStatus(401);
    });
};

module.exports = {
  handler,
};

