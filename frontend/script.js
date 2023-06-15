const chatBox = document.querySelector(".chat-box");
let userMessages = [];
let assistantMessages = [];
let Dates = "";
let Purpose = "";
let Place = "";
let Act_rest = "";
let Money = 0;
let Memory = "";
let Plan = "";
//nearbyplace
let Types = [];
//textsearch
// let searchTexts = [];
function spinner() {
  document.getElementById("loader").style.display = "block";
}

$(document).ready(function () {
  $('input[name="dates"]').daterangepicker();
});

async function start() {
  const dates = document.getElementById("dates").value;
  const purpose = document.querySelector('input[name="image"]:checked').value;
  const place = document.getElementById("place").value;
  const act_rest = document.getElementById("act_rest").value;
  const money = document.querySelector('input[name="money"]:checked').value;
  const memory = document.getElementById("memory").value;
  const plan = document.getElementById("plan").value;

  if (dates === "") {
    alert("여행기간을 입력해주세요.");
    return;
  }

  Dates = dates;
  Purpose = purpose;
  Place = place;
  Act_rest = act_rest;
  Money = money;
  Memory = memory;
  Plan = plan;

  //장소유형
  Types = [
    "amusement_park",
    "aquarium",
    "art_gallery",
    "museum",
    "shopping_mall",
    "tourist_attraction",
    "landmark",
    "zoo",
    "park",
    "bar",
    "cafe",
    "restaurant",
    "lodging",
  ];
  //검색어 배열
  // searchTexts = ["자연경관 관광지", "restaurant", "cafe", "bar", "숙소"];
  document.getElementById("intro").style.display = "none";
  document.getElementById("chat").style.display = "block";

  const placeRequest = await fetch("http:localhost:3000/map", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Place: Place,
      Types: Types,
      Money: Money,
      // searchTexts: searchTexts,
    }),
  });

  const obtainedPlaces = await placeRequest.json();
  // ObtainedPlaces=obtainedPlaces;
}

const sendMessage = async () => {
  const chatInput = document.querySelector(".chat-input input");
  const chatMessage = document.createElement("div");
  chatMessage.classList.add("chat-message");
  chatMessage.innerHTML = `
     <p>${chatInput.value}</p>
   `;
  chatBox.appendChild(chatMessage);

  //userMessage 메세지 추가
  userMessages.push(chatInput.value);

  chatInput.value = "";

  const response = await fetch("http:localhost:3000/travelGuide", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Dates: Dates,
      Purpose: Purpose,
      Place: Place,
      Act_rest: Act_rest,
      Money: Money,
      Memory: Memory,
      Plan: Plan,
      // ObtainedPlaces: ObtainedPlaces,
      userMessages: userMessages,
      assistantMessages: assistantMessages,
    }),
  });

  const data = await response.json();
  document.getElementById("loader").style.display = "none";

  //assistantMessage 메세지 추가
  assistantMessages.push(data.assistant);

  const astrologerMessage = document.createElement("div");
  astrologerMessage.classList.add("chat-message");
  astrologerMessage.innerHTML = `
     <p class='assistant'>${data.assistant}</p>
   `;
  chatBox.appendChild(astrologerMessage);
};

document
  .querySelector(".chat-input button")
  .addEventListener("click", sendMessage);

function fetchTravelLogs() {
  fetch("http:localhost:3000/travelLogs")
    .then((response) => response.json())
    .then((data) => {
      const travelList = document.getElementById("travelList");
      data.forEach((item) => {
        const li = document.createElement("li");
        const text = document.createTextNode(`${item.dates}: ${item.travel}`);
        li.appendChild(text);
        travelList.appendChild(li);
      });
    })
    .catch((error) => {
      console.log("Error fetching travel logs:", error);
    });
}

fetchTravelLogs();

//회원가입 창 나타나게 하기

document.getElementById("showSignUpButton").addEventListener("click", () => {
  document.getElementById("login").style.display = "none";
  document.getElementById("sign").style.display = "block";
});
