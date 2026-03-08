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
const db = firebase.database().ref("ultra_sync");

// Secret Key for AES (In a real app, this would be a user-defined password)
const MASTER_SECRET = "BRECW_CYBER_2026"; 

function sendData() {
    const device = document.getElementById("deviceName").value || "Phantom Device";
    const rawText = document.getElementById("textInput").value;
    const isSecure = document.getElementById("secureCheck").checked;
    
    if(!rawText) return;

    // UPGRADE: AES Encryption
    const encryptedText = CryptoJS.AES.encrypt(rawText, MASTER_SECRET).toString();

    let otp = null;
    let expiry = null;

    if (isSecure) {
        otp = Math.floor(100000 + Math.random() * 900000).toString();
        expiry = Date.now() + 60000;
        document.getElementById("otpDisplay").innerText = "CONFIDENTIAL OTP: " + otp;
    }

    db.push({
        device,
        payload: encryptedText,
        isSecure,
        otp,
        expiry,
        time: new Date().toLocaleTimeString()
    });

    document.getElementById("textInput").value = "";
}

db.on("child_added", (snap) => {
    const data = snap.val();
    const id = snap.key;
    const container = document.getElementById("messages");
    
    const card = document.createElement("div");
    card.className = data.isSecure ? "msg-card secure-card" : "msg-card";
    card.id = `card-${id}`;

    let html = `<small>${data.device} • ${data.time}</small>`;

    if (data.isSecure) {
        html += `
            <div id="lock-ui-${id}">
                <p>🔒 ENCRYPTED PACKET</p>
                <span id="timer-${id}" class="timer-val">01:00:00</span><br><br>
                <input type="text" id="otp-${id}" class="unlock-input" placeholder="OTP">
                <button onclick="decryptAndReveal('${id}', '${data.otp}', '${data.payload}', ${data.expiry})">Reveal</button>
            </div>
            <div id="data-${id}" style="display:none; word-break: break-all; color: var(--primary);"></div>
        `;
        startCountdown(id, data.expiry);
    } else {
        // Decrypt normal messages automatically
        const bytes = CryptoJS.AES.decrypt(data.payload, MASTER_SECRET);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        html += `<p>${originalText}</p>`;
    }

    card.innerHTML = html;
    container.prepend(card);
});

function startCountdown(id, expiry) {
    const itv = setInterval(() => {
        const remaining = expiry - Date.now();
        if (remaining <= 0) {
            clearInterval(itv);
            document.getElementById(`card-${id}`).remove(); // UI remove
            db.child(id).remove(); // UPGRADE: AUTO-DESTRUCT FROM FIREBASE
            return;
        }
        const s = Math.floor((remaining % 60000) / 1000);
        const ms = remaining % 1000;
        document.getElementById(`timer-${id}`).innerText = `${s.toString().padStart(2,'0')}:${ms.toString().padStart(3,'0')}`;
    }, 50);
}

function decryptAndReveal(id, correctOtp, encryptedPayload, expiry) {
    const input = document.getElementById(`otp-${id}`).value;
    
    if (Date.now() > expiry) {
        alert("Expired!");
        return;
    }

    if (input === correctOtp) {
        // UPGRADE: AES Decryption on Reveal
        const bytes = CryptoJS.AES.decrypt(encryptedPayload, MASTER_SECRET);
        const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        
        document.getElementById(`lock-ui-${id}`).style.display = "none";
        const dataDiv = document.getElementById(`data-${id}`);
        dataDiv.innerText = decryptedText;
        dataDiv.style.display = "block";
        
        // UPGRADE: Delete from Cloud 5 seconds after reveal for ultimate privacy
        setTimeout(() => { 
            db.child(id).remove(); 
            document.getElementById(`card-${id}`).style.opacity = "0.3";
        }, 5000);
    } else {
        alert("Access Denied.");
    }
}
