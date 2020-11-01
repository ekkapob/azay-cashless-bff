const axios = require('axios');
const { v4: uuid } = require('uuid');
const {
  appBank: appBankConfigHelper,
  bank: bankConfigHelper
} = require('./../../config/helper');

async function auth({ id, appName }) {

  const appBankConfig = appBankConfigHelper(appName, 'SCB');
  const bankConfig = bankConfigHelper('SCB');

  const { app_key, app_secret } = appBankConfig;
  const { api } = bankConfig;

  try {
    const res = await axios({
      method: 'post',
      baseURL: api.base_url,
      url: api.auth.url,
      headers: {
        'Content-Type': 'application/json',
        'resourceOwnerId': 'cashless',
        'requestUId': id,
        'accept-language': 'EN',
      },
      data: JSON.stringify({
        applicationKey: app_key,
        applicationSecret: app_secret,
      }),
    });
    const { data } = res.data;
    const { accessToken } = data;
    return { id, accessToken };

  } catch(err) {
    console.error(`scb auth: ${err}`);
    throw err;
  }
}

module.exports = {
  auth,
};

