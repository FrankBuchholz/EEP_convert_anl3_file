import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

class SecureEEPRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # b) Dateiendungen filtern: Nur .json und .anl3 erlauben
        filename = self.translate_path(self.path)
        _, ext = os.path.splitext(filename.lower())
        
        # Falls es ein Ordner-Request ist oder die Erweiterung nicht passt: blockieren
        if os.path.isdir(filename) or ext not in ['.json', '.anl3']:
            self.send_error(403, "Access Denied: Only .json and .anl3 files are allowed.")
            return
            
        super().do_GET()

    def end_headers(self):
        # a) CORS einschränken: Nur Anfragen von Ihrer GitHub-Page erlauben
        # Hinweis: Browser senden bei Fetch-Requests den 'Origin'-Header mit.
        origin = self.headers.get('Origin', '')
        if origin.startswith('https://frankbuchholz.github.io'):
            self.send_header('Access-Control-Allow-Origin', origin)
        else:
            # Falls kein Origin passt, wird CORS für andere Domains blockiert
            self.send_header('Access-Control-Allow-Origin', 'https://frankbuchholz.github.io')
            
        super().end_headers()

if __name__ == '__main__':
    print("Starte sicheren EEP-Lokalserver auf Port 8000...")
    print("Erlaubte Domain: https://frankbuchholz.github.io")
    print("Erlaubte Dateitypen: .json, .anl3")
    # Wenn Aufrufe nur von localhost erlaubt sein sollen, dann hier 127.0.0.1 statt 0.0.0.0 eintragen
    HTTPServer(('0.0.0.0', 8000), SecureEEPRequestHandler).serve_forever()