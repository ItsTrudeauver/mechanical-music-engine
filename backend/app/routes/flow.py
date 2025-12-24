from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.routes.session import SESSIONS # Import the in-memory store
from app.modules.sieve import SieveEngine
from app.modules.ingestion import MusicIngester

router = APIRouter()

class AnswerRequest(BaseModel):
    session_id: str
    question_id: str
    answer: bool # True = Yes, False = No

@router.post("/answer")
async def submit_answer(payload: AnswerRequest):
    """
    1. Retrieves session.
    2. Filters candidates based on answer.
    3. Decides: Reveal song OR Ask next question.
    """
    # 1. Retrieve Session
    session = SESSIONS.get(payload.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    # 2. Filter Candidates
    sieve = SieveEngine()
    
    # Update the pool based on the user's answer
    session.candidates = sieve.filter_candidates(
        session.candidates, 
        payload.question_id, 
        payload.answer
    )
    
    # Record that we asked this
    session.asked_questions.append(payload.question_id)
    session.current_step += 1
    
    # 3. Check for End Condition
    # If 1 track left, OR pool is small enough (<= 3), OR too many questions asked
    remaining = len(session.candidates)
    
    if remaining <= 1 or session.current_step >= 20:
        # END GAME: REVEAL
        
        # If we filtered everyone out (0 candidates), we need a fallback.
        # Fallback: Just grab a recommendation from the last known track, or error out.
        if remaining == 0:
             raise HTTPException(status_code=404, detail="No tracks match your criteria.")
        
        # Pick the top survivor
        winner = session.candidates[0]
        session.status = "reveal"
        session.final_track = winner
        
        return {
            "status": "reveal",
            "track": winner,
            "remaining_candidates": remaining
        }
        
    else:
        # CONTINUE GAME: NEXT QUESTION
        next_q = sieve.get_next_question(session.candidates, session.asked_questions)
        
        # If no good questions remain (entropy exhaustion), force reveal early
        if not next_q:
            winner = session.candidates[0]
            session.status = "reveal"
            return {
                "status": "reveal",
                "track": winner
            }
            
        return {
            "status": "active",
            "remaining_candidates": remaining,
            "question": next_q
        }