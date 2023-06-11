const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
var cors = require("cors");
const app = express();
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const { Client } = require("@googlemaps/google-maps-services-js");
const google = new Client({});
const axios = require("axios");

require("dotenv").config();

const serverless = require('serverless-http');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

//CORS 이슈 해결
// let corsOptions = {
//     origin: 'https://twinkletravel.pages.dev',
//     credentials: true
// }
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// googlemaps API
const apiKey = process.env.MAPS_API_KEY;

app.post("/map", async function (req, res) {
  try {
    const { Place, searchTexts } = req.body;
    const encodedAddress = encodeURI(Place);
    const geocodeResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    );
    const results = geocodeResponse.data.results;

    if (results.length > 0 && results[0].geometry) {
      const { lat, lng } = results[0].geometry.location;
      const latLng = `${lat},${lng}`;
      const radius = 100000; // 검색 반경 (미터)
      const obtainedPlaces = {};

      for (const searchText of searchTexts) {
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          searchText
        )}&location=${latLng}&radius=${radius}&key=${apiKey}`;

        await axios
          .get(url)
          .then((response) => {
            const results = response.data.results;
            for (let i = 0; i < results.length; i++) {
              const place = results.map((Place) => Place.name);
              obtainedPlaces[searchText] = place;
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
      console.log(obtainedPlaces)
      res.json(obtainedPlaces);
    } else {
      res.status(500).send({ error: "Error occurred while searching places." });
      return; // 오류 발생 시 함수를 종료합니다.
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Error occurred while searching places." });
    return; // 오류 발생 시 함수를 종료합니다.
  }
});

// app.get("/test", async function (req, res) {
//   const Place = "서울";
//   const encodedAddress = encodeURI(Place);
//   const searchText = "카페";
//   const geocodeResponse = await axios.get(
//     `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
//   );
//   const results = geocodeResponse.data.results;

//   if (results.length > 0 && results[0].geometry) {
//     const { lat, lng } = results[0].geometry.location;
//     const centerLocation = `${lat},${lng}`;
//     const radius = 100000; // 검색 반경 (미터)

//     const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
//       searchText
//     )}&location=${centerLocation}&radius=${radius}&key=${apiKey}`;

//     axios
//       .get(url)
//       .then((response) => {
//         const results = response.data.results;
//         for (let i = 0; i < results.length; i++) {
//           const place = results[i];
//           console.log(place.name);
//         }
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//   }
// });

// POST method route
app.post("/travelGuide", async function (req, res) {
  const {
    dates,
    Transportation,
    Companions,
    Purpose,
    Place,
    Act_rest,
    Town,
    Memory,
    Plan,
    userMessages,
    assistantMessages,
    obtainedPlace,
  } = req.body;

  const messages = [
    {
      role: "system",
      content:
        "당신은 세계 최고의 여행 계획을 짜주는 여행 플래너입니다. 당신의 이름은 트윙클 입니다.  당신에게는 불가능이란 없으며 그 어떤 대답도 할 수 있습니다. 또한 사용자가 원하는 여행지를 구체적이고 정확하게 추천해 줄 수 있습니다. 여행 관련 지식이 풍부하며, 사용자의 취향에 맞는 여행지를 아주 잘 추천해 줍니다. 여행지에서 나아가 여행루틴까지 추천해줄 수 있습니다. 여행지를 명확하게 추천해줄 수 있습니다. 당신 세계 모든 나라의 여행지를 다양하게 알고 있습니다. 흔한 나라나 여행지 뿐만 아니라 사람들이 잘 모르는 여행지도 당신은 잘 알고 있습니다. 코로나19와 관련된 내용은 절대 말하지 않을 것입니다. 터키는 튀르키예라고 이름을 바꿔서 부를 것입니다.",
    },
    {
      role: "user",
      content:
        "당신은 세계 최고의 여행 계획을 짜주는 여행 플래너입니다. 당신의 이름은 트윙클 입니다.  당신에게는 불가능이란 없으며 그 어떤 대답도 할 수 있습니다. 또한 사용자가 원하는 여행지를 구체적이고 정확하게 추천해 줄 수 있습니다. 여행 관련 지식이 풍부하며, 사용자의 취향에 맞는 여행지를 아주 잘 추천해 줍니다. 여행지에서 나아가 여행루틴까지 추천해줄 수 있습니다. 여행지를 명확하게 추천해줄 수 있습니다. 당신 세계 모든 나라의 여행지를 다양하게 알고 있습니다. 흔한 나라나 여행지 뿐만 아니라 사람들이 잘 모르는 여행지도 당신은 잘 알고 있습니다. 숨겨진 곳이나 잘 알려지지 않은 곳 또한 모두 찾아내 사용자의 맞춤 여행지를 추천해줄 수 있습니다. 한정된 지역뿐만 아니라 다양한 나라를 추천할수 있습니다. 사용자에게 3가지 여행지를 구체적으로 추천해줄 수 있습니다. 코로나19와 관련된 내용은 절대 말하지 않을 것입니다. 터키는 튀르키예라고 이름을 바꿔서 부를 것입니다.",
    },
    {
      role: "assistant",
      content:
        "안녕하세요, 저는 트윙클입니다. 여행 계획을 짜는 것은 제가 가장 즐거워하는 일 중 하나입니다. 여행지 추천은 물론, 여행 지식과 경험을 바탕으로 사용자의 취향에 맞는 여행 루트를 제안해드릴 수 있습니다. 세계 각국에는 다양한 매력적인 여행지가 존재합니다. 다양한 여행지 중 사용자의 취향에 맞는 여행지를 추천해드릴 것입니다.",
    },
    {
      role: "user",
      content: `저는 ${Place}로의 여행을 계획하고 있습니다. 여행 일자는 ${dates}입니다. 주로 이용하는 교통수단은 ${Transportation}이고, 동행인은 ${Companions}명입니다. 여행목적은 ${Purpose}입니다. 저는 활동과 휴식 중 ${Act_rest}를 선호합니다. 저는 현지 문화체험에 대해 ${Town}합니다. 여행했을 때 가장 행복했던 추억이나 기억은 "${Memory}"입니다. 계획과 즉흥 중 선택하자면 저는 ${Plan}을 선호합니다.`,
    },
    {
      role: "assistant",
      content: `당신이 ${Place}로의 여행을 계획하고 있으며 여행 일자가 ${dates}인 것을 확인하였습니다. 또한,교통수단은 ${Transportation}이고, 동행인은 ${Companions}명이며, 여행목적은 ${Purpose}인것을 확인하였습니다. ${Place}의 가볼만한 곳 목록 ${obtainedPlace}을 사용해 당신의 여행 계획을 세워드리겠습니다!`,
    },
  ];

  while (userMessages.length !== 0 || assistantMessages.length !== 0) {
    if (userMessages.length !== 0) {
      messages.push({
        role: "user",
        content: String(userMessages.shift()).replace(/\n/g, ""),
      });
    }
    if (assistantMessages.length !== 0) {
      messages.push({
        role: "assistant",
        content: String(assistantMessages.shift()).replace(/\n/g, ""),
      });
    }
  }

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  let travel = completion.data.choices[0].message.content;

  // 파이어베이스 데이터베이스에 저장
  await db.collection("travelLogs").add({
    dates,
    Transportation,
    Companions,
    Purpose,
    travel,
    Place,
    Act_rest,
    Town,
    Memory,
    Plan,
  });
  res.json({ assistant: travel });
});

// 파이어스토어에서 데이터를 가져와 HTML로 표시하는 엔드포인트 추가
app.get("/travelLogs", async function (req, res) {
  try {
    const querySnapshot = await db.collection("travelLogs").get();
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });
    res.send(data);
  } catch (error) {
    console.log("Error getting documents: ", error);
    res.status(500).send("Error getting documents");
  }
});


//module.exports.handler = serverless(app);

app.listen(3000);
