// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDRsNoO7wS4tY9G_VFwRTsTDWwHaYbJGl4",
    authDomain: "ghosttype-67c57.firebaseapp.com",
    databaseURL: "https://ghosttype-67c57-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ghosttype-67c57",
    storageBucket: "ghosttype-67c57.firebasestorage.app",
    messagingSenderId: "965426759949",
    appId: "1:965426759949:web:08740170d41fda24478844"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref("sync_data");

// 1. Send Data Function
function sendData() {
    const device = document.getElementById("deviceName").value || "Unknown Device";
    const text = document.getElementById("textInput").value;
    const isSecure = document.getElementById("secureCheck").checked;
    const timestamp = new Date().toLocaleTimeString();

    if (!text) return alert("Please enter text!");

    let otp = null;
    let expiry = null;

    if (isSecure) {
        otp = Math.floor(100000 + Math.random() * 900000).toString();
        expiry = Date.now() + 60000; // 1 minute from now
        document.getElementById("otpAlert").innerText = "Message Locked! OTP: " + otp;
    } else {
        document.getElementById("otpAlert").innerText = "";
    }

    db.push({
        device,
        text,
        isSecure,
        otp,
        expiry,
        timestamp
    });

    document.getElementById("textInput").value = "";
}

// 2. Real-time Listener
db.on("child_added", (snapshot) => {
    const data = snapshot.val();
    const msgId = snapshot.key;
    displayMessage(msgId, data);
});

// 3. Display Logic
function displayMessage(id, data) {
    const container = document.getElementById("messages");
    const div = document.createElement("div");
    div.className = data.isSecure ? "msg-card secure-card" : "msg-card";
    div.id = "card-" + id;

    let content = `<div class="meta">${data.device} | ${data.timestamp}</div>`;

    if (data.isSecure) {
        content += `
            <div id="locked-${id}">
                <p style="color:red;">🔒 <b>Secure Content Locked</b></p>
                <span class="timer-text" id="timer-${id}">01:00:000</span><br><br>
                <input type="text" id="input-${id}" placeholder="Enter OTP" style="width:100px; margin-right:10px;">
                <button class="unlock-btn" onclick="unlockMsg('${id}', '${data.otp}', '${data.text}', ${data.expiry})">Unlock</button>
            </div>
            <div id="unlocked-${id}" style="display:none;">${data.text}</div>
        `;
        
        // Start the timer for this specific message
        startTimer(id, data.expiry);
    } else {
        content += `<div>${data.text}</div>`;
    }

    div.innerHTML = content;
    container.prepend(div);
}

// 4. Timer Logic (Min:Sec:Ms)
function startTimer(id, expiry) {
    const timerElement = document.getElementById("timer-" + id);
    
    const interval = setInterval(() => {
        const now = Date.now();
        const diff = expiry - now;

        if (diff <= 0) {
            clearInterval(interval);
            timerElement.innerText = "EXPIRED";
            document.getElementById("input-" + id).disabled = true;
            return;
        }

        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        const ms = diff % 1000;

        timerElement.innerText = 
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
    }, 50);
}

// 5. Unlock Function
window.unlockMsg = (id, correctOtp, originalText, expiry) => {
    const entered = document.getElementById("input-" + id).value;
    
    if (Date.now() > expiry) {
        alert("Too late! OTP has expired.");
        return;
    }

    if (entered === correctOtp) {
        document.getElementById("locked-" + id).style.display = "none";
        document.getElementById("unlocked-" + id).style.display = "block";
    } else {
        alert("Wrong OTP!");
    }
};
