from fastapi import FastAPI, Depends, HTTPException
from supabase import Client
from pydantic import BaseModel
from database import get_db

app = FastAPI(title="AirGuard Backend")

class ConversationCreate(BaseModel):
    title: str
    user_id: str | None = None # Optional for testing before Auth is complete

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

