module.exports = (chalk, currency, oanda, rules) => {

  const trade = async () => {
    const openPositions = await oanda.openPositions();
    const getPrice = await oanda.getPrice(rules.currencyPair);
    const prevDay = await oanda.prevDay(rules.currencyPair);
    const accountBal = await oanda.accountBal();
    const accountSummary = await oanda.accountSummary();
    const allTrades = await oanda.allTrades(rules.currencyPair);

    if (openPositions.length > 0) {
      var lastPrice = getPrice.lastBid;
      var pivot = (Number(prevDay.bidHigh) + Number(prevDay.bidLow) + Number(prevDay.bidClose)) / 3;
      var r1 = (2 * pivot) - (Number(prevDay.bidLow));
      var s1 = (2 * pivot) - (Number(prevDay.bidHigh));
      var r2 = pivot + (Number(prevDay.bidHigh) - Number(prevDay.bidLow));
      var s2 = pivot - (Number(prevDay.bidHigh) - Number(prevDay.bidLow));
      console.log(`Last Bid: $${getPrice.lastBid}` + chalk.green(` Recorded At: ${getPrice.recordedAt}`));

      //close out positions that are older than 12 hours when price hasn't crossed pivot point
      // let checkTime = Date.parse(allTrades.trades[0].openTime) + 86400000;
      // let currentTime = Date.now();
      // if (currentTime > checkTime && openPositions[0].long.units != 0 && lastPrice < pivot) {
      //   oanda.longClose(rules.currencyPair);
      // }
      // if (currentTime > checkTime && openPositions[0].short.units != 0 && lastPrice > pivot) {
      //   oanda.shortClose(rules.currencyPair);
      // }

    } else {
      var lastPrice = getPrice.lastAsk;
      var pivot = (Number(prevDay.askHigh) + Number(prevDay.askLow) + Number(prevDay.askClose)) / 3;
      var r1 = (2 * pivot) - (Number(prevDay.askLow));
      var s1 = (2 * pivot) - (Number(prevDay.askHigh));
      var r2 = pivot + (Number(prevDay.askHigh) - Number(prevDay.askLow));
      var s2 = pivot - (Number(prevDay.askHigh) - Number(prevDay.askLow));
      console.log(`Last Ask: $${getPrice.lastAsk}` + chalk.green(` Recorded At: ${getPrice.recordedAt}`));
    }

    console.log('');
    console.log(chalk.gray(`R2: $${r2.toFixed(5)}`));
    console.log(chalk.gray(`R1: $${r1.toFixed(5)}`));
    console.log(chalk.cyan(`Pivot: $${pivot.toFixed(5)}`));
    console.log(chalk.yellow(`S1: $${s1.toFixed(5)}`));
    console.log(chalk.yellow(`S2: $${s2.toFixed(5)}`));
    console.log('');

    if (lastPrice > pivot) {
      console.log('The market may be trending upwards...');
    }

    if (lastPrice < pivot) {
      console.log('The market may be trending downwards...');
    }

    if (lastPrice === pivot) {
      console.log('The market is at the pivot point...');
    }

    if (lastPrice >= r2) {
      console.log('');
      console.log(chalk.bgGreen('SELL!'));
      if (openPositions.length > 0) {
        if (openPositions[0].long.units != '0' && openPositions[0].short.units === '0') {
          oanda.longClose(rules.currencyPair)
            .then(() => {
              oanda.openShort(rules.currencyPair);
            })
            .catch((err) => {
              console.log(err);
            });
        }
        if (openPositions[0].long.units === '0' && openPositions[0].short.units != '0') {
          console.log('');
          console.log('You already have an open short position...');
        }
        if (openPositions[0].long.units != '0' & openPositions[0].short.units != '0') {
          oanda.longClose(rules.currencyPair);
        }
      } else {
        oanda.openShort(rules.currencyPair);
      }
    }

    if (lastPrice <= s2) {
      console.log('');
      console.log(chalk.bgGreen('BUY!'));
      if (openPositions.length > 0) {
        if (openPositions[0].short.units != '0' && openPositions[0].long.units === '0') {
          oanda.shortClose(rules.currencyPair)
            .then(() => {
              oanda.openLong(rules.currencyPair);
            })
            .catch((err) => {
              console.log(err);
            });
        }
        if (openPositions[0].short.units === '0' && openPositions[0].long.units != '0') {
          console.log('');
          console.log('You already have an open long position...');
        }
        if (openPositions[0].short.units != '0' & openPositions[0].long.units != '0') {
          oanda.shortClose(rules.currencyPair);
        }
      } else {
        oanda.openLong(rules.currencyPair);
      }
    }

    if (lastPrice <= r2 && lastPrice >= s2) {
      console.log('');
      console.log(chalk.bgRed('HOLD!'));
    }

    if (openPositions.length > 0) {
      console.log('');
      console.log(chalk.rgb(244, 66, 188)(`Unrealized Profit/Loss: ${openPositions[0].unrealizedPL}`));
      console.log('');
      if (openPositions[0].long.units != '0') {
        console.log(chalk.rgb(66, 134, 244)(`Current Position: ${openPositions[0].long.units} long units`));
      }
      if (openPositions[0].short.units != '0') {
        console.log(chalk.rgb(66, 134, 244)(`Current Position: ${openPositions[0].short.units} short units`));
      }
    }

    console.log('');
    console.log(chalk.rgb(86, 244, 66)('Account Balance: ', currency.format(accountBal.balance, {
      code: 'USD'
    })));
    console.log('');
    console.log(chalk.rgb(86, 244, 66)(`Profit/Loss Since Inception: $${accountSummary.account.pl}`))
    console.log('');
    console.log('-------------------------------');
    console.log('');

    if (openPositions.length > 0) {
      if ((openPositions[0].long.unrealizedPL / openPositions[0].long.units) <= -0.0025) {
        oanda.longClose(rules.currencyPair);
        console.log(chalk.red('STOP LOSS EXECUTED ON LONG POSITION...'));
      }
      if ((openPositions[0].short.unrealizedPL / openPositions[0].short.units) >= 0.0025) {
        oanda.shortClose(rules.currencyPair);
        console.log(chalk.red('STOP LOSS EXECUTED ON SHORT POSITION...'));
      }
      if ((openPositions[0].long.unrealizedPL / openPositions[0].long.units) >= 0.0075) {
        oanda.longClose(rules.currencyPair);
        console.log(chalk.red('TAKE PROFIT EXECUTED ON LONG POSITION...'));
      }
      if ((openPositions[0].short.unrealizedPL / openPositions[0].short.units) <= -0.0075) {
        oanda.shortClose(rules.currencyPair);
        console.log(chalk.red('TAKE PROFIT EXECUTED ON SHORT POSITION...'));
      }
    }

  };

  trade();

};
