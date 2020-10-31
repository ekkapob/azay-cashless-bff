const appConfig = require('./apps.json');
const bankConfig = require('./banks.json');

function isSupported(list, target) {
  return Object.keys(list).includes(target);
}

function appBank(app, bank) {
  if (!isSupported(appConfig, app)) {
    throw new Error(`app config: missing ${app}`);
  }
  const config = appConfig[app];
  if (!config.deeplink.banks[bank]) {
    throw new Error(`app config: missing bank deeplink ${bank}`);
  }

  return config.deeplink.banks[bank];
}

function bank(bank) {
  if (!isSupported(bankConfig, bank)) {
    throw new Error(`bank config: missing ${bank}`);
  }
  return bankConfig[bank];
}

module.exports = {
  appBank,
  bank,
}
