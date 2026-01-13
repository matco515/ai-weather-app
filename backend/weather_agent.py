"""
Weather Agent using Strands Agents + Amazon Bedrock
Real weather data from Open-Meteo API (free, no API key needed)
"""
from strands import Agent, tool
from strands.models import BedrockModel
import httpx
import json
from datetime import datetime

# Weather code descriptions
WEATHER_CODES = {
    0: "Clear sky ☀️",
    1: "Mainly clear 🌤️",
    2: "Partly cloudy ⛅",
    3: "Overcast ☁️",
    45: "Foggy 🌫️",
    48: "Depositing rime fog 🌫️",
    51: "Light drizzle 🌧️",
    53: "Moderate drizzle 🌧️",
    55: "Dense drizzle 🌧️",
    61: "Slight rain 🌧️",
    63: "Moderate rain 🌧️",
    65: "Heavy rain 🌧️",
    71: "Slight snow 🌨️",
    73: "Moderate snow 🌨️",
    75: "Heavy snow 🌨️",
    80: "Slight rain showers 🌦️",
    81: "Moderate rain showers 🌦️",
    82: "Violent rain showers ⛈️",
    95: "Thunderstorm ⛈️",
    96: "Thunderstorm with slight hail ⛈️",
    99: "Thunderstorm with heavy hail ⛈️",
}


@tool
def get_weather(city: str) -> str:
    """
    Get the current weather for a city.
    
    Args:
        city: The name of the city to get weather for (e.g., "Miami", "New York", "London")
    
    Returns:
        Current weather information including temperature, conditions, humidity, and wind speed
    """
    try:
        # First, geocode the city to get coordinates
        geocode_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json"
        
        with httpx.Client() as client:
            geo_response = client.get(geocode_url, timeout=10)
            geo_data = geo_response.json()
            
            if "results" not in geo_data or len(geo_data["results"]) == 0:
                return f"Sorry, I couldn't find the city '{city}'. Please check the spelling and try again."
            
            location = geo_data["results"][0]
            lat = location["latitude"]
            lon = location["longitude"]
            city_name = location["name"]
            country = location.get("country", "")
            
            # Get current weather
            weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&temperature_unit=fahrenheit&wind_speed_unit=mph"
            
            weather_response = client.get(weather_url, timeout=10)
            weather_data = weather_response.json()
            
            current = weather_data["current"]
            
            weather_code = current["weather_code"]
            condition = WEATHER_CODES.get(weather_code, "Unknown")
            
            result = {
                "city": city_name,
                "country": country,
                "latitude": lat,
                "longitude": lon,
                "temperature_f": current["temperature_2m"],
                "feels_like_f": current["apparent_temperature"],
                "humidity": current["relative_humidity_2m"],
                "wind_speed_mph": current["wind_speed_10m"],
                "condition": condition,
                "timestamp": datetime.now().isoformat()
            }
            
            return json.dumps(result, indent=2)
            
    except Exception as e:
        return f"Error fetching weather data: {str(e)}"


@tool
def get_forecast(city: str, days: int = 3) -> str:
    """
    Get the weather forecast for a city.
    
    Args:
        city: The name of the city to get forecast for
        days: Number of days to forecast (1-7, default 3)
    
    Returns:
        Weather forecast for the specified number of days
    """
    try:
        days = min(max(days, 1), 7)  # Clamp between 1-7
        
        # Geocode the city
        geocode_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json"
        
        with httpx.Client() as client:
            geo_response = client.get(geocode_url, timeout=10)
            geo_data = geo_response.json()
            
            if "results" not in geo_data or len(geo_data["results"]) == 0:
                return f"Sorry, I couldn't find the city '{city}'."
            
            location = geo_data["results"][0]
            lat = location["latitude"]
            lon = location["longitude"]
            city_name = location["name"]
            timezone = location.get("timezone", "UTC")
            
            # Get forecast with hourly data
            weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,sunrise,sunset&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,apparent_temperature&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days={days}&timezone={timezone}"
            
            weather_response = client.get(weather_url, timeout=10)
            weather_data = weather_response.json()
            
            daily = weather_data["daily"]
            hourly = weather_data.get("hourly", {})
            forecast = []
            
            for i in range(len(daily["time"])):
                weather_code = daily["weather_code"][i]
                
                # Get hourly data for this day (24 hours per day)
                start_idx = i * 24
                end_idx = start_idx + 24
                
                day_hourly = []
                if hourly.get("time"):
                    for h in range(start_idx, min(end_idx, len(hourly["time"]))):
                        hour_time = hourly["time"][h]
                        hour_code = hourly["weather_code"][h] if hourly.get("weather_code") else 0
                        day_hourly.append({
                            "time": hour_time,
                            "temp_f": hourly["temperature_2m"][h] if hourly.get("temperature_2m") else None,
                            "feels_like_f": hourly["apparent_temperature"][h] if hourly.get("apparent_temperature") else None,
                            "humidity": hourly["relative_humidity_2m"][h] if hourly.get("relative_humidity_2m") else None,
                            "rain_chance": hourly["precipitation_probability"][h] if hourly.get("precipitation_probability") else 0,
                            "wind_mph": hourly["wind_speed_10m"][h] if hourly.get("wind_speed_10m") else None,
                            "condition": WEATHER_CODES.get(hour_code, "Unknown"),
                        })
                
                forecast.append({
                    "date": daily["time"][i],
                    "high_f": daily["temperature_2m_max"][i],
                    "low_f": daily["temperature_2m_min"][i],
                    "condition": WEATHER_CODES.get(weather_code, "Unknown"),
                    "precipitation_chance": daily["precipitation_probability_max"][i],
                    "sunrise": daily["sunrise"][i] if daily.get("sunrise") else None,
                    "sunset": daily["sunset"][i] if daily.get("sunset") else None,
                    "hourly": day_hourly
                })
            
            result = {
                "city": city_name,
                "timezone": timezone,
                "forecast": forecast
            }
            
            return json.dumps(result, indent=2)
            
    except Exception as e:
        return f"Error fetching forecast: {str(e)}"


def create_weather_agent():
    """Create and return the weather agent with Bedrock model"""
    model = BedrockModel(
        model_id="us.anthropic.claude-3-5-haiku-20241022-v1:0",
        region_name="us-west-2"
    )
    
    agent = Agent(
        model=model,
        tools=[get_weather, get_forecast],
        system_prompt="""You are a friendly and helpful weather assistant. You can:
1. Get current weather for any city using the get_weather tool
2. Get weather forecasts using the get_forecast tool

When users ask about weather, always use the appropriate tool to get real data.
Present the information in a friendly, conversational way with relevant emojis.
If the data includes JSON, parse it and present it nicely.

Always mention that the data is live from your weather service to confirm the connection is working."""
    )
    
    return agent


# Test the agent if run directly
if __name__ == "__main__":
    print("🔄 Testing Bedrock connection...")
    agent = create_weather_agent()
    response = agent("What's the weather in Miami?")
    print(response)
