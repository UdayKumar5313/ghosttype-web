const firebaseConfig = {

apiKey: "AIzaSyDRsNoO7wS4tY9G_VFwRTsTDWwHaYbJGl4",

authDomain: "ghosttype-67c57.firebaseapp.com",

databaseURL: "https://ghosttype-67c57-default-rtdb.asia-southeast1.firebasedatabase.app",

projectId: "ghosttype-67c57",

storageBucket: "ghosttype-67c57.firebasestorage.app",

messagingSenderId: "965426759949",

appId: "1:965426759949:web:08740170d41fda24478844"

};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const messagesRef = database.ref("clipboard");

let currentOTP = null;
let otpExpireTime = null;
let timerInterval = null;



function generateOTP(){

if(!document.getElementById("enablePassword").checked){

alert("Enable password option first");

return;

}

currentOTP = Math.floor(100000 + Math.random()*900000).toString();

document.getElementById("otpDisplay").innerText = "OTP: " + currentOTP;

otpExpireTime = Date.now() + 60000;

startTimer();

}



function startTimer(){

clearInterval(timerInterval);

timerInterval = setInterval(()=>{

let remaining = otpExpireTime - Date.now();

if(remaining <= 0){

clearInterval(timerInterval);

document.getElementById("timer").innerText="OTP expired";

currentOTP=null;

document.getElementById("otpDisplay").innerText="";

return;

}

let minutes = Math.floor(remaining/60000);
let seconds = Math.floor((remaining%60000)/1000);
let ms = remaining % 1000;

document.getElementById("timer").innerText =
minutes + ":" + seconds + ":" + ms;

},10);

}



function unlock(){

if(!document.getElementById("enablePassword").checked){

openApp();

return;

}

let userOTP = document.getElementById("otpInput").value;

if(userOTP === currentOTP){

openApp();

}else{

document.getElementById("loginStatus").innerText="Wrong OTP";

}

}



function openApp(){

document.getElementById("loginBox").style.display="none";
document.getElementById("app").style.display="block";

startListening();

}



function sendText(){

let device = document.getElementById("deviceName").value || "Unknown";

let text = document.getElementById("textInput").value;

let time = new Date().toLocaleTimeString();

messagesRef.push({

device:device,
text:text,
time:time

});

document.getElementById("textInput").value="";

}



function startListening(){

messagesRef.on("child_added", function(snapshot){

let data = snapshot.val();

let div = document.createElement("div");

div.className="message";

div.innerHTML =
"<b>"+data.device+"</b> ("+data.time+")<br>"+data.text;

document.getElementById("messages").prepend(div);

});

}
