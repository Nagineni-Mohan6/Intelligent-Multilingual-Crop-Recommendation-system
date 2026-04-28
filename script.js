const API = "https://mohan678.pythonanywhere.com";


// ================== LANGUAGE SYSTEM ==================
const translations = {
    en: {
        title: "Smart Crop Recommendation",
        subtitle: "AI-powered solution for farmers",
        predict: "Predict Crop",
        result: "Recommended Crop",
        login: "Login",
        register: "Register",
        logout: "Logout",
        weather: "Use My Location"
    },

    hi: {
        title: "स्मार्ट फसल सिफारिश",
        subtitle: "किसानों के लिए AI समाधान",
        predict: "फसल अनुमान लगाएं",
        result: "अनुशंसित फसल",
        login: "लॉगिन",
        register: "रजिस्टर",
        logout: "लॉगआउट",
        weather: "मेरा स्थान उपयोग करें"
    },

    te: {
        title: "స్మార్ట్ పంట సిఫార్సు",
        subtitle: "రైతుల కోసం AI పరిష్కారం",
        predict: "పంట అంచనా వేయండి",
        result: "సిఫార్సు చేసిన పంట",
        login: "లాగిన్",
        register: "నమోదు",
        logout: "లాగ్అవుట్",
        weather: "నా స్థానం ఉపయోగించండి"
    }
};


// Apply language
function applyLanguage() {
    const lang = localStorage.getItem("lang") || "en";
    const t = translations[lang];

    if (document.getElementById("title"))
        document.getElementById("title").innerText = t.title;

    if (document.getElementById("subtitle"))
        document.getElementById("subtitle").innerText = t.subtitle;

    if (document.getElementById("predictBtn"))
        document.getElementById("predictBtn").innerText = t.predict;

    if (document.getElementById("logoutBtn"))
        document.getElementById("logoutBtn").innerText = t.logout;

    if (document.getElementById("weatherBtn"))
        document.getElementById("weatherBtn").innerText = t.weather;
}


// Change language
function setLanguage(lang) {
    localStorage.setItem("lang", lang);
    applyLanguage();
}


// ================== SESSION CHECK ==================
document.addEventListener("DOMContentLoaded", function () {
    applyLanguage();
});

    const isLoggedIn = localStorage.getItem("loggedIn");

    if (!isLoggedIn && window.location.pathname.includes("index.html")) {
        window.location.href = "login.html";
    }

    const user = localStorage.getItem("username");
    const welcome = document.getElementById("welcomeUser");

    if (user && welcome) {
        welcome.innerText = "Welcome, " + user;
    }
};


// ================== PREDICTION ==================
const form = document.getElementById("cropForm");

if (form) {
    form.addEventListener("submit", async function (e) {
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.recommended_crop) {
                document.getElementById("result").innerText =
                    "🌾 Recommended Crop: " + result.recommended_crop;
            } else {
                document.getElementById("result").innerText =
                    "❌ Error: " + result.error;
            }

        } catch (error) {
            document.getElementById("result").innerText = "❌ Server error";
        }
    });
}


// ================== REGISTER ==================
async function register() {
    try {
        const res = await fetch(API + "/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: document.getElementById("username").value,
                password: document.getElementById("password").value
            })
        });

        const data = await res.json();
        alert(data.message);

        window.location.href = "login.html";

    } catch (err) {
        alert("Server error");
    }
}


// ================== LOGIN ==================
async function login() {
    const usernameVal = document.getElementById("username").value;

    try {
        const res = await fetch(API + "/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: usernameVal,
                password: document.getElementById("password").value
            })
        });

        const data = await res.json();

        if (data.status === "success") {
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("username", usernameVal);

            window.location.href = "index.html";
        } else {
            alert("Invalid credentials");
        }

    } catch (err) {
        alert("Server not reachable");
    }
}


// ================== LOGOUT ==================
function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    window.location.href = "login.html";
}


// ================= FORGOT PASSWORD =================
async function resetPassword() {
    try {
        const res = await fetch(API + "/forgot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: document.getElementById("username").value,
                new_password: document.getElementById("new_password").value
            })
        });

        const data = await res.json();
        alert(data.message);

        window.location.href = "login.html";

    } catch (err) {
        alert("Server error");
    }
}


// ================== DARK MODE ==================
function toggleDark() {
    document.body.classList.toggle("dark");
}


// ================== NAVIGATION ==================
function goToRegister() {
    window.location.href = "register.html";
}

function goToLogin() {
    window.location.href = "login.html";
}


// ================== WEATHER API ==================
async function getWeather() {
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

            if (data.cod !== 200) {
                alert("Weather API Error");
                return;
            }

            document.getElementById("temperature").value = data.main.temp;
            document.getElementById("humidity").value = data.main.humidity;

        } catch (err) {
            alert("Weather fetch error");
        }

    }, () => {
        alert("Location permission denied");
    });
}
