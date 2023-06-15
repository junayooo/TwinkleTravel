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

const serverless = require("serverless-http");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// https://mbtrip.du.r.appspot.com
// CORS 이슈 해결
// let corsOptions = {
//     origin: 'https://a77893bb.twinkle.pages.dev/',
//     credentials: true
// }
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
const obtainedPlaces = {};
// googlemaps API
const apiKey = process.env.MAPS_API_KEY;

app.post("/map", async function (req, res) {
  try {
    const { Place, Types, Money } = req.body;
    const encodedAddress = encodeURI(Place);
    const geocodeResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    );
    const results = geocodeResponse.data.results;

    if (results.length > 0 && results[0].geometry) {
      const { lat, lng } = results[0].geometry.location;
      const latLng = `${lat},${lng}`;
      const radius = 1000000; // 검색 반경 (미터)

      for (const type of Types) {
        const placesResponse = await google.placesNearby({
          params: {
            location: latLng,
            radius: radius,
            type: type,
            // rankBy: "PROMINENCE",
            maxPriceLevel: Money,
            language: "ko",
            // keyword
            key: apiKey,
          },
        });

        const places = placesResponse.data.results.map((Place) => Place.name);
        obtainedPlaces[type] = places;
      }

      console.log(Money);
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

// POST method route
app.post("/travelGuide", async function (req, res) {
  const {
    Dates,
    Purpose,
    Place,
    Act_rest,
    Money,
    Memory,
    Plan,
    // ObtainedPlaces,
    userMessages,
    assistantMessages,
  } = req.body;
  const ObtainedPlaces = JSON.stringify(obtainedPlaces);
  const messages = [
    {
      role: "system",
      content:
        "당신은 세계 최고의 여행 계획을 짜주는 여행 플래너입니다. 당신의 이름은 트윙클 입니다. 이용자에게 입력받은 여러가지 여행에 관련된 취향 정보를 고려해 주어진 장소를 이용한 여행계획을 세워주는 것이 당신의 일입니다.",
    },
    {
      role: "user",
      content:
        "당신은 세계 최고의 여행 계획을 짜주는 여행 플래너입니다. 당신의 이름은 트윙클 입니다. 이용자에게 입력받은 여러가지 여행에 관련된 취향 정보를 고려해 주어진 장소를 이용한 여행계획을 세워주는 것이 당신의 일입니다.",
    },
    {
      role: "assistant",
      content:
        "안녕하세요! 저는 여행 플래너인 트윙클입니다. 여행 계획을 세우는 것에 관심이 있으신 것 같아 기쁘네요. 어떤 도움을 드릴까요? 먼저 여행하고자 하는 여행지에 대한 정보를 알려주세요. 어떤 나라나 도시로 가고 싶으신가요? 그리고 여행의 기간도 함께 알려주세요. 그러면 그에 맞는 계획을 세울 수 있을 것입니다. 또한, 여행에 관련된 취향 정보를 알려주시면 보다 개인화된 여행 계획을 제공해드릴 수 있습니다. ",
    },
    {
      role: "user",
      content: `${Place}여행계획을 세워주세요.  여행 일자는 ${Dates}입니다. 여행하면서 ${Purpose}을 가장 중요하게 생각합니다. 저는 활동과 휴식 중 ${Act_rest}를 선호합니다. 여행했을 때 가장 행복했던 추억이나 기억은 "${Memory}"입니다. 계획과 즉흥 중 선택하자면 저는 ${Plan}을 선호합니다. 방문할 장소는 모두 아래의 장소 목록에서 선정해야 합니다.  ${ObtainedPlaces}`,
    },
    // {
    //   role: "assistant",
    //   content: ` ${Place}에서의 여행계획을 세워드리겠습니다.`,
    // },
  ];
  console.log(obtainedPlaces);
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
    Dates,
    Purpose,
    travel,
    Place,
    Act_rest,
    Money,
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


app.get("/test", function (req, res) {
   console.log("test");
});

app.listen(3000);


//module.exports.handler = serverless(app);
