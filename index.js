//---------------------
//  Slack-Client
//---------------------
let RtmClient = require("slack-client").RtmClient;
let WebClient = require("slack-client").WebClient;

//---------------------
//  Module
//---------------------
// 비동기 방식으로 HTTP 데이터 요청을 실행할 수 있으며, 직접 XMLHttpRequest 다루지 않아 편안해서 사용
let Axios = require("axios");
let formatDate = require("./module/date");

//---------------------
//  dotenv.config
//---------------------
require("dotenv").config();

//---------------------
//  main variable
//---------------------
let bitCoinArr = [];
let token = process.env.API_TOKEN;
let web = new WebClient(token);
let rtm = new RtmClient(token, { logLevel: "error" });
rtm.start();

//---------------------
//  RTM EVENTS Process
//---------------------
let RTM_EVENTS = require("slack-client").RTM_EVENTS;
rtm.on(RTM_EVENTS.MESSAGE, msg => {
  let channel = msg.channel;
  let user = msg.user;
  let text = msg.text;

  //-------------------------
  //  Get API Data - BitCoin
  //-------------------------

  const bitcoinUrl = process.env.BITCOIN_URL;
  Axios.get(bitcoinUrl).then(response => {
    const result = response.data.data;
    const coinKRWPrice = result.price_krw;
    bitCoinArr.push(coinKRWPrice);
  });

  //-----------------------
  //  Get API Data - Aergo
  //-----------------------

  const aergoUrl = process.env.AERGO_URL;
  Axios.get(aergoUrl).then(response => {
    const result = response.data.data;

    //---------------------
    //  BitCoin KRW
    //---------------------
    const bitCoinKRW = bitCoinArr[0];

    //---------------------
    //  Aergo Name
    //---------------------
    const coinKoreanName = result.name_kr;
    const coinEnglishName = result.name;

    //---------------------
    //  Aergo Price
    //---------------------
    const coinBTCPrice = result.price_btc;
    const coinKRWPrice = result.price_krw;
    const coinLowPrice = result.min_price;
    const coinHighPrice = result.max_price;

    //---------------------
    //  Aergo Exchange
    //---------------------
    const coinExchage = result.exchange;
    const coinKRWExchange = coinExchage.filter(item => item.market === "KRW");
    const coinBTCExchange = coinExchage.filter(item => item.market === "BTC");

    //---------------------
    //  Aergo KRW - Korbit
    //---------------------
    const coinKorbitKRWExchange = coinKRWExchange[0].list.filter(
      item => item.key === "korbit"
    );
    const korbitAergo = coinKorbitKRWExchange[0];
    const korbitAergoExchangeName = korbitAergo.name;
    const korbitAergoLastPrice = korbitAergo.last_price;
    const korbitAergoChangePercent = korbitAergo.change_percent;

    //---------------------
    //  Aergo KRW - Gopax
    //---------------------

    const coinGopaxKRWExchange = coinKRWExchange[0].list.filter(
      item => item.key === "gopax"
    );
    const gopaxAergo = coinGopaxKRWExchange[0];
    const gopaxAergoExchangeName = gopaxAergo.name;
    const gopaxAergoLastPrice = gopaxAergo.last_price;
    const gopaxAergoChangePercent = gopaxAergo.change_percent;

    //---------------------
    //  Aergo BTC - Upbit
    //---------------------
    const coinUpbitBTCExchange = coinBTCExchange[0].list.filter(
      item => item.key === "upbit"
    );
    const upbitAergo = coinUpbitBTCExchange[0];
    const upbitAergoExchangeName = upbitAergo.name;
    const upbitAergoLastPrice = upbitAergo.last_price;
    const upbitAergoLastPriceKRW =
      Number(upbitAergoLastPrice) * Number(bitCoinKRW);
    const upbitAergoLastPriceKRWFloat = upbitAergoLastPriceKRW.toFixed(4);
    const upbitAergoChangePercent = upbitAergo.change_percent;

    //---------------------
    //  Anwser Case
    //---------------------
    let answer;
    switch (text) {
      case "아르고 가격":
        answer = `아르고의 최근 가격 : ( ${formatDate(
          new Date()
        )} 기준 )\n코빗 : ${
          isNaN(korbitAergoLastPrice) || korbitAergoLastPrice == null
            ? `API를 못받았습니다. 잠시후에 시도해주세요`
            : `${korbitAergoLastPrice}원`
        }\n고팍스 : ${
          isNaN(gopaxAergoLastPrice) || gopaxAergoLastPrice == null
            ? `API를 못받았습니다. 잠시후에 시도해주세요`
            : `${gopaxAergoLastPrice}원`
        }\n업비트 : ${
          isNaN(upbitAergoLastPriceKRWFloat) ||
          upbitAergoLastPriceKRWFloat == null
            ? `API를 못받았습니다. 잠시후에 시도해주세요`
            : `${upbitAergoLastPriceKRWFloat}원`
        }`;
        break;
      case "아르고 등락폭":
        answer = `금일 최고가는 ${Number(coinHighPrice).toFixed(
          4
        )}원,\n최저가는 ${Number(coinLowPrice).toFixed(4)}원으로\n변동폭은 ${(
          Number(coinHighPrice) - Number(coinLowPrice)
        ).toFixed(4)}원입니다.`;
        break;
    }

    if (text) {
      web.chat.postMessage(channel, answer, {
        username: "aergo_price_bot"
      });
    }
  });
});
