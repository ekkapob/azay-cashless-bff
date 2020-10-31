const axios = require('axios');
const { v4: uuid } = require('uuid');
const config = require('./config.json');

const { accountTo, merchantId, terminalId } = config.deeplink;
const deeplinkData = JSON.stringify({
   "transactionType":"PURCHASE",
   "transactionSubType":[
      "BP",
      "CCFA",
      "CCIPP"
   ],
   "sessionValidityPeriod":900,
   "sessionValidUntil":"",
   "billPayment":{
      "paymentAmount":100,
      accountTo,
      "ref1":"ABCDEFGHIJ1234567890",
      "ref2":"ABCDEFGHIJ1234567890",
      "ref3":"ABCDEFGHIJ1234567890"
   },
   "creditCardFullAmount":{
      merchantId,
      terminalId,
      "orderReference":"12345678",
      "paymentAmount":100
   },
   "installmentPaymentPlan":{
      merchantId,
      terminalId,
      "orderReference":"AA100001",
      "paymentAmount":10000,
      "tenor":"12",
      "ippType":"3",
      "prodCode":"1001"
   },
   "merchantMetaData":{
      "callbackurl":"",
      "merchantInfo":{
         "name":"SANDBOX MERCHANT NAME"
      },
      "extraData":{
      },
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
   }
});

async function deeplink({ accessToken, requestUId = uuid() }) {
  if (!accessToken) throw new Error('access token is needed');

  const { url } = config.deeplink;
  try {
    const res = await axios({
      method: 'post',
        baseURL: config.base_url,
        url,
        headers: { 
          'Content-Type': 'application/json', 
          'authorization': `Bearer ${accessToken}`, 
          'resourceOwnerId': 'cashless', 
          requestUId,
          'channel': 'scbeasy', 
          'accept-language': 'EN', 
        },
      data: deeplinkData,
    });

    const { data } = res.data;
    const { transactionId, deeplinkUrl } = data;
    return { transactionId, deeplinkUrl };
  } catch(err) {
    throw err;
  }
}

async function handler(req, res) {
  const { accessToken } = req.session.auth;
  if (!accessToken) return res.sendStatus(401);

  try {
    const { requestUId } = req.session;
    const response = await deeplink({ accessToken, requestUId });
    const { transactionId, deeplinkUrl } = response;
    return res.send({ transactionId, deeplinkUrl });
  } catch (err) {
    res.sendStatus(500);
  }
}

function pageHandler(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.send(`<h1>213</h1>`)
}

module.exports = {
  handler,
  pageHandler,
}
