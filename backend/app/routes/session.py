from fastapi import APIRouter, HTTPException
from uuid import uuid4
from pydantic import BaseModel

from app.models import Session, Track
from app.modules.ingestion import MusicIngester
from app.modules.sieve import SieveEngine

router = APIRouter()

# IN-MEMORY STORE (Global Dictionary)
# Maps session_id -> Session Object
SESSIONS = {} 

class StartRequest(BaseModel):
    query: str = "Japanese City Pop" # Default seed

@router.post("/start")
async def start_session(payload: StartRequest):
    """
    1. Fetches tracks from YT Music.
    2. Initializes the Sieve Engine.
    3. Returns the first question.
    """
    # 1. Ingest Data
    ingester = MusicIngester()
    tracks = ingester.fetch_candidates(payload.query, limit=100)
    
    if not tracks:
        raise HTTPException(status_code=404, detail="No tracks found for this seed.")

    # 2. Create Session
    session_id = str(uuid4())
    new_session = Session(
        session_id=session_id,
        candidates=tracks,
        asked_questions=[]
    )
    
    # 3. Get First Question
    sieve = SieveEngine()
    first_question = sieve.get_next_question(tracks, [])
    
    # Save to memory
    SESSIONS[session_id] = new_session
    
    # Return to Frontend
    return {
        "session_id": session_id,
        "total_candidates": len(tracks),
        "question": first_question
    }