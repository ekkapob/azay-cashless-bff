require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const cors = require('cors');

const apiRouter = require('./api_router');
const webRouter = require('./web_router');

app.use(cors());
app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));
app.use(express.json());
app.use(express.static('public'));

app.use('/api', apiRouter);
app.use('/', webRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server listening on ${port}`);
});
