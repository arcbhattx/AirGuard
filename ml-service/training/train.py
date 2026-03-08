import pandas as pd
import numpy as np
import os
import joblib
from xgboost import XGBClassifier
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score

DATA_DIR = os.path.join(os.path.dirname(__file__), "../data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "../models")

def load_data(split_name="train"):
    """Load split datasets"""
    file_path = os.path.join(DATA_DIR, f"{split_name}.csv")
    df = pd.read_csv(file_path)
    
    # Separate features and target
    X = df.drop(columns=["risk_level"])
    y = df["risk_level"]
    
    # Map target strings to integers for XGBoost
    label_map = {"low": 0, "medium": 1, "high": 2, "critical": 3}
    y = y.map(label_map)
    return X, y

def build_pipeline():
    """Defines the preprocessor and model inside a unified pipeline"""
    # Define columns by type based on inputs
    numeric_features = ["aqi_24h", "distance_to_clean_air_center", "age"]
    categorical_features = ["respiratory_history"]

    # Preprocessing pipelines
    numeric_transformer = Pipeline(steps=[("scaler", StandardScaler())])
    categorical_transformer = Pipeline(steps=[("onehot", OneHotEncoder(handle_unknown="ignore"))])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ]
    )

    # Base Estimator
    base_xgb = XGBClassifier(
        n_estimators=100, 
        max_depth=3, 
        learning_rate=0.1, 
        objective="multi:softprob", 
        eval_metric="mlogloss",
        random_state=42
    )

    # Calibration Layer (Isotonic or Sigmoid/Platt Scaling)
    calibrated_clf = CalibratedClassifierCV(estimator=base_xgb, cv=3, method="isotonic")

    # Full Model Pipeline
    clf = Pipeline(steps=[("preprocessor", preprocessor), ("classifier", calibrated_clf)])
    
    return clf

def train_and_save():
    print("Loading data for training...")
    try:
        X_train, y_train = load_data("train")
        X_val, y_val = load_data("val")
    except FileNotFoundError:
        print("Data splits not found. Please run feature pipeline first.")
        return

    print(f"Training Baseline Model on {len(X_train)} samples...")
    model_pipeline = build_pipeline()
    model_pipeline.fit(X_train, y_train)

    # Basic Val Check
    val_probs = model_pipeline.predict_proba(X_val)
    print(f"Validation completed. Shapes: {val_probs.shape}")

    # Serialize Preprocessor + Model natively
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, "triage_v1.0.pkl")
    joblib.dump(model_pipeline, model_path)
    print(f"Model saved to: {model_path}")

if __name__ == "__main__":
    train_and_save()
