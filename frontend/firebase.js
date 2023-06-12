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

document.getElementById("signUpButton").addEventListener("click", (event) => {
  event.preventDefault();
  const signUpEmail = document.getElementById("signUpEmail").value;
  const signUpPassword = document.getElementById("signUpPassword").value;

  if (!/^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,16}$/.test(signUpPassword)) {
    showAlert(
      "비밀번호는 영어와 숫자를 포함한 8자 이상 16자 이하로 입력해주세요."
    );
    return;
  }

  createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword)
    .then((userCredential) => {
      console.log(userCredential);
      // Signed up
      showAlert("회원가입완료!");
      document.getElementById("login").style.display = "block";
      document.getElementById("sign").style.display = "none";
    })
    .catch((error) => {
      console.log("error", error.code, error.message);
    });
});

document.getElementById("signInButton").addEventListener("click", (event) => {
  event.preventDefault();
  const signInEmail = document.getElementById("signInEmail").value;
  const signInPassword = document.getElementById("signInPassword").value;

  signInWithEmailAndPassword(auth, signInEmail, signInPassword)
    .then((userCredential) => {
      // Signed in
      console.log(userCredential);
      localStorage.setItem("userToken", userCredential.user.token);

      showAlert("로그인되었습니다!");
      document.getElementById("intro").style.display = "block";
      document.getElementById("sign").style.display = "none";
      document.getElementById("login").style.display = "none";
      document.getElementById("intro").style.display = "block";
      
    })
    .catch((error) => {
      console.log("로그인 실패", error.code, error.message);
      showAlert("이메일 또는 비밀번호가 잘못되었습니다.");
    });
});


// document.addEventListener("DOMContentLoaded", () => {
//   const userToken = localStorage.getItem("userToken");
//   if (userToken) {
//     // 토큰이 있는 경우, 사용자가 이미 로그인된 것으로 간주합니다.
//     // 로그인 상태를 유지하고 원하는 동작을 수행합니다.
//     document.getElementById("intro").style.display = "block";
//     document.getElementById("sign").style.display = "none";
//     document.getElementById("login").style.display = "none";
//   } else {
//     // 토큰이 없는 경우, 사용자는 로그인되지 않은 상태입니다.
//     // 로그인 화면을 표시합니다.
//     document.getElementById("intro").style.display = "none";
//     document.getElementById("sign").style.display = "none";
//     document.getElementById("login").style.display = "block";
//   }
// });