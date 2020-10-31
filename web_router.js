const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

function html({ id, data }) {
  let { banks } = data;
  banks = Object.keys(banks);

  let bankLinks = '';
  banks.forEach(bank => {
    bankLinks += `<a href="${data.banks[bank].deeplinkUrl}">
      <img src="/images/scb_easy_app_icon.png" alt="SCB Easy" />
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
  const { id } = req.params;
  const ids = Object.keys(deeplinks());
  if (!ids.length === 0) return res.sendStatus(404);

  const recentId = ids[ids.length - 1];
  const data = deeplinks()[recentId];

  res.set('Content-Type', 'text/html');
  res.send(html({ id: recentId, data }));
});

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
