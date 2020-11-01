const axios = require('axios');
const { auth } = require('./auth');
const { v4: uuid } = require('uuid');
const { bank: bankConfigHelper } = require('./../../config/helper');


async function transactions(id) {
  const appName = 'myaz';
  const bankConfig = bankConfigHelper('SCB');
  const { api } = bankConfig;

  try {
    // TODO: retrieve valid access_token from storage (redis, ...)
    const resAuth = await auth({ id, appName });
    const { accessToken } = resAuth;

    const resp = await axios({
      baseURL: api.base_url,
      url: `${api.transactions.url}/${id}`,
      headers: {
        'authorization': `Bearer ${accessToken}`,
        'resourceOwnerId': 'cashless',
        'accept-language': 'EN',
        'requestUId': uuid(),
      },
    })
    const { data } = resp.data;
    const {
      // 0 — for "PENDING"
      // 1 — for "PAID"
      // 2 — for "CANCELLED"
      // 3 — for "INVALID"
      // 4 — for "PARTIAL"
      // 5 — for "EXPIRED"
      // ref: https://developer.scb/#/documents/api-reference-index/payment/retrieving-transaction-detail.html
      statusCode,
      // "BP", "CCFA", "CCIPP"
      transactionMethod,
      // there are some updated info in creditCardFullAmount when paid with CC**
      creditCardFullAmount,
      // there are some updated info in billPayment (paid with BP)
      billPayment,
      accountFrom,
      paidAmount,
      fee,
      updatedTimestamp,
    } = data;

    return {
      paid: statusCode === 1,
      statusCode,
      transactionMethod,
      paidAmount,
      fee,
      accountFrom,
      updatedTimestamp,
    }
  } catch(err) {
    console.error(`scb transactions: (${err})`);
    throw err;
  }
}

module.exports = {
  transactions,
}
