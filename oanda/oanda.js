const axios = require('axios');
const moment = require('moment');

const oandaAcct = require('../config/oandaAcct.js');

var accounts = () => {
  axios({
      method: 'get',
      url: 'https://api-fxtrade.oanda.com/v3/accounts',
      headers: {
        'Authorization': `Bearer ${oandaAcct.key}`
      }
    })
    .then((res) => {
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err);
    });
};

var accountBal = () => {
  return new Promise((resolve, reject) => {
    axios({
        method: 'get',
        url: `https://api-fxtrade.oanda.com/v3/accounts/${oandaAcct.acntId}/summary`,
        headers: {
          'Authorization': `Bearer ${oandaAcct.key}`
        }
      })
      .then((res) => {
        var data = {
          balance: res.data.account.balance
        };
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

var getPrice = (pair) => {
  return new Promise((resolve, reject) => {
    axios({
        method: 'get',
        url: `https://api-fxtrade.oanda.com/v3/accounts/${oandaAcct.acntId}/pricing?instruments=${pair}`,
        headers: {
          'Authorization': `Bearer ${oandaAcct.key}`
        }
      })
      .then((res) => {
        var recordedAt = new Date();
        var data = {
          lastBid: res.data.prices[0].bids[0].price,
          lastAsk: res.data.prices[0].asks[0].price,
          recordedAt: recordedAt
        };
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

var prevDay = (pair) => {
  return new Promise((resolve, reject) => {
    var address;

    if (moment().weekday() === 0 || moment().weekday() === 1) {
      address = `https://api-fxtrade.oanda.com/v3/instruments/${pair}/candles?count=1&price=BA&from=${moment().add(-6, 'days').unix()}&granularity=W`
    } else {
      address = `https://api-fxtrade.oanda.com/v3/instruments/${pair}/candles?count=1&price=BA&from=${moment().add(-1, 'days').unix()}&granularity=D`
    }

    axios({
        method: 'get',
        url: address,
        headers: {
          'Authorization': `Bearer ${oandaAcct.key}`
        }
      })
      .then((res) => {
        // console.log(res.data.candles);
        var data = {
          date: res.data.candles[0].time,
          askHigh: res.data.candles[0].ask.h,
          askLow: res.data.candles[0].ask.l,
          askClose: res.data.candles[0].ask.c,
          bidHigh: res.data.candles[0].bid.h,
          bidLow: res.data.candles[0].bid.l,
          bidClose: res.data.candles[0].bid.c
        }
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

var getCandles = (pair) => {
  return new Promise((resolve, reject) => {
    let address = `https://api-fxtrade.oanda.com/v3/instruments/${pair}/candles?count=120&price=M&from=${moment().add(-542, 'hours').unix()}&granularity=H4`

    axios({
        method: 'get',
        url: address,
        headers: {
          'Authorization': `Bearer ${oandaAcct.key}`
        }
      })
      .then((res) => {
        let data = res.data.candles;
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

var openPositions = () => {
  return new Promise((resolve, reject) => {
    axios({
        method: 'get',
        url: `https://api-fxtrade.oanda.com/v3/accounts/${oandaAcct.acntId}/openPositions`,
        headers: {
          'Authorization': `Bearer ${oandaAcct.key}`
        }
      })
      .then((res) => {
        var data = res.data.positions;
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

var openLong = (pair) => {
  var bal;
  accountBal().then((data) => {
    bal = data.balance * 0.99;
  }).catch((err) => {
    console.log(err);
  }).then(() => {
    axios({
        method: 'post',
        url: `https://api-fxtrade.oanda.com/v3/accounts/${oandaAcct.acntId}/orders`,
        headers: {
          'Authorization': `Bearer ${oandaAcct.key}`
        },
        data: {
          'order': {
            'units': Math.round(bal),
            'instrument': pair,
            'timeInForce': 'IOC',
            'type': 'MARKET',
            'positionFill': 'DEFAULT'
          }
        }
      })
      .then((res) => {
        if (res) {
          console.log('Position opened...')
        } else {
          console.log(res);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }).catch((err) => {
    console.log(err);
  });
};

var openShort = (pair) => {
  var bal;
  accountBal().then((data) => {
    bal = data.balance * 0.69;
  }).catch((err) => {
    console.log(err);
  }).then(() => {
    axios({
        method: 'post',
        url: `https://api-fxtrade.oanda.com/v3/accounts/${oandaAcct.acntId}/orders`,
        headers: {
          'Authorization': `Bearer ${oandaAcct.key}`
        },
        data: {
          'order': {
            'units': -Math.round(bal),
            'instrument': pair,
            'timeInForce': 'IOC',
            'type': 'MARKET',
            'positionFill': 'DEFAULT'
          }
        }
      })
      .then((res) => {
        if (res) {
          console.log('Position opened...')
        } else {
          console.log(res);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }).catch((err) => {
    console.log(err);
  });
};

var longClose = (pair) => {
  axios({
      method: 'put',
      url: `https://api-fxtrade.oanda.com/v3/accounts/${oandaAcct.acntId}/positions/${pair}/close`,
      headers: {
        'Authorization': `Bearer ${oandaAcct.key}`
      },
      data: {
        'longUnits': 'ALL'
      }
    })
    .then((res) => {
      console.log('Long position closed...');
    })
    .catch((err) => {
      console.log(err);
    });
};

var shortClose = (pair) => {
  axios({
      method: 'put',
      url: `https://api-fxtrade.oanda.com/v3/accounts/${oandaAcct.acntId}/positions/${pair}/close`,
      headers: {
        'Authorization': `Bearer ${oandaAcct.key}`
      },
      data: {
        'shortUnits': 'ALL'
      }
    })
    .then((res) => {
      console.log('Short position closed...');
    })
    .catch((err) => {
      console.log(err);
    });
};

var closeAll = (pair) => {
  axios({
      method: 'put',
      url: `https://api-fxtrade.oanda.com/v3/accounts/${oandaAcct.acntId}/positions/${pair}/close`,
      headers: {
        'Authorization': `Bearer ${oandaAcct.key}`
      },
      data: {
        'shortUnits': 'ALL',
        'longUnits': 'ALL'
      }
    })
    .then((res) => {
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err);
    });
};

var allTrades = (pair) => {
  return new Promise((resolve, reject) => {
    axios({
        method: 'get',
        url: `https://api-fxtrade.oanda.com/v3/accounts/${oandaAcct.acntId}/trades?instrument=${pair}`,
        headers: {
          'Authorization': `Bearer ${oandaAcct.key}`
        }
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

var accountSummary = () => {
  return new Promise((resolve, reject) => {
    axios({
        method: 'get',
        url: `https://api-fxtrade.oanda.com/v3/accounts/${oandaAcct.acntId}/summary`,
        headers: {
          'Authorization': `Bearer ${oandaAcct.key}`
        }
      })
      .then((res) => {
        var data = res.data;
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

module.exports = {
  accounts,
  accountBal,
  accountSummary,
  allTrades,
  closeAll,
  longClose,
  getCandles,
  getPrice,
  openLong,
  openShort,
  openPositions,
  prevDay,
  shortClose
};
