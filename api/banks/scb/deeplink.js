const axios = require('axios');
const { auth } = require('./auth');
const {
  appBank: appBankConfigHelper,
  bank: bankConfigHelper,
} = require('../../../config/helper');

async function deeplink({ id, appName, paymentData}) {
  const appBankConfig = appBankConfigHelper(appName, 'SCB');
  const bankConfig = bankConfigHelper('SCB');

  const { api } = bankConfig;
  const { biller_id, merchant_id, terminal_id } = appBankConfig;

  const {
    transactionSubType,
    billAmount,
    creditAmount,
    installmentAmount,
    tenor,
  } = paymentData;

  try {
    const resAuth = await auth({ id, appName });
    const { accessToken } = resAuth;

    const resDeeplink = await axios({
      method: 'post',
      baseURL: api.base_url,
      url: api.deeplink.transaction_url,
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${accessToken}`,
        'resourceOwnerId': 'cashless',
        'requestUId': id,
        'channel': 'scbeasy',
        'accept-language': 'EN',
      },

      data: JSON.stringify({
        "transactionType":"PURCHASE",
        transactionSubType,
        "sessionValidityPeriod":900,
        "sessionValidUntil":"",
        "billPayment":{
          paymentAmount: billAmount,
          accountTo: biller_id,
          "ref1":"ABCDEFGHIJ1234567890",
          "ref2":"ABCDEFGHIJ1234567890",
          "ref3":"ABCDEFGHIJ1234567890"
        },
        "creditCardFullAmount":{
          merchantId: merchant_id,
          terminalId: terminal_id,
          paymentAmount: creditAmount,
          "orderReference": "12345678",
        },
        "installmentPaymentPlan":{
          merchantId: merchant_id,
          terminalId: terminal_id,
          "orderReference":"AA100001",
          paymentAmount: installmentAmount,
          tenor,
          "ippType":"3",
          "prodCode":"1001"
        },
        "merchantMetaData":{
          // "callbackUrl": process.env.SCB_PAYMENT_CONFIRM_CALLBACK_URL || '',
          "merchantInfo":{
            "name":"SANDBOX MERCHANT NAME"
          },
          "extraData":{},
          "paymentInfo":[
            {
              "type":"TEXT_WITH_IMAGE",
              "title":"",
              "header":"",
              "description":"",
              "imageUrl":""
            },
            {
              "type":"TEXT",
              "title":"",
              "header":"",
              "description":""
            }
          ]
        },
      })
    });

    const { data } = resDeeplink.data;
    const { transactionId, deeplinkUrl } = data;
    return { transactionId, deeplinkUrl };
  } catch(err) {
    console.error(`scb deeplink: ${err}`);
    throw err;
  }
}

module.exports = {
  deeplink,
}
