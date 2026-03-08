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

let device = document.getElementById("deviceName").value || "Unknown Device";
let text = document.getElementById("textInput").value;
let time = new Date().toLocaleTimeString();

messagesRef.push({
device:device,
text:text,
time:time
});

document.getElementById("textInput").value="";
}

messagesRef.on("child_added", function(snapshot){

let data = snapshot.val();

let div = document.createElement("div");
div.className="message";

div.innerHTML =
"<b>"+data.device+"</b> ("+data.time+")<br>"+data.text;

document.getElementById("messages").prepend(div);

});