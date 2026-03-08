import logging
import time

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ml_monitor")

def log_prediction(request_id: str, input_features: dict, raw_output: dict, latency_ms: float):
    """
    Mock integration point for Datadog / Prometheus / EvidentlyAI.
    """
    logger.info(f"[Prediction] ID: {request_id}")
    
    # 1. Check Latency Thresholds
    if latency_ms > 200:
         logger.warning(f"High Latency Alert: {latency_ms}ms > 200ms threshold")
         
    # 2. Monitor Feature Drift (Mock)
    if input_features.get("aqi_24h", 0) > 300:
         logger.warning("Feature Anomaly: Unusually high AQI detected outside normal historical range.")
         
    # 3. Log Output Distribution
    logger.info(f"Generated Label: {raw_output.get('risk_level')} @ {raw_output.get('risk_probability'):.2f} confidence")

def log_schema_violation(request_id: str, error_msg: str):
    logger.error(f"[Schema Violation] ID: {request_id} | Validation Failed: {error_msg}")
    
# Can be integrated via FastAPI Middleware for actual day 1 telemetry.
