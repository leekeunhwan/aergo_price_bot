//---------------------
//  Module
//---------------------
let stringSimilarity = require("string-similarity");
let RtmClient = require("slack-client").RtmClient;
let WebClient = require("slack-client").WebClient;
require("dotenv").config();

//---------------------
//  main variable
//---------------------
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
  let detector = "점심";
  // let detecting = [
  //   '배고파',
  //   '배고픔',
  //   '뭐먹을까',
  //   '뭐먹지',
  //   '저녁',
  //   '점심',
  //   '런치',
  //   '식사',
  //   '역삼 맛집',
  //   '맛집 추천',
  //   '식사 추천',
  //   '저녁 추천'
  // ];

  // let matches = stringSimilarity.findBestMatch(text, detecting).bestMatch;

  if (text.indexOf(detector) > -1) {
    web.chat.postMessage(channel, "개발중", { username: "lunch_menu" });
  }
});
