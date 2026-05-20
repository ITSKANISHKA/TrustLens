from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "TrustLens ML Service Running"
    }

@app.get("/predict")
def predict():
    return {
        "fraud_probability": 0.82,
        "prediction": "Fraud"
    }
