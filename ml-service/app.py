
from flask import Flask, jsonify
import random

app = Flask(__name__)

@app.route('/predict')
def predict():
    return jsonify({
        "risk_score": random.randint(1,100),
        "fraud_probability": round(random.random(),2)
    })

if __name__ == '__main__':
    app.run(port=8000)
