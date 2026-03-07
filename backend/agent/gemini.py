from google.generativeai import configure, GenerativeModel
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional

# Load local .env variables
load_dotenv()

# Attempt to load the key matching your .env exactly
# It relies on the GEMINI_KEY token you specified
GEMINI_KEY = os.getenv("GEMINI_KEY")

if not GEMINI_KEY:
    print("Warning: GEMINI_KEY not found in environment!")
else:
    configure(api_key=GEMINI_KEY)

# Define the model to use
model = GenerativeModel("gemini-2.5-pro")

# Schema for the frontend request
class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

def generate_chat_response(message: str, history: List[dict] = None) -> str:
    """
    Sends a message to the Gemini Agent and returns the response.
    Includes context framing the agent as the "AirGuard AI".
    """
    # Build System Prompt/Context
    context = (
        "You are AirGuard AI, a highly intelligent and minimal air quality monitoring assistant. "
        "You help users understand Air Quality Index (AQI) data, particulate matters (PM 2.5), wind patterns, and fire statuses. "
        "Keep your answers concise, actionable, and focused on environmental health and safety.\n"
    )
    
    # We pass the context along with their message to ground the model.
    full_prompt = f"{context}\nUser Request: {message}\n"
    
    try:
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "I apologize, but I am currently unable to process air quality requests. Please try again later."
