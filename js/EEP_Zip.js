// EEP_Zip.js
// Liefert bei einer zip-Datei die enthaltene .anl3-Datei als File, sonst die Datei unverändert
"use strict";
/* global
	EEP_Texts:readonly
*/
/* Interface
public api:
	EEP_Zip.resolve
*/

(function(api) {

// Liefert true, wenn die Datei ein ZIP-Archiv ist (Signatur am Anfang)
function isZipSignature(b) {
	return (
		b.length >= 4 && b[0] === 0x50 && b[1] === 0x4B
		&& (   (b[2] === 0x03 && b[3] === 0x04)
			|| (b[2] === 0x05 && b[3] === 0x06)
			|| (b[2] === 0x07 && b[3] === 0x08))
	);
}

// Liefert die Dekomprimierung der Daten im "deflate-raw"-Format als Blob
async function inflateRaw(data) {
	if (typeof DecompressionStream !== "function") {
		throw new Error("DecompressionStream wird von diesem Browser nicht unterstützt");
	}
	const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
	return await new Response(stream).blob();
}

// Liefert bei einer zip-Datei die enthaltene .anl3-Datei als File, sonst die Datei unverändert
async function resolve(file) {
	if (!file) { return file; }
	// Erkennung am Inhalt, damit auch URLs ohne ".zip" funktionieren
	const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
	if (!isZipSignature(head)) { return file; }

	// ZIP-Datei: Verzeichnis durchsuchen, die erste .anl3-Datei extrahieren
	const buf = await file.arrayBuffer();
	const view = new DataView(buf), u8 = new Uint8Array(buf), dec = new TextDecoder("utf-8");

	let eocd = -1;	// End of central directory
	for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 22 - 65535); i--) {
		if (view.getUint32(i, true) === 0x06054B50) { eocd = i; break; }
	}
	if (eocd < 0) { throw new Error("Ungültige zip-Datei"); }
	const count = view.getUint16(eocd + 10, true);
	let offset  = view.getUint32(eocd + 16, true);
	if (count === 0xFFFF || offset === 0xFFFFFFFF) { throw new Error("zip64 wird nicht unterstützt"); }

	let found = null;
	for (let n = 0; n < count; n++) {
		// Verzeichnis-Eintrag: 46 Byte + Name + Extra + Kommentar
		if (view.getUint32(offset, true) !== 0x02014B50) { throw new Error("Ungültiges zip-Verzeichnis"); }
		const flags      = view.getUint16(offset + 8, true);
		const method     = view.getUint16(offset + 10, true);
		const compSize   = view.getUint32(offset + 20, true);
		const nameLen    = view.getUint16(offset + 28, true);
		const extraLen   = view.getUint16(offset + 30, true);
		const commentLen = view.getUint16(offset + 32, true);
		const localPos   = view.getUint32(offset + 42, true);
		const name       = dec.decode(u8.subarray(offset + 46, offset + 46 + nameLen));
		offset += 46 + nameLen + extraLen + commentLen;

		const base = name.substring(name.lastIndexOf("/") + 1);	// auch Dateien in Verzeichnissen
		if (/\.anl3$/i.test(name) && !name.startsWith("__MACOSX/") && !base.startsWith("._")) {
			found = { base, flags, method, compSize, localPos };
			break;	// es gibt nur eine anl3-Datei
		}
	}
	if (!found) { throw new Error("Keine .anl3-Datei in der zip-Datei gefunden"); }
	if (found.flags & 1) { throw new Error("Verschlüsselte zip-Dateien werden nicht unterstützt"); }
	if (found.compSize === 0xFFFFFFFF) { throw new Error("zip64 wird nicht unterstützt"); }

	// Lokaler Datei-Eintrag: 30 Byte + Name + Extra + Daten
	if (view.getUint32(found.localPos, true) !== 0x04034B50) { throw new Error("Ungültiger zip-Eintrag"); }
	const start = found.localPos + 30
				+ view.getUint16(found.localPos + 26, true)
				+ view.getUint16(found.localPos + 28, true);
	const data = u8.subarray(start, start + found.compSize);

	// Dekomprimieren, falls nötig
	let blob;
	if      (found.method === 0) { blob = new Blob([data]); }
	else if (found.method === 8) { blob = await inflateRaw(data); }
	else { throw new Error("Nicht unterstützte zip-Komprimierung: " + found.method); }

	return new File([blob], found.base);	// Name der anl3-Datei (für Anzeige und Export)
}

