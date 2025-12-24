from ytmusicapi import YTMusic
from typing import List
from app.models import Track
from app.modules.normalizer import Normalizer

class MusicIngester:
    def __init__(self):
        # No auth needed for public search
        self.yt = YTMusic()

    def fetch_candidates(self, search_query: str, limit: int = 100) -> List[Track]:
        """
        Searches YT Music and returns a clean list of Track objects.
        """
        print(f"Ingesting: Searching for '{search_query}' (Limit: {limit})...")
        
        try:
            # "songs" filter ensures we don't get albums/playlists
            raw_results = self.yt.search(search_query, filter="songs", limit=limit)
            
            clean_tracks = []
            
            for result in raw_results:
                # resultType check is redundant with filter="songs" but safe
                if result.get('resultType') != 'song':
                    continue
                
                # Sanitize using the Normalizer we just wrote
                track = Normalizer.sanitize_track(result)
                
                if track:
                    clean_tracks.append(track)
            
            print(f"Ingestion complete. Found {len(clean_tracks)} valid tracks.")
            return clean_tracks

        except Exception as e:
            print(f"Ingestion Error: {e}")
            return []

    def get_recommendations(self, video_id: str) -> List[Track]:
        """
        Pivot: If the pool gets too small, grab 'Up Next' from a specific track.
        """
        try:
            watch_playlist = self.yt.get_watch_playlist(videoId=video_id, limit=50)
            raw_tracks = watch_playlist.get('tracks', [])
            
            clean_tracks = []
            for result in raw_tracks:
                track = Normalizer.sanitize_track(result)
                if track:
                    clean_tracks.append(track)
            
            return clean_tracks
            
        except Exception as e:
            print(f"Recommendation Error: {e}")
            return []