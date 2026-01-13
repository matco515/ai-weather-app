from http.server import BaseHTTPRequestHandler
import json
import urllib.request
import urllib.parse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path
        query = ''
        
        if '?' in path:
            query_string = path.split('?')[1]
            params = urllib.parse.parse_qs(query_string)
            query = params.get('query', [''])[0]
        
        if not query or len(query) < 2:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"suggestions": []}).encode())
            return
        
        try:
            url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(query)}&count=5&language=en&format=json"
            
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode())
            
            suggestions = []
            for result in data.get('results', []):
                suggestions.append({
                    "name": result.get('name', ''),
                    "country": result.get('country', ''),
                    "admin1": result.get('admin1', ''),
                    "latitude": result.get('latitude'),
                    "longitude": result.get('longitude')
                })
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"suggestions": suggestions}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
