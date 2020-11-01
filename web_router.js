const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const { transactions } = require('./banks/scb/transactions');

function html({ id, data }) {
  let { banks } = data;
  banks = Object.keys(banks);

  let bankLinks = '';
  banks.forEach(bank => {
    bankLinks +=
    `<div style="display: block">
      <a href="${data.banks[bank].deeplinkUrl}">
        <img src="/images/scb_easy_app_icon.png" alt="SCB Easy" />
      </a>
      </div>
      <a href="/scb/payments/${id}" target="_blank"
        style="color:#004A94">
        <small class="status">status</small>
      </a>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
      <title>Cashless API</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          background-color: #004A94;
          color: white;
        }
        .container {
          text-align: center;
          margin-top: 5em;
          min-width: 70%;
        }
        .link-container {
          padding: 1em;
          width: 80%;
          background-color: white;
          border-radius: 6px;
          box-shadow: 0px 2px 10px 0px #064079;
        }
        a {
          text-decoration: none;
          font-weight: 700;
          color: white;
        }
        .status {
          background-color: #e2e2e2;
          padding: 2px 8px;
          border-radius: 12px;
          color: #5f5f5f;
        }
        img {
          width: 90px;
          height: 90px;
          margin: 0.5em;
        }
      </style>
      </head>
      <body>
        <a href="/">HOME</a>
        <div class="container">
          <div style="display: flex;justify-content: center;">
            <div class="link-container">
              <h2 style="color: #004A94">Pay by Bank Apps</h2>
              <div>${bankLinks}</div>
            </div>
          </div>
          <div style="margin-top: 1em;font-size: 0.7em;">
            Service Provided by Cashless API
          </div>
          <div style="margin-top: 1em;font-size: 0.7em;">
            deeplink_id: ${id}
          </div>
        </div>
      </body>
    </html>
  `;
}

router.get('/deeplinks/:id', (req, res) => {
  const { id } = req.params;
  const data = deeplinks()[id];
  if (!data) return res.sendStatus(404);

  res.set('Content-Type', 'text/html');
  res.send(html({ id, data }));
});

router.get('/deeplinks', (req, res) => {
  const ids = Object.keys(deeplinks());
  if (!ids.length === 0) return res.sendStatus(404);

  const recentId = ids[ids.length - 1];
  const data = deeplinks()[recentId];

  res.set('Content-Type', 'text/html');
  res.send(html({ id: recentId, data }));
});

router.get('/scb/payments', async (req, res) => {
  const { id } = req.params;
  const ids = Object.keys(deeplinks());
  if (!ids.length === 0) return res.sendStatus(404);

  try {
    const recentId = ids[ids.length - 1];
    const data = deeplinks()[recentId];
    if (!data) return res.sendStatus(404)

    // TODO: refactor this duplicate logic with /scb/payments/:id
    const { banks } = data;
    const txnId = banks.SCB.transactionId;
    const resTxn = await transactions(txnId);
    let htmlData  = fs.readFileSync('./public/thankyou.html', 'utf8');

    res.set('Content-Type', 'text/html');
    let list = `<li>deeplink id: ${recentId}`;
    Object.keys(resTxn).forEach(key => {
      list += `<li>${key}: ${resTxn[key]}</li>`;
    });
    const html = htmlData.toString().replace(/{{STAUS_LIST}}/g, list);
    return res.send(html);
  } catch(err) {
    console.error(`scb payment callback: ${err}`);
    res.sendStatus(400);
  }
});

router.get('/scb/payments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = deeplinks()[id];
    if (!data) return res.sendStatus(404)

    const { banks } = data;
    const txnId = banks.SCB.transactionId;
    const resTxn = await transactions(txnId);
    let htmlData  = fs.readFileSync('./public/thankyou.html', 'utf8');

    res.set('Content-Type', 'text/html');
    let list = `<li>deeplink id: ${id}`;
    Object.keys(resTxn).forEach(key => {
      list += `<li>${key}: ${resTxn[key]}</li>`;
    });
    const html = htmlData.toString().replace(/{{STAUS_LIST}}/g, list);
    return res.send(html);
  } catch(err) {
    console.error(`scb payment callback: ${err}`);
    res.sendStatus(400);
  }
})

router.get('/', (req, res) => {
  res.sendFile(`${path.join(__dirname)}/public/form.html`);
})

function deeplinks() {
  try {
    const data = fs.readFileSync(process.env.DEEPLINK_DATABASE);
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

module.exports = router;
