"""
FastAPI Backend for Weather Agent
Connects Strands Agent with Bedrock to the frontend
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import boto3
from datetime import datetime

from weather_agent import create_weather_agent, get_weather

app = FastAPI(title="AI Weather Assistant", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agent (lazy loading)
_agent = None

def get_agent():
    global _agent
    if _agent is None:
        _agent = create_weather_agent()
    return _agent


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    timestamp: str
    bedrock_connected: bool


class HealthResponse(BaseModel):
    status: str
    bedrock_connected: bool
    region: str
    model: str
    timestamp: str


@app.get("/")
def root():
    return {"message": "AI Weather Assistant API", "docs": "/docs"}


@app.get("/health", response_model=HealthResponse)
def health_check():
    """Check if the backend and Bedrock are connected"""
    bedrock_connected = False
    
    try:
        # Test Bedrock connection
        sts = boto3.client('sts')
        identity = sts.get_caller_identity()
        bedrock_connected = True
    except Exception as e:
        print(f"Bedrock connection error: {e}")
    
    return HealthResponse(
        status="healthy",
        bedrock_connected=bedrock_connected,
        region="us-west-2",
        model="Claude 3.5 Haiku",
        timestamp=datetime.now().isoformat()
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message to the weather agent"""
    try:
        agent = get_agent()
        
        # Get response from agent
        result = agent(request.message)
        
        # Extract text from response
        if hasattr(result, 'message') and 'content' in result.message:
            response_text = result.message['content'][0]['text']
        else:
            response_text = str(result)
        
        return ChatResponse(
            response=response_text,
            timestamp=datetime.now().isoformat(),
            bedrock_connected=True
        )
        
    except Exception as e:
        print(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/weather/{city}")
async def get_city_weather_path(city: str):
    """Direct weather lookup without AI (for quick data) - path param version"""
    try:
        import json
        result = get_weather(city)
        return json.loads(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/weather")
async def get_city_weather(city: str = "Miami"):
    """Direct weather lookup without AI - query param version (for Vercel)"""
    try:
        import json
        result = get_weather(city)
        return json.loads(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/forecast/{city}")
async def get_city_forecast_path(city: str, days: int = 7):
    """Get weather forecast for a city - path param version"""
    try:
        import json
        from weather_agent import get_forecast
        result = get_forecast(city, days)
        return json.loads(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/forecast")
async def get_city_forecast(city: str = "Miami", days: int = 7):
    """Get weather forecast for a city - query param version (for Vercel)"""
    try:
        import json
        from weather_agent import get_forecast
        result = get_forecast(city, days)
        return json.loads(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/geocode")
async def geocode_city(query: str):
    """Search for cities by name - returns autocomplete suggestions"""
    try:
        import httpx
        
        # Use Open-Meteo's geocoding API (free, no key needed)
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={query}&count=5&language=en&format=json"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            data = response.json()
        
        if "results" not in data:
            return {"suggestions": []}
        
        suggestions = []
        for result in data["results"]:
            suggestions.append({
                "name": result.get("name", ""),
                "country": result.get("country", ""),
                "admin1": result.get("admin1", ""),  # State/Province
                "latitude": result.get("latitude"),
                "longitude": result.get("longitude"),
                "display": f"{result.get('name', '')}, {result.get('admin1', '')} {result.get('country', '')}".strip()
            })
        
        return {"suggestions": suggestions}
    except Exception as e:
        print(f"Geocoding error: {e}")
        return {"suggestions": []}


@app.get("/unsplash-photo/{city}")
async def get_unsplash_photo(city: str, weather: str = None, is_night: bool = False, api_key: str = None):
    """
    Get a weather-appropriate, location-specific photo from Unsplash API.
    Searches for photos of that city with the current weather/time context.
    
    Args:
        city: City name to search for
        weather: Weather condition (clear, cloudy, rain, snow, etc.)
        is_night: Whether it's nighttime
        api_key: Unsplash API access key
    
    Get your key at: https://unsplash.com/developers
    API docs: https://unsplash.com/documentation
    """
    import httpx
    import os
    
    # Get API key from query param or environment
    unsplash_key = api_key or os.environ.get("UNSPLASH_ACCESS_KEY")
    
    if not unsplash_key:
        return {"error": "Unsplash API key required", "photo_url": None}
    
    try:
        async with httpx.AsyncClient() as client:
            search_url = "https://api.unsplash.com/search/photos"
            headers = {
                "Authorization": f"Client-ID {unsplash_key}",
                "Accept-Version": "v1"
            }
            
            # Build weather-aware search query for the location
            weather_terms = {
                "clear": "sunny" if not is_night else "night skyline",
                "partlyCloudy": "cloudy sky" if not is_night else "night clouds",
                "snow": "winter snow",
                "rain": "rainy",
            }
            
            # Get weather term if applicable
            weather_term = weather_terms.get(weather, "")
            
            # Build the search query - prioritize location with weather context
            if is_night:
                query = f"{city} night city"
            elif weather_term:
                query = f"{city} {weather_term}"
            else:
                query = f"{city} city skyline"
            
            params = {
                "query": query,
                "per_page": 10,  # Get more options to find best match
                "orientation": "landscape",
                "content_filter": "high"
            }
            
            response = await client.get(search_url, headers=headers, params=params, timeout=10)
            data = response.json()
            
            # If no results with weather term, try just the city
            if "results" not in data or len(data["results"]) == 0:
                params["query"] = f"{city} city"
                response = await client.get(search_url, headers=headers, params=params, timeout=10)
                data = response.json()
            
            # Still no results? Try just the city name
            if "results" not in data or len(data["results"]) == 0:
                params["query"] = city
                response = await client.get(search_url, headers=headers, params=params, timeout=10)
                data = response.json()
                
                if "results" not in data or len(data["results"]) == 0:
                    return {"error": "No photos found for this location", "photo_url": None}
            
            # Pick the first result (most relevant)
            photo = data["results"][0]
            
            # Use the full size URL for better quality backgrounds
            photo_url = photo["urls"]["full"] + "&w=1920&q=80"
            
            return {
                "photo_url": photo_url,
                "width": photo.get("width"),
                "height": photo.get("height"),
                "description": photo.get("description") or photo.get("alt_description"),
                "location": photo.get("location", {}).get("name") if photo.get("location") else None,
                "search_query": query,  # Return what we searched for (debugging)
                "attribution": [{
                    "displayName": photo["user"]["name"],
                    "uri": photo["user"]["links"]["html"],
                    "photoUri": photo["user"]["profile_image"]["small"]
                }],
                "download_location": photo["links"]["download_location"],
                "source": "unsplash"
            }
            
    except Exception as e:
        print(f"Unsplash photo error: {e}")
        return {"error": str(e), "photo_url": None}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
