const API = "http://127.0.0.1:5000";


// ================== PREDICTION ==================
const form = document.getElementById("cropForm");


if(form){
    form.addEventListener("submit", async function(e) {
        e.preventDefault();

        const data = {
            N: parseFloat(document.getElementById("N").value),
            P: parseFloat(document.getElementById("P").value),
            K: parseFloat(document.getElementById("K").value),
            temperature: parseFloat(document.getElementById("temperature").value),
            humidity: parseFloat(document.getElementById("humidity").value),
            ph: parseFloat(document.getElementById("ph").value),
            rainfall: parseFloat(document.getElementById("rainfall").value)
        };

        document.getElementById("result").innerText = "⏳ Predicting...";

        try {
            const response = await fetch(API + "/predict", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            });

            const result = await response.json();

            document.getElementById("result").innerText =
                "🌾 Recommended Crop: " + result.recommended_crop;

        } catch (error) {
            document.getElementById("result").innerText = "❌ Server error";
        }
    });
}


// ================== REGISTER ==================
async function register(){
    const res = await fetch(API + "/register", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            username: document.getElementById("username").value,
            password: document.getElementById("password").value
        })
    });

    const data = await res.json();
    alert(data.message);
    window.location.href = "login.html";
}

// ================= SESSION CHECK =================

// Run when page loads
window.onload = function () {

    const isLoggedIn = localStorage.getItem("loggedIn");

    // 🔐 Protect page
    if (!isLoggedIn && window.location.pathname.includes("index.html")) {
        window.location.href = "login.html";
    }

    // 👤 Show username
    const user = localStorage.getItem("username");
    const welcome = document.getElementById("welcomeUser");

    if(user && welcome){
        welcome.innerText = "Welcome, " + user;
    }
};

// ================== LOGIN ==================
async function login(){
    const usernameVal = document.getElementById("username").value;

    const res = await fetch(API + "/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            username: usernameVal,
            password: document.getElementById("password").value
        })
    });

    const data = await res.json();

    if(data.status === "success"){
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("username", usernameVal); // ✅ SAVE USER

        window.location.href = "index.html";
    } else {
        alert("Invalid credentials");
    }
}
// ================== LOGOUT ==================
function logout(){
    localStorage.removeItem("loggedIn"); // clear login
    window.location.href = "login.html";
}
// ================= FORGOT PASSWORD =================
async function resetPassword(){
    const res = await fetch(API + "/forgot", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            username: document.getElementById("username").value,
            new_password: document.getElementById("new_password").value
        })
    });

    const data = await res.json();
    alert(data.message);
    window.location.href = "login.html";
}
// ================== NAVIGATION ==================
function goToRegister(){
    window.location.href = "register.html";
}

function goToLogin(){
    window.location.href = "login.html";
}
function toggleDark(){
    document.body.classList.toggle("dark");
}
async function getWeather(){
    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=784eb6ee0097b8797b35f949c4e089f4&units=metric`
            );

            const data = await res.json();

            console.log(data); // 🔥 DEBUG

            if(data.cod !== 200){
                alert("API Error: " + data.message);
                return;
            }

            document.getElementById("temperature").value = data.main.temp;
            document.getElementById("humidity").value = data.main.humidity;

        } catch (err) {
            console.error(err);
            alert("❌ Error fetching weather");
        }

    }, (error) => {
        alert("Location permission denied");
    });
}