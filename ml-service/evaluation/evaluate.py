import pandas as pd
import numpy as np
import os
import joblib
from sklearn.metrics import classification_report, roc_auc_score, log_loss

DATA_DIR = os.path.join(os.path.dirname(__file__), "../data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "../models")

def load_test_data():
    file_path = os.path.join(DATA_DIR, "test.csv")
    df = pd.read_csv(file_path)
    
    X = df.drop(columns=["risk_level"])
    y = df["risk_level"]
    
    label_map = {"low": 0, "medium": 1, "high": 2, "critical": 3}
    y = y.map(label_map)
    return X, y

def evaluate_model():
    print("Loading test data and model...")
    X_test, y_test = load_test_data()
    model_path = os.path.join(MODEL_DIR, "triage_v1.0.pkl")
    
    if not os.path.exists(model_path):
        print("Model file not found. Ensure `train.py` runs first.")
        return
        
    model = joblib.load(model_path)
    
    # Predict
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)
    
    # Global Metrics
    print("\n--- Model Evaluation (Test Set) ---")
    print(f"Samples: {len(X_test)}")
    
    # AUC and Log Loss
    auc = roc_auc_score(y_test, y_proba, multi_class="ovr")
    loss = log_loss(y_test, y_proba)
    print(f"Global AUC-ROC (OVR): {auc:.4f}")
    print(f"Log Loss: {loss:.4f}")
    
    # Classification Report
    labels = ["low", "medium", "high", "critical"]
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=labels))
    
    # Sliced Metrics: Look at predictive performance separated by respiratory history
    print("\n--- Sliced Metrics (By Sub-Group) ---")
    
    for hist in [True, False]:
        mask = X_test["respiratory_history"] == hist
        if sum(mask) > 0:
            sub_y = y_test[mask]
            sub_pred = y_pred[mask]
            
            # Since subsets may not contain all classes, precision/recall can be noisy
            # But we can calculate local accuracy for testing
            acc = np.mean(sub_y == sub_pred)
            print(f"Group: Respiratory History = {hist}")
            print(f"  Samples: {sum(mask)}")
            print(f"  Local Accuracy: {acc:.4f}\n")

if __name__ == "__main__":
    evaluate_model()
