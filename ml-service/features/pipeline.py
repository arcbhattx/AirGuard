import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import os

# Paths config
DATA_DIR = "/Users/carloslazcano/datasets"
PROCESSED_DATA_DIR = os.path.join(os.path.dirname(__file__), "../data")

def load_raw_data():
    """Load AQI data to serve as the base for building features."""
    # Using one of the smaller annual AQI files to build the prototype quickly
    aqi_file = os.path.join(DATA_DIR, "annual_aqi_by_county_2024.csv")
    print(f"Loading data from {aqi_file}...")
    df = pd.read_csv(aqi_file)
    return df

def engineer_features(df):
    """
    Simulates the feature engineering pipeline.
    Combines real environmental data (AQI) with simulated personal health data
    to match the exact contract required by input_schema.json.
    """
    print("Engineering features...")
    
    # Simulating features based on the strict input contract
    n_samples = len(df)
    
    # 1. Real feature: AQI (using max AQI as a proxy for 24h average for prototype)
    # The actual column name might vary depending on the dataset structure, typically 'Max AQI' or 'Median AQI'
    col_aqi = 'Max AQI' if 'Max AQI' in df.columns else df.columns[-1] 
    
    features = pd.DataFrame({
        "aqi_24h": df[col_aqi].fillna(50).astype(float),
        # 2. Simulated feature: Distance to nearest clean air center (0 to 50 miles)
        "distance_to_clean_air_center": np.random.uniform(0.1, 50.0, n_samples),
        # 3. Simulated feature: User Age (18 to 90)
        "age": np.random.randint(18, 90, n_samples),
        # 4. Simulated feature: Respiratory History (roughly 20% prevalence)
        "respiratory_history": np.random.choice([True, False], p=[0.2, 0.8], size=n_samples)
    })
    
    # Simulate target label (Risk Level: low, medium, high, critical)
    # Higher AQI, older age, and respiratory history increase risk
    risk_score = (
        features["aqi_24h"] * 0.4 + 
        features["age"] * 0.3 + 
        (100 * features["respiratory_history"]) - 
        (features["distance_to_clean_air_center"] * 0.5)
    )
    
    # Bin into categorical risks
    labels = pd.cut(
        risk_score, 
        bins=[-np.inf, 50, 100, 150, np.inf], 
        labels=["low", "medium", "high", "critical"]
    )
    
    return features, labels

def split_and_save(X, y):
    """Split data and save to the local data/ folder for reproducible training."""
    print("Splitting datasets (Train/Val/Test)...")
    # 70% Train, 15% Val, 15% Test
    X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.15, random_state=42)
    X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.1765, random_state=42) # 0.15 / 0.85 = ~0.1765
    
    os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
    
    # Save datasets
    train_df = pd.concat([X_train, y_train.rename("risk_level")], axis=1)
    val_df = pd.concat([X_val, y_val.rename("risk_level")], axis=1)
    test_df = pd.concat([X_test, y_test.rename("risk_level")], axis=1)
    
    train_df.to_csv(os.path.join(PROCESSED_DATA_DIR, "train.csv"), index=False)
    val_df.to_csv(os.path.join(PROCESSED_DATA_DIR, "val.csv"), index=False)
    test_df.to_csv(os.path.join(PROCESSED_DATA_DIR, "test.csv"), index=False)
    print(f"Data successfully saved to {PROCESSED_DATA_DIR}")

if __name__ == "__main__":
    df = load_raw_data()
    X, y = engineer_features(df)
    split_and_save(X, y)
