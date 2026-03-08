from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
import joblib
import os
import pandas as pd

# Define paths
MODEL_DIR = os.path.join(os.path.dirname(__file__), "../models")
MODEL_PATH = os.path.join(MODEL_DIR, "triage_v1.0.pkl")

# Initialize app
app = FastAPI(title="ML Prediction Service", description="Stateless endpoint for LLM triage predictions")

# Load model globally on startup
model = None
MODEL_VERSION = "triage_v1.0"

@app.on_event("startup")
def load_model():
    global model
    try:
        model = joblib.load(MODEL_PATH)
        print(f"[{MODEL_VERSION}] Loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"Warning: Model not found at {MODEL_PATH}. Run training first.")
        model = None

# Pydantic Schemas matching strict input_schema.json
class PredictionRequest(BaseModel):
    aqi_24h: float = Field(..., ge=0, le=1000, description="24-hour average Air Quality Index")
    respiratory_history: bool = Field(..., description="Whether the user has a history of respiratory issues")
    distance_to_clean_air_center: float = Field(..., ge=0, description="Distance to nearest clean air center in miles")
    age: int = Field(..., ge=0, description="User's age")

# Pydantic Schemas matching output_schema.json Translation layer
class PredictionResponse(BaseModel):
    risk_level: str
    risk_probability: float = Field(..., ge=0.0, le=1.0)
    top_factors: List[str]
    recommended_action: str
    model_version: str

def format_recommendation(risk: str) -> str:
    """Business logic tying risk to LLM recommendation."""
    actions = {
        "low": "standard_observation",
        "medium": "monitor_symptoms_indoors",
        "high": "seek_clean_air_shelter",
        "critical": "urgent_care"
    }
    return actions.get(risk, "unknown")

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model unavailable. Check serialization state.")
        
    try:
        # Convert strict JSON payload to DataFrame for model
        input_data = pd.DataFrame([request.model_dump()])
        
        # Inference
        y_pred_idx = model.predict(input_data)[0]
        y_proba = model.predict_proba(input_data)[0]
        
        # Translate from internal numeric enum back to strings for struct payload
        labels = ["low", "medium", "high", "critical"]
        risk_level = labels[y_pred_idx]
        confidence = float(y_proba[y_pred_idx]) # Probability of predicted class
        
        # Naive feature importance (would usually use SHAP)
        top_factors = ["respiratory_history", "aqi_24h"] if request.respiratory_history else ["aqi_24h"]
            
        return PredictionResponse(
            risk_level=risk_level,
            risk_probability=confidence,
            top_factors=top_factors,
            recommended_action=format_recommendation(risk_level),
            model_version=MODEL_VERSION
        )
    except Exception as e:
        # Log to mock monitor internally
        print(f"[Error] Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
