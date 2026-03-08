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



function sendText(){

let device = document.getElementById("deviceName").value || "Unknown";

let text = document.getElementById("textInput").value;

let secure = document.getElementById("secureCheck").checked;

let time = new Date().toLocaleTimeString();

let otp = null;

let expire = null;

if(secure){

otp = Math.floor(100000 + Math.random()*900000).toString();

expire = Date.now() + 60000;

alert("OTP: " + otp + " (valid 1 minute)");

}

messagesRef.push({

device:device,
text:text,
secure:secure,
otp:otp,
expire:expire,
time:time

});

document.getElementById("textInput").value="";

}



messagesRef.on("child_added", function(snapshot){

let data = snapshot.val();

let div = document.createElement("div");

div.className="message";

if(data.secure){

div.innerHTML =
"<b>"+data.device+"</b> ("+data.time+")<br>"+
"<span class='locked'>🔒 Secure message</span><br>"+
"<input placeholder='Enter OTP'>"+
"<button>Unlock</button>";

let input = div.querySelector("input");

let button = div.querySelector("button");

button.onclick = function(){

if(Date.now() > data.expire){

alert("OTP expired");

return;

}

if(input.value === data.otp){

div.innerHTML =
"<b>"+data.device+"</b> ("+data.time+")<br>"+data.text;

}else{

alert("Wrong OTP");

}

};

}else{

div.innerHTML =
"<b>"+data.device+"</b> ("+data.time+")<br>"+data.text;

}

document.getElementById("messages").prepend(div);

});
