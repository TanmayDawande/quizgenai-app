from youtube_transcript_api import YouTubeTranscriptApi

try:
    # Rick Roll video ID
    video_id = "dQw4w9WgXcQ" 
    print(f"Fetching transcript for {video_id}...")
    
    # This matches the code in services.py
    transcript_list = YouTubeTranscriptApi().fetch(video_id)
    
    print(f"Type of transcript_list: {type(transcript_list)}")
    
    if transcript_list:
        first_item = transcript_list[0]
        print(f"Type of first item: {type(first_item)}")
        print(f"First item content: {first_item}")
        
        try:
            print(f"Trying item['text']: {first_item['text']}")
        except Exception as e:
            print(f"Error accessing item['text']: {e}")
            
        try:
            print(f"Trying item.text: {first_item.text}")
        except Exception as e:
            print(f"Error accessing item.text: {e}")
            
except Exception as e:
    print(f"Global Error: {e}")
