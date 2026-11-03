// EEP_Zip.js
// Liefert bei einer zip-Datei die enthaltene .anl3-Datei als File, sonst die Datei unverändert
"use strict";
/* global
	EEP_Texts:readonly
*/
/* Interface
public api:
	EEP_Zip.resolve
	EEP_Zip.setStatus
	EEP_Zip.describeError
*/

(function(api) {
api.setStatus = setStatus;
api.describeError = describeError;
api.resolve = resolve;

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
	const T = (key, ...args) => EEP_Texts.getText("err", key, ...args);
	const msg = (err && err.message) ? err.message : String(err);

	const http = /^HTTP (\d+)/.exec(msg);
	if (http) {
		const c = http[1];
		const key = (c == 404) ? "http404" : (c == 403 || c == 401) ? "http403" : "http";
		return T("prefix") + ": " + T(key, c);
	}

	// fetch liefert bei Netzwerk-, CORS- und Mixed-Content-Problemen nur eine TypeError ohne Details
	if (err instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(msg)) {
		if (typeof navigator !== "undefined" && navigator.onLine === false) { return T("prefix") + ": " + T("offline"); }
		let abs = null;
		try { abs = new URL(url, document.baseURI); } catch (e) {}
		if (abs && location.protocol === "https:" && abs.protocol === "http:") { return T("prefix") + ": " + T("mixed"); }
		if (location.protocol === "file:") { return T("prefix") + ": " + T("file"); }
		return T("prefix") + ": " + T("net");
	}

	return T("prefix") + ": " + msg;	// z.B. Fehler beim Entpacken der zip-Datei
}

})(window.EEP_Zip = window.EEP_Zip || {}); // end module