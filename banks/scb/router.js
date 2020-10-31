const express = require('express');
const { handler: authHandler } = require('./auth');
const {
  handler: deeplinkHandler,
  pageHandler: deeplinkPageHandler,
} = require('./deeplink');
const router = express.Router();

router.get('/deeplink', authHandler, deeplinkHandler);
router.get('/deeplink/page', authHandler, deeplinkPageHandler);

module.exports = router;
