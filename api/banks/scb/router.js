const express = require('express');
const { handler: authHandler } = require('./auth');
const {
  createTransactionHandler,
  transactionHandler,
} = require('./deeplink');
const router = express.Router();

router.post('/deeplink/transactions', authHandler, createTransactionHandler);
router.get('/deeplink/transactions/:id', transactionHandler);

module.exports = router;
