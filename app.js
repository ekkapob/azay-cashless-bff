const express = require('express');
const app = express();
const session = require('express-session');

const scbRouter = require('./banks/scb/router');
const port = 3000;

app.set('trust proxy', 1);
app.use(session({
  secret: 'this is a secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/scb', scbRouter);

app.listen(port, () => {
  console.log(`server listening on ${port}`);
});
