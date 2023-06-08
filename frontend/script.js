     import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
     import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics.js";
     import {
        getAuth,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
      } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
 
     const firebaseConfig = {
       apiKey: "AIzaSyBq42LzIFD0TnG8Tra3Mz59bDDhnEiRqBw",
       authDomain: "twinklelogin-68655.firebaseapp.com",
       projectId: "twinklelogin-68655",
       storageBucket: "twinklelogin-68655.appspot.com",
       messagingSenderId: "524273054320",
       appId: "1:524273054320:web:05f173567117f568fcfab5",
       measurementId: "G-ZPZKNCQ1E7",
     };

     // Initialize Firebase
     const app = initializeApp(firebaseConfig);
     const analytics = getAnalytics(app);
     const auth = getAuth();

     function showAlert(message) {
       alert(message);
     }

     document
       .getElementById("signUpButton")
       .addEventListener("click", (event) => {
         event.preventDefault();
         const signUpEmail = document.getElementById("signUpEmail").value;
         const signUpPassword =
           document.getElementById("signUpPassword").value;

         if (
           !/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,16}$/.test(signUpPassword)
         ) {
           showAlert(
             "비밀번호는 영어와 숫자를 포함한 8자 이상 16자 이하로 입력해주세요."
           );
           return;
         }
 
         createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword)
           .then((userCredential) => {
             console.log(userCredential);
             // Signed in
             const user = userCredential.user;
             showAlert("회원가입완료!");
             document.getElementById("login").style.display = "block";
             document.getElementById("sign").style.display = "none";
           })
           .catch((error) => {
             console.log("error");
             const errorCode = error.code;
             const errorMessage = error.message;
             // ..
           });
       });

     document
       .getElementById("signInButton")
       .addEventListener("click", (event) => {
         event.preventDefault();
         const signInEmail = document.getElementById("signInEmail").value;
         const signInPassword =
           document.getElementById("signInPassword").value;

         signInWithEmailAndPassword(auth, signInEmail, signInPassword)
           .then((userCredential) => {
             // Signed in
             console.log(userCredential);
             const user = userCredential.user;
             showAlert("로그인되었습니다!");
             document.getElementById("intro").style.display = "block";
             document.getElementById("sign").style.display = "none";
             document.getElementById("login").style.display = "none";
             document.getElementById("intro").style.display = "block";
             // ...
           })
           .catch((error) => {
             console.log("로그인 실패");
             const errorCode = error.code;
             const errorMessage = error.message;
             showAlert("이메일 또는 비밀번호가 잘못되었습니다.");
           });
       });

       const chatBox = document.querySelector(".chat-box");
       let userMessages = [];
       let assistantMessages = [];
       let StartDate = "";
       let EndDate = "";
       let Transportation = "";
       let Companions = "";
       let Purpose = "";
       let Place = "";
 
       function spinner() {
         document.getElementById("loader").style.display = "block";
       }
 
       function start() {
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
 
         document.getElementById("intro").style.display = "none";
         document.getElementById("chat").style.display = "block";
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
           .then(response => response.json())
           .then(data => {
             const travelList = document.getElementById("travelList");
             data.forEach(item => {
               const li = document.createElement("li");
               const text = document.createTextNode(
                 `${item.StartDate} - ${item.EndDate}: ${item.travel}`
               );
               li.appendChild(text);
               travelList.appendChild(li);
             });
           })
           .catch(error => {
             console.log("Error fetching travel logs:", error);
           });
       }

       fetchTravelLogs();

//회원가입 창 나타나게 하기
      
        document.getElementById("showSignUpButton").addEventListener("click", () => {
            document.getElementById("login").style.display = "none";
            document.getElementById("sign").style.display = "block";
        });