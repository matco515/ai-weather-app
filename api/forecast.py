from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import urllib.parse

def get_forecast(city, days=7):
    """Get weather forecast for a city"""
    # Geocode the city
    geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(city)}&count=1&language=en&format=json"
    
    with urllib.request.urlopen(geo_url) as response:
        geo_data = json.loads(response.read().decode())
    
    if not geo_data.get('results'):
        return {"error": f"City '{city}' not found"}
    
    location = geo_data['results'][0]
    lat, lon = location['latitude'], location['longitude']
    
    # Get forecast data
    forecast_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days={days}"
    
    with urllib.request.urlopen(forecast_url) as response:
        forecast_data = json.loads(response.read().decode())
    
    daily = forecast_data.get('daily', {})
    hourly = forecast_data.get('hourly', {})
    
    weather_codes = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Foggy", 48: "Depositing rime fog",
        51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
        61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
        71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
        80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
        95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
    }
    
    forecast = []
    dates = daily.get('time', [])
    
    for i, date in enumerate(dates[:days]):
        code = daily.get('weather_code', [0])[i] if i < len(daily.get('weather_code', [])) else 0
        forecast.append({
            "date": date,
            "condition": weather_codes.get(code, "Unknown"),
            "high": round(daily.get('temperature_2m_max', [0])[i]) if i < len(daily.get('temperature_2m_max', [])) else 0,
            "low": round(daily.get('temperature_2m_min', [0])[i]) if i < len(daily.get('temperature_2m_min', [])) else 0,
            "rain_chance": daily.get('precipitation_probability_max', [0])[i] if i < len(daily.get('precipitation_probability_max', [])) else 0,
            "sunrise": daily.get('sunrise', [''])[i] if i < len(daily.get('sunrise', [])) else '',
            "sunset": daily.get('sunset', [''])[i] if i < len(daily.get('sunset', [])) else ''
        })
    
    # Process hourly data (next 24 hours)
    hourly_forecast = []
    for i in range(min(24, len(hourly.get('time', [])))):
        code = hourly.get('weather_code', [0])[i] if i < len(hourly.get('weather_code', [])) else 0
        hourly_forecast.append({
            "time": hourly.get('time', [''])[i],
            "temperature": round(hourly.get('temperature_2m', [0])[i]) if i < len(hourly.get('temperature_2m', [])) else 0,
            "feels_like": round(hourly.get('apparent_temperature', [0])[i]) if i < len(hourly.get('apparent_temperature', [])) else 0,
            "humidity": hourly.get('relative_humidity_2m', [0])[i] if i < len(hourly.get('relative_humidity_2m', [])) else 0,
            "wind_speed": round(hourly.get('wind_speed_10m', [0])[i]) if i < len(hourly.get('wind_speed_10m', [])) else 0,
            "rain_chance": hourly.get('precipitation_probability', [0])[i] if i < len(hourly.get('precipitation_probability', [])) else 0,
            "condition": weather_codes.get(code, "Unknown")
        })
    
    return {
        "city": location['name'],
        "country": location.get('country', ''),
        "forecast": forecast,
        "hourly": hourly_forecast
    }

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path
        city = 'Miami'
        days = 7
        
        if '?' in path:
            query_string = path.split('?')[1]
            params = urllib.parse.parse_qs(query_string)
            city = params.get('city', ['Miami'])[0]
            days = int(params.get('days', ['7'])[0])
        else:
            parts = path.split('/')
            city = parts[-1] if len(parts) > 2 else 'Miami'
        
        try:
            result = get_forecast(city, days)
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
