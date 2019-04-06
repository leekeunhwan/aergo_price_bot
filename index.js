//---------------------
//  Slack-Client
//---------------------
let RtmClient = require("slack-client").RtmClient;
let WebClient = require("slack-client").WebClient;

//---------------------
//  Module
//---------------------
// 비동기 JavaScript 작업을위한 간단하고 강력한 기능을 제공하는 유틸리티 모듈이며,
// 여기서는 waterfall을 써보기 위해 사용해봄
let async = require("async");
// 비동기 방식으로 HTTP 데이터 요청을 실행할 수 있으며, 직접 XMLHttpRequest 다루지않아 편안해서 사용
let Axios = require("axios");
// http고 https고 다 읽을 수 있고, 왠만한건 res.body에 파싱되어 있음
let request = require("request");
// cheerio는 서버용으로 특별히 설계된 코어 jQuery를 빠르고 유연하며 유연하게 구현할 수 있게 해줌
let cheerio = require("cheerio");
// 일일히 물론 문장을 등록할 수 있지만 너무 비효율적이여서 계수비교로 유사도 기반으로 답장하기 위해 사용
let stringSimilarity = require("string-similarity");

//---------------------
//  dotenv.config
//---------------------
require("dotenv").config();

//---------------------
//  main variable
//---------------------
let token = process.env.API_TOKEN;
let web = new WebClient(token);
let rtm = new RtmClient(token, { logLevel: "error" });
rtm.start();

// 역삼역 맛집을 기준으로 함
let baseUrl = `http://section.blog.naver.com/Search/Post.nhn?pageNo={{page}}&rangeType=ALL&orderBy=sim&keyword=%EC%97%AD%EC%82%BC%EC%97%AD%20%EB%A7%9B%EC%A7%91`;
let search = (page, result, end) => {
  if (!page) page = 1;
  if (!result) result = [];

  let url = baseUrl.replace("{{page}}", page);

  // 데이터 수집 안되는 거 확인해보기 - body가 안넘어오는게 이상함..
  async.waterfall(
    [
      function(callback) {
        request.get(
          {
            url
          },
          (err, res, html) => {
            if (err) return callback(err);
            let $ = cheerio.load(html);
            callback(null, $);
          }
        );
      },
      ($, callback) => {
        $(".search_list li h5 a").each(function() {
          result.push({
            title: $(this)
              .text()
              .trim(),
            href: $(this).attr("href")
          });
        });
        callback(null);
      }
    ],
    () => {
      if (page >= 5) {
        shuffle = arr => {
          let currentIndex = arr.length,
            temporaryVal,
            randomIndex;
          while (0 != currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= -1;
            temporaryVal = arr[currentIndex];
            arr[currentIndex] = arr[randomIndex];
            arr[randomIndex] = temporaryVal;
          }
          return arr;
        };
        result = shuffle(result);

        let random_pick = [];
        let idx = 0;
        while (random_pick.length < 1) {
          if (result[idx].title.length > 0) {
            random_pick.push(result[idx]);
          }
          idx++;
        }
        end(random_pick);
      } else {
        search(end, page + 1, result);
      }
    }
  );
};

//---------------------
//  RTM EVENTS Process
//---------------------
let RTM_EVENTS = require("slack-client").RTM_EVENTS;
rtm.on(RTM_EVENTS.MESSAGE, msg => {
  let channel = msg.channel;
  let user = msg.user;
  let text = msg.text;

  let detecting = [
    "역삼역 맛집",
    "배고파",
    "배고픔",
    "뭐먹을까",
    "뭐먹지",
    "저녁",
    "점심",
    "맛집 추천",
    "식사"
  ];
  var matches = stringSimilarity.findBestMatch(text, detecting).bestMatch;
  if (matches.rating < 0.5) return;

  search(result => {
    let response = "<" + result[0].href + "|" + result[0].title + ">";
    web.chat.postMessage(channel, response, { username: "lunch_menu" });
  });
});
