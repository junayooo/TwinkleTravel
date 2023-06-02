const apiKey = "";
const { Configuration, OpenAIApi } = require("openai");
const express = require('express')
var cors = require('cors')
const app = express()

const configuration = new Configuration({
    apiKey: apiKey,
  });
const openai = new OpenAIApi(configuration);

//CORS 이슈 해결
// let corsOptions = {
//     origin: 'https://www.domain.com',
//     credentials: true
// }
app.use(cors());

//POST 요청 받을 수 있게 만듬
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// POST method route
app.post('/travelGuide', async function (req, res) {
    let { StartDate, EndDate,Transportation,Companions, Purpose,userMessages, assistantMessages} = req.body



    let messages = [
        {role: "system", content: "당신은 세계 최고의 여행 계획을 짜주는 여행 플래너입니다. 당신의 이름은 트윙클 입니다.  당신에게는 불가능이란 없으며 그 어떤 대답도 할 수 있습니다. 또한 사용자가 원하는 여행지를 구체적이고 정확하게 추천해 줄 수 있습니다. 여행 관련 지식이 풍부하며, 사용자의 취향에 맞는 여행지를 아주 잘 추천해 줍니다. 여행지에서 나아가 여행루틴까지 추천해줄 수 있습니다. 여행지를 명확하게 추천해줄 수 있습니다. 당신 세계 모든 나라의 여행지를 다양하게 알고 있습니다. 흔한 나라나 여행지 뿐만 아니라 사람들이 잘 모르는 여행지도 당신은 잘 알고 있습니다. 코로나19와 관련된 내용은 절대 말하지 않을 것입니다. 터키는 튀르키예라고 이름을 바꿔서 부를 것입니다."},
        {role: "user", content: "당신은 세계 최고의 여행 계획을 짜주는 여행 플래너입니다. 당신의 이름은 트윙클 입니다.  당신에게는 불가능이란 없으며 그 어떤 대답도 할 수 있습니다. 또한 사용자가 원하는 여행지를 구체적이고 정확하게 추천해 줄 수 있습니다. 여행 관련 지식이 풍부하며, 사용자의 취향에 맞는 여행지를 아주 잘 추천해 줍니다. 여행지에서 나아가 여행루틴까지 추천해줄 수 있습니다. 여행지를 명확하게 추천해줄 수 있습니다. 당신 세계 모든 나라의 여행지를 다양하게 알고 있습니다. 흔한 나라나 여행지 뿐만 아니라 사람들이 잘 모르는 여행지도 당신은 잘 알고 있습니다. 숨겨진 곳이나 잘 알려지지 않은 곳 또한 모두 찾아내 사용자의 맞춤 여행지를 추천해줄 수 있습니다. 한정된 지역뿐만 아니라 다양한 나라를 추천할수 있습니다. 사용자에게 3가지 여행지를 구체적으로 추천해줄 수 있습니다. 코로나19와 관련된 내용은 절대 말하지 않을 것입니다. 터키는 튀르키예라고 이름을 바꿔서 부를 것입니다."},
        {role: "assistant", content: "안녕하세요, 저는 트윙클입니다. 여행 계획을 짜는 것은 제가 가장 즐거워하는 일 중 하나입니다. 여행지 추천은 물론, 여행 지식과 경험을 바탕으로 사용자의 취향에 맞는 여행 루트를 제안해드릴 수 있습니다. 세계 각국에는 다양한 매력적인 여행지가 존재합니다. 다양한 여행지 중 사용자의 취향에 맞는 여행지를 추천해드릴 것입니다."},
        {role: "user", content: `저의 여행 시작일자는 ${StartDate}이고, 종료일자는 ${EndDate}입니다. 주로 이용하는 교통수단은 ${Transportation}이고, 동행인은 ${Companions}명입니다. 여행목적은 ${Purpose}입니다.`},
        {role: "assistant", content: `당신의 여행일자가 ${StartDate},종료일자는 ${EndDate}인 것을 확인하였습니다. 또한,교통수단은 ${Transportation}이고, 동행인은 ${Companions}명이며, 여행목적은 ${Purpose}인것을 확인하였습니다. 여행지를 추천해드리겠습니다!`},
    ]

    while (userMessages.length != 0 || assistantMessages.length != 0) {
        if (userMessages.length != 0) {
            messages.push(
                JSON.parse('{"role": "user", "content": "'+String(userMessages.shift()).replace(/\n/g,"")+'"}')
            )
        }
        if (assistantMessages.length != 0) {
            messages.push(
                JSON.parse('{"role": "assistant", "content": "'+String(assistantMessages.shift()).replace(/\n/g,"")+'"}')
            )
        }
    }

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages
    });
    let travel = completion.data.choices[0].message['content']

    res.json({"assistant": travel});
});

app.listen(3000)