import re
from typing import Dict, Any, Optional
from app.models import Track

class Normalizer:
    @staticmethod
    def parse_duration(duration_str: str) -> int:
        """
        Converts 'MM:SS' or 'HH:MM:SS' strings to total seconds.
        Example: '3:45' -> 225
        """
        if not duration_str:
            return 0
            
        parts = duration_str.split(':')
        parts = [int(p) for p in parts]
        
        if len(parts) == 2: # MM:SS
            return parts[0] * 60 + parts[1]
        elif len(parts) == 3: # HH:MM:SS
            return parts[0] * 3600 + parts[1] * 60 + parts[2]
            
        return 0

    @staticmethod
    def parse_views(views_str: str) -> int:
        """
        Converts '1.2M', '500K', '100 views' to integers.
        """
        if not views_str:
            return 0
        
        # Remove " views" text and commas
        clean = views_str.lower().replace(' views', '').replace(',', '').strip()
        
        multiplier = 1
        if 'm' in clean:
            multiplier = 1_000_000
            clean = clean.replace('m', '')
        elif 'k' in clean:
            multiplier = 1_000
            clean = clean.replace('k', '')
        elif 'b' in clean:
            multiplier = 1_000_000_000
            clean = clean.replace('b', '')
            
        try:
            return int(float(clean) * multiplier)
        except ValueError:
            return 0

    @staticmethod
    def sanitize_track(raw_data: Dict[str, Any]) -> Optional[Track]:
        """
        Maps raw ytmusicapi dictionary to our internal Track model.
        Returns None if critical data is missing.
        """
        try:
            # ytmusicapi structure varies, handle basic search result keys
            video_id = raw_data.get('videoId')
            if not video_id:
                return None

            title = raw_data.get('title', 'Unknown')
            artists_list = raw_data.get('artists', [])
            artist_name = artists_list[0]['name'] if artists_list else "Unknown"
            
            # Duration and Views often come as strings
            duration_raw = raw_data.get('duration', '0:00')
            views_raw = raw_data.get('views', '0') # Search results often miss exact view counts, beware
            
            # Create Normalized Track
            track = Track(
                id=video_id,
                title=title,
                artist=artist_name,
                album=raw_data.get('album', {}).get('name'),
                thumbnail_url=raw_data.get('thumbnails', [{}])[-1].get('url', ''), # Get largest
                
                # Computed Integers
                duration_seconds=Normalizer.parse_duration(duration_raw),
                views_total=Normalizer.parse_views(str(views_raw)),
                is_explicit=raw_data.get('isExplicit', False)
            )
            
            # Add basic keyword tags for the sieve later
            # (e.g. if title says "Instrumental", add tag)
            lower_title = title.lower()
            if "instrumental" in lower_title or "karaoke" in lower_title:
                track.tags.append("instrumental")
            if "live" in lower_title or "concert" in lower_title:
                track.tags.append("live")
            if "remix" in lower_title:
                track.tags.append("remix")
                
            return track
            
        except Exception as e:
            # If a track is malformed, just skip it rather than crashing
            print(f"Skipping malformed track: {e}")
            return None