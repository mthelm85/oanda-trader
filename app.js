const chalk = require('chalk');
const currency = require('currency-formatter');
const d3 = require('d3-array');

const oanda = require('./oanda/oanda.js');
const rules = require('./config/rules.js');

require('./pivot/pivot-trader.js')(chalk, currency, oanda, rules);

setInterval(() => {
  require('./pivot/pivot-trader.js')(chalk, currency, oanda, rules);
}, 60000);




// oanda.accounts();

// require('./candles/candle-trader.js')(chalk, currency, d3, oanda, rules);

// oanda.accountBal();

// oanda.openShort(rules.currencyPair);

// oanda.accountSummary().then((data) => {
//   console.log(data.account.pl);
// }).catch((err) => {
//   console.log(err);
// });

// oanda.fullClose(rules.currencyPair);

// oanda.prevDay(rules.currencyPair).then((data) => {
//   console.log(data);
// });

// oanda.openPositions().then((data) => {
//   console.log(data[0]);
// });

// oanda.allTrades(rules.currencyPair).then((data) => {
//   console.log(data);
// });
