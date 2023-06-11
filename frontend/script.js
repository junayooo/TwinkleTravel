const chatBox = document.querySelector(".chat-box");
let userMessages = [];
let assistantMessages = [];
let StartDate = "";
let EndDate = "";
let Transportation = "";
let Companions = "";
let Purpose = "";
let Place = "";
let obtainedPlace = [];
let searchTexts = [];
function spinner() {
  document.getElementById("loader").style.display = "block";
}


async function start() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const transportation = document.getElementById("transportation").value;
  const companions = document.getElementById("companions").value;
  const purpose = document.getElementById("purpose").value;
  const place = document.getElementById("place").value;
 
  if (startDate === "") {
    alert("시작일을 입력해주세요.");
    return;
  }
  StartDate = startDate;
  if (endDate === "") {
    alert("종료일을 입력해주세요.");
    return;
  }
  EndDate = endDate;

  Transportation = transportation;
  Companions = companions;
  Purpose = purpose;
  Place = place;
  //검색어 배열
  searchTexts = [
    "자연경관 관광지",
    "시장",
    "식당",
    "카페",
    "bar",
    "게스트 하우스"
  ];
  document.getElementById("intro").style.display = "none";
  document.getElementById("chat").style.display = "block";

  const placeRequest = await fetch("http://localhost:3000/map", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Place: Place,
      searchTexts: searchTexts,
    }),
  });

  obtainedPlace = await placeRequest.json();
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



  const response = await fetch("http://localhost:3000/travelGuide", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      StartDate: StartDate,
      EndDate: EndDate,
      Transportation: Transportation,
      Companions: Companions,
      Purpose: Purpose,
      Place: Place,
      userMessages: userMessages,
      assistantMessages: assistantMessages,
      obtainedPlace : obtainedPlace
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
  fetch("http://localhost:3000/travelLogs")
    .then((response) => response.json())
    .then((data) => {
      const travelList = document.getElementById("travelList");
      data.forEach((item) => {
        const li = document.createElement("li");
        const text = document.createTextNode(
          `${item.StartDate} - ${item.EndDate}: ${item.travel}`
        );
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