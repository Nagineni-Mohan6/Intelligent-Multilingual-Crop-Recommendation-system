from flask import Flask, request, jsonify
import sqlite3
import joblib
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ================= DATABASE =================
def init_db():
    conn = sqlite3.connect("users.db")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    """)
    conn.close()

init_db()

# ================= HOME ROUTE (FIX 404) =================
@app.route("/")
def home():
    return "🌱 Crop Recommendation API is Running"

# ================= LOAD MODEL =================
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))

# ================= REGISTER =================
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    try:
        conn = sqlite3.connect("users.db")
        conn.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (data["username"], data["password"])
        )
        conn.commit()
        conn.close()
        return {"message": "Registered successfully"}
    except:
        return {"message": "Username already exists"}

# ================= LOGIN =================
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    conn = sqlite3.connect("users.db")
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM users WHERE username=? AND password=?",
        (data["username"], data["password"])
    )
    user = cur.fetchone()
    conn.close()

    if user:
        return {"status": "success"}
    return {"status": "fail"}

# ================= FORGOT PASSWORD =================
@app.route("/forgot", methods=["POST"])
def forgot():
    data = request.json

    conn = sqlite3.connect("users.db")
    conn.execute(
        "UPDATE users SET password=? WHERE username=?",
        (data["new_password"], data["username"])
    )
    conn.commit()
    conn.close()

    return {"message": "Password updated successfully"}

# ================= PREDICT =================
import pandas as pd

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        # ✅ Use DataFrame with column names (fix warning + best practice)
        input_data = pd.DataFrame([{
            "N": float(data['N']),
            "P": float(data['P']),
            "K": float(data['K']),
            "temperature": float(data['temperature']),
            "humidity": float(data['humidity']),
            "ph": float(data['ph']),
            "rainfall": float(data['rainfall'])
        }])

        # ✅ Apply scaler
        input_scaled = scaler.transform(input_data)

        # ✅ Predict using scaled data
        prediction = model.predict(input_scaled)

        return jsonify({
            "recommended_crop": prediction[0]
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        })
# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True)
