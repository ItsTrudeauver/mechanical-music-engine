from typing import List, Optional
from app.models import Track, Question

class SieveEngine:
    def __init__(self):
        # ---------------------------------------------------------
        # THE MECHANICAL QUESTION BANK
        # ---------------------------------------------------------
        self.question_pool = [
            # DURATION FILTERS
            Question(id="dur_short", text="Is the song shorter than 3 minutes?", attribute="duration_seconds", operator="<", value=180, ui_type="binary"),
            Question(id="dur_long", text="Is the song longer than 5 minutes?", attribute="duration_seconds", operator=">", value=300, ui_type="binary"),
            
            # POPULARITY FILTERS (Proxies for "Mainstream" vs "Underground")
            Question(id="view_huge", text="Does it have over 10 million views?", attribute="views_total", operator=">", value=10000000, ui_type="binary"),
            Question(id="view_tiny", text="Is it relatively unknown (< 100k views)?", attribute="views_total", operator="<", value=100000, ui_type="binary"),
            
            # CONTENT FILTERS
            Question(id="explicit", text="Is the song marked as Explicit?", attribute="is_explicit", operator="==", value=True, ui_type="binary"),
            
            # KEYWORD / TAG FILTERS
            Question(id="tag_live", text="Is this a Live performance?", attribute="tags", operator="contains", value="live", ui_type="binary"),
            Question(id="tag_inst", text="Is it an Instrumental track?", attribute="tags", operator="contains", value="instrumental", ui_type="binary"),
            Question(id="tag_remix", text="Is it a Remix?", attribute="tags", operator="contains", value="remix", ui_type="binary"),
            
            # META FILTERS (Title/Artist text checks)
            Question(id="feat_artist", text="Does it feature another artist (feat.)?", attribute="title", operator="contains", value="feat", ui_type="binary"),
            Question(id="official_vid", text="Is it an Official Music Video?", attribute="title", operator="contains", value="official", ui_type="binary"),
        ]

    def get_next_question(self, candidates: List[Track], asked_ids: List[str]) -> Optional[Question]:
        """
        Selects the question that best divides the current pool (closest to 50/50 split).
        """
        best_question = None
        best_split_score = 1.0  # We want this closer to 0 (perfect 0.5 split)
        
        current_count = len(candidates)
        
        # If pool is small enough, stop asking and guess
        if current_count <= 1:
            return None 

        for q in self.question_pool:
            if q.id in asked_ids:
                continue

            # Simulate the filter
            match_count = sum(1 for t in candidates if self._check_condition(t, q))
            
            # If a question filters NOTHING or EVERYTHING, it's useless. Skip it.
            if match_count == 0 or match_count == current_count:
                continue

            # Calculate Entropy Score (Distance from 0.5)
            ratio = match_count / current_count
            split_score = abs(0.5 - ratio)

            if split_score < best_split_score:
                best_split_score = split_score
                best_question = q

        return best_question

    def filter_candidates(self, candidates: List[Track], question_id: str, answer: bool) -> List[Track]:
        """
        Returns a new list of tracks that adhere to the user's answer.
        """
        # Find the question definition
        q = next((x for x in self.question_pool if x.id == question_id), None)
        if not q:
            return candidates

        # Logic: 
        # If Answer is TRUE, keep tracks that MATCH the condition.
        # If Answer is FALSE, keep tracks that DO NOT MATCH.
        kept_tracks = []
        for t in candidates:
            matches_condition = self._check_condition(t, q)
            if matches_condition == answer:
                kept_tracks.append(t)
                
        return kept_tracks

    def _check_condition(self, track: Track, q: Question) -> bool:
        """
        Deterministic logic router.
        """
        # Get value from track (e.g., track.duration_seconds)
        track_val = getattr(track, q.attribute, None)
        
        if track_val is None:
            return False

        # Handle operators
        if q.operator == ">":
            return track_val > q.value
        elif q.operator == "<":
            return track_val < q.value
        elif q.operator == "==":
            return track_val == q.value
        
        # Handle "contains" (works for strings and lists of strings)
        elif q.operator == "contains":
            val_to_check = str(q.value).lower()
            if isinstance(track_val, list):
                # Check if tag exists in list
                return any(val_to_check in str(x).lower() for x in track_val)
            else:
                # Check substring
                return val_to_check in str(track_val).lower()
        
        return False