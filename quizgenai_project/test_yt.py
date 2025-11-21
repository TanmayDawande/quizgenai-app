import youtube_transcript_api
from youtube_transcript_api import YouTubeTranscriptApi
print(f"Module file: {youtube_transcript_api.__file__}")
print(f"Class: {YouTubeTranscriptApi}")
import inspect
print(inspect.getsource(YouTubeTranscriptApi))
try:
    print(YouTubeTranscriptApi.get_transcript)
except AttributeError as e:
    print(e)

from youtube_transcript_api import YouTubeTranscriptApi

try:
    # Try the instance method approach
    api = YouTubeTranscriptApi()
    # Use a known video ID (e.g., a short one)
    # This might fail if network is restricted, but we just want to see if the method exists and runs
    print("Instance created.")
    if hasattr(api, 'fetch'):
        print("Has fetch method.")
    else:
        print("No fetch method.")
except Exception as e:
    print(e)
