from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client
from pydantic import BaseModel
from database import get_db
from agents.openai_agent import OpenAIAgent
from typing import List, Optional

app = FastAPI(title="AirGuard Backend")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConversationCreate(BaseModel):
    title: str
    user_id: str | None = None # Optional for testing before Auth is complete

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None
    latitude: float = None
    longitude: float = None

openai_agent = OpenAIAgent()

@app.get("/")
def read_root():
    return {"message": "Hello from backend!"}

@app.get("/health")
def health_check(db: Client = Depends(get_db)):
    """Sample endpoint to verify Supabase client is available."""
    try:
        # Just check if we can query the database generically
        db.table("conversations").select("id").limit(1).execute()
        return {"status": "ok", "message": "Supabase client is configured and available."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/conversations")
def create_conversation(conv: ConversationCreate, db: Client = Depends(get_db)):
    """Test endpoint to create a conversation in Supabase."""
    try:
        data = {
            "title": conv.title
        }
        if conv.user_id:
            data["user_id"] = conv.user_id
            
        response = db.table("conversations").insert(data).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/conversations")
def list_conversations(db: Client = Depends(get_db)):
    """Test endpoint to list conversations from Supabase."""
    try:
        response = db.table("conversations").select("*").execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

import traceback

@app.post("/chat")
def chat_with_openai(request: ChatRequest):
    try:
        # OpenAI expects standard messages: role and content
        history = []
        if request.history:
            for msg in request.history:
                history.append({
                    "role": "user" if msg.role == "user" else "assistant",
                    "content": msg.content
                })
        
        # Debug log
        print("Incoming message:", request.message)
        print("History:", history)

        result = openai_agent.generate_response(
            request.message, 
            history=history, 
            lat=request.latitude, 
            lng=request.longitude
        )
        print("OpenAI result:", result)
        return {"status": "success", "response": result["text"], "actions": result.get("actions", [])}
    except Exception as e:
        # Log full traceback to console
        print("Exception in /chat:", str(e))
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

