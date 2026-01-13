from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import urllib.parse

def get_weather(city):
    """Get current weather for a city using Open-Meteo API"""
    # First, geocode the city
    geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(city)}&count=1&language=en&format=json"
    
    with urllib.request.urlopen(geo_url) as response:
        geo_data = json.loads(response.read().decode())
    
    if not geo_data.get('results'):
        return {"error": f"City '{city}' not found"}
    
    location = geo_data['results'][0]
    lat, lon = location['latitude'], location['longitude']
    
    # Get weather data
    weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto"
    
    with urllib.request.urlopen(weather_url) as response:
        weather_data = json.loads(response.read().decode())
    
    current = weather_data.get('current', {})
    
    # Map weather codes to conditions
    weather_codes = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Foggy", 48: "Depositing rime fog",
        51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
        61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
        71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
        80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
        95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
    }
    
    code = current.get('weather_code', 0)
    condition = weather_codes.get(code, "Unknown")
    
    return {
        "city": location['name'],
        "country": location.get('country', ''),
        "temperature": round(current.get('temperature_2m', 0)),
        "humidity": current.get('relative_humidity_2m', 0),
        "feels_like": round(current.get('apparent_temperature', 0)),
        "wind_speed": round(current.get('wind_speed_10m', 0)),
        "condition": condition,
        "latitude": lat,
        "longitude": lon
    }

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse query parameters
        path = self.path
        if '?' in path:
            query_string = path.split('?')[1]
            params = urllib.parse.parse_qs(query_string)
            city = params.get('city', ['Miami'])[0]
        else:
            # Extract city from path like /api/weather/Miami
            parts = path.split('/')
            city = parts[-1] if len(parts) > 2 else 'Miami'
        
        try:
            result = get_weather(city)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
