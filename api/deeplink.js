const fs = require('fs');
const express = require('express');
const router = express.Router();
const { v4: uuid } = require('uuid');
const { deeplink: scbDeeplink } = require('./banks/scb/deeplink');
const joi = require('joi');

function validateDeeplink(req, res, next) {
  const schema = joi.object({
    banks: joi.array().required(),
    transactionSubType: joi.array().required(),
  });

  const { error } = schema.validate(
    req.body,
    { allowUnknown: true },
  );
  if (!!error) return res.sendStatus(400);

  next();
}

async function deeplink(req, res) {
  const id = uuid();
  // TODO: need to support for any touch points
  const appName = 'myaz';

  let deeplinkResponse = { id };
  const { banks, transactionSubType } = req.body;
  const { paymentAmount: billAmount } = req.body.billPayment;
  const { paymentAmount: creditAmount } = req.body.creditCardFullAmount;
  const {
    paymentAmount: installmentAmount,
    tenor,
  } = req.body.installmentPaymentPlan;

  try {
    let banksResponse = {};

    // TODO: do Promise.all() for all banks
    if (banks.indexOf('SCB') !== -1) {
      const response = await scbDeeplink({
        id,
        appName,
        paymentData: {
          transactionSubType,
          billAmount,
          creditAmount,
          installmentAmount,
          tenor,
        }
      });
      const { transactionId, deeplinkUrl } = response;
      const scbDeeplinkResponse = { transactionId, deeplinkUrl };

      banksResponse = {
        ...banksResponse,
        SCB: { transactionId, deeplinkUrl },
      };
    }

    deeplinkResponse = {
      ...deeplinkResponse,
      url: `/deeplinks/${id}`,
      banks: banksResponse,
    }

    updateDeeplinkDb({
      [id]: { banks: banksResponse },
    });

    res.send({ deeplinks: deeplinkResponse });
  } catch(err) {
    console.error(`api deeplink: ${err}`);
    res.sendStatus(500);
  }
}

function updateDeeplinkDb(newData) {
  const db = process.env.DEEPLINK_DATABASE;
  let data = {};
  try {
    const fileData = fs.readFileSync(db);
    data = { ...JSON.parse(fileData) };
  } catch(err) {}

  fs.writeFileSync(
    db,
    JSON.stringify({
      ...data,
      ...newData,
    }),
  );
}

module.exports = {
  deeplink: [validateDeeplink, deeplink],
};
