const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const ALLOWED_ORIGIN = 'https://frankbuchholz.github.io';
const ALLOWED_EXTENSIONS = ['.json', '.anl3'];

http.createServer((req, res) => {
    // CORS Header setzen, falls Origin passt
    const origin = req.headers.origin;
    if (origin && origin.startsWith(ALLOWED_ORIGIN)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Pfad bereinigen und prüfen
    const safePath = path.normalize(decodeURIComponent(req.url)).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(process.cwd(), safePath);
    const ext = path.extname(filePath).toLowerCase();

    // Dateiendung prüfen
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        res.statusCode = 403;
        res.end('Access Denied: Only .json and .anl3 files are allowed.');
        return;
    }

    // Datei ausliefern
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            res.end('File not found.');
        } else {
            res.end(data);
        }
    });
// Wenn Aufrufe nur von localhost erlaubt sein sollen, dann hier die Variante mit 127.0.0.1 statt 0.0.0.0 verwenden
//}).listen(PORT, '127.0.0.1', () => { console.log(`Sicherer Node-Server läuft auf http://localhost:${PORT}`); });
}).listen(PORT, '0.0.0.0', () => { console.log(`Sicherer Node-Server im Netzwerk geöffnet auf Port ${PORT}`); });