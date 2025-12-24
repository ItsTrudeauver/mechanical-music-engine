from typing import List, Optional, Any, Literal
from pydantic import BaseModel, Field

# -----------------------------------------------------------------------------
# 1. THE ATOM: A Single Track
# -----------------------------------------------------------------------------
class Track(BaseModel):
    # Raw Metadata (from ytmusicapi)
    id: str                 # Video ID
    title: str
    artist: str
    album: Optional[str] = None
    thumbnail_url: str
    
    # Normalized Data (for Mechanical Filtering)
    duration_seconds: int = 0
    views_total: int = 0
    year: Optional[int] = None
    is_explicit: bool = False
    
    # Heuristic Tags (Filled by Normalizer)
    # e.g., ["slow", "instrumental", "live"]
    tags: List[str] = []

# -----------------------------------------------------------------------------
# 2. THE FILTER: A Mechanical Question
# -----------------------------------------------------------------------------
class Question(BaseModel):
    id: str
    text: str               # "Is the song longer than 4 minutes?"
    
    # Logic Mapping
    attribute: str          # Must match a field in Track (e.g., "duration_seconds")
    operator: Literal[">", "<", "==", "contains"] 
    value: Any              # The threshold (e.g., 240, "Live")
    
    # UI Hint (Tells frontend how to render)
    ui_type: Literal["binary", "slider", "keyword"] = "binary"

# -----------------------------------------------------------------------------
# 3. THE STATE: User Session
# -----------------------------------------------------------------------------
class Session(BaseModel):
    session_id: str
    candidates: List[Track]        # The pool of songs remaining
    asked_questions: List[str]     # IDs of questions already asked
    current_step: int = 0
    status: Literal["active", "reveal", "dead_end"] = "active"
    
    # If status == 'reveal', this is populated
    final_track: Optional[Track] = None