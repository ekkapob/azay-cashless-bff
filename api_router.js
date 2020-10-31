const express = require('express');
const router = express.Router();
const joi = require('joi');

const { deeplink } = require('./api/deeplink');

router.post('/deeplink', deeplink);

// TODO: need to recheck with SCB
// 1. GET or POST?
// 2. Both redirect back to app and Callback URL works only on production?
router.post('/scb/callback/payment_confirm', (req, res) => {
  res.send({
    "resCode": "00",
    "resDesc ": "success",
    "transactionId": "xxx",
    "confirmId" : "xxx"
  });
});

module.exports = router;