// Statuszeile (urlStatus) setzen; Fehler werden rot angezeigt
function setStatus(text, isError) {
	const status = document.getElementById("urlStatus");
	if (!status) { return; }
	status.textContent = text;
	status.style.color = isError ? "red" : "";
}

// Aussagekräftiger Text zu einem Fehler beim Laden einer URL oder Datei
function describeError(err, url) {
	let lang = "DE";
	try { lang = String(EEP_Texts.getLanguage()).toUpperCase(); } catch (e) {}
	if (lang !== "EN" && lang !== "FR") { lang = "DE"; }

	const T = {
		DE: {
			prefix:  "Fehler",
			http:    (c) => "Der Server antwortete mit HTTP " + c + (c == 404 ? " (Datei nicht gefunden)" : c == 403 || c == 401 ? " (Zugriff verweigert)" : "") + ".",
			offline: "Es besteht keine Internetverbindung.",
			mixed:   "Eine http-URL kann nicht von einer https-Seite geladen werden (Mixed Content). Verwende eine https-URL.",
			file:    "Die URL konnte nicht geladen werden. Da das Programm direkt als Datei (file://) geöffnet wurde, blockiert der Browser den Zugriff, wenn der Server CORS nicht erlaubt (Access-Control-Allow-Origin). Lade die Datei herunter und wähle sie aus, oder öffne das Programm über einen Webserver.",
			net:     "Die URL konnte nicht geladen werden: Der Server ist nicht erreichbar, die URL ist falsch, oder der Server erlaubt keinen Zugriff von dieser Seite aus (CORS).",
		},
		EN: {
			prefix:  "Error",
			http:    (c) => "The server answered with HTTP " + c + (c == 404 ? " (file not found)" : c == 403 || c == 401 ? " (access denied)" : "") + ".",
			offline: "There is no internet connection.",
			mixed:   "An http URL cannot be loaded from an https page (mixed content). Use an https URL.",
			file:    "The URL could not be loaded. Because the program was opened directly as a file (file://), the browser blocks access unless the server allows CORS (Access-Control-Allow-Origin). Download the file and select it, or open the program via a web server.",
			net:     "The URL could not be loaded: the server is unreachable, the URL is wrong, or the server does not allow access from this page (CORS).",
		},
		FR: {
			prefix:  "Erreur",
			http:    (c) => "Le serveur a répondu avec HTTP " + c + (c == 404 ? " (fichier introuvable)" : c == 403 || c == 401 ? " (accès refusé)" : "") + ".",
			offline: "Il n'y a pas de connexion Internet.",
			mixed:   "Une URL http ne peut pas être chargée depuis une page https (contenu mixte). Utilisez une URL https.",
			file:    "L'URL n'a pas pu être chargée. Le programme ayant été ouvert directement comme fichier (file://), le navigateur bloque l'accès si le serveur n'autorise pas CORS (Access-Control-Allow-Origin). Téléchargez le fichier et sélectionnez-le, ou ouvrez le programme via un serveur web.",
			net:     "L'URL n'a pas pu être chargée : serveur inaccessible, URL incorrecte, ou le serveur n'autorise pas l'accès depuis cette page (CORS).",
		},
	}[lang];

	const msg = (err && err.message) ? err.message : String(err);

	const http = /^HTTP (\d+)/.exec(msg);
	if (http) { return T.prefix + ": " + T.http(http[1]); }

	// fetch liefert bei Netzwerk-, CORS- und Mixed-Content-Problemen nur eine TypeError ohne Details
	if (err instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(msg)) {
		if (typeof navigator !== "undefined" && navigator.onLine === false) { return T.prefix + ": " + T.offline; }
		let abs = null;
		try { abs = new URL(url, document.baseURI); } catch (e) {}
		if (abs && location.protocol === "https:" && abs.protocol === "http:") { return T.prefix + ": " + T.mixed; }
		if (location.protocol === "file:") { return T.prefix + ": " + T.file; }
		return T.prefix + ": " + T.net;
	}

	return T.prefix + ": " + msg;	// z.B. Fehler beim Entpacken der zip-Datei
}

api.setStatus = setStatus;
api.describeError = describeError;
api.resolve = resolve;
})(window.EEP_Zip = window.EEP_Zip || {}); // end module