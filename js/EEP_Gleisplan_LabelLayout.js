// LabelLayout: Überlappende Texte (Signale, Weichen, Kontakte) mit minimaler Verschiebung entzerren
"use strict";
/* global
	global:readonly
*/
/* Interface
required standard objects:
	Map
	clearTimeout
	console
	document
	setTimeout
required global data:
	global (global.fontSize wird von changefontSize() in js/EEP_Gleisplan_MainScreen.js gesetzt)
public api:
	layoutLabels
	registerLabel
	resetLabels
	scheduleLabelLayout
	setLabelLayoutEnabled

Aufbau
	Teil 1: 2D-Transformationen (Zahlen und Arrays, kein DOM)
	Teil 2: layoutLabels() - reine Geometrie ohne Zugriff auf DOM oder global, einzeln testbar
	Teil 3: DOM-Anbindung (Texte registrieren, Layout anwenden, Hilfslinien zeichnen)

Verfahren
	Jeder Text wird als gedrehtes Rechteck (im Koordinatensystem des Textes) beschrieben.
	Texte ohne Überlappung bleiben unverändert. Die übrigen Texte werden nach Priorität sortiert
	(Kontakt > Signal > Weiche > Gleistexte, bei gleicher Priorität kürzere Texte zuerst);
	ein Text mit höherer Priorität behält seinen Platz. Die anderen
	werden auf den nächstgelegenen freien Platz verschoben (Suche auf einem Raster in Einheiten der
	Schriftgröße, sortiert nach Verschiebung). Anschließend werden Texte, soweit möglich, wieder
	näher an ihre ursprüngliche Position geschoben.
	Signal- und Kontakttexte wechseln nie die Seite des Gleises (Verschiebung nur entlang des Gleises
	oder vom Gleis weg). Weichen- und Gleistexte (GleisID, Kurventyp, Stil, Höhe) sind frei verschiebbar.
	Texte der Art "fixed" sind feste Hindernisse (zur Zeit nicht verwendet).
*/
(function(api) {
// public api
api.layoutLabels = layoutLabels;
api.registerLabel = registerLabel;
api.resetLabels = resetLabels;
api.scheduleLabelLayout = scheduleLabelLayout;
api.setLabelLayoutEnabled = setLabelLayoutEnabled;

// ---------------------------------------------------------------------------------------------
// Parameter
// ---------------------------------------------------------------------------------------------
const ASCENT        = 0.80;  // Höhe des Textes über der Grundlinie (in em)
const DESCENT       = 0.20;  // Höhe des Textes unter der Grundlinie (in em), Zeilenhöhe = ASCENT + DESCENT = 1em
const PADDING       = 0.06;  // Mindestabstand zwischen Texten (in em, je Text)
const STEP          = 0.25;  // Rasterweite der Kandidaten (in em)
const RADIUS_X      = 8;     // maximale Verschiebung in Textrichtung (in em)
const RADIUS_Y      = 6;     // maximale Verschiebung quer zum Text (in em)
const SLACK         = 1.5;   // Ein Platz, der keinen anderen Text stört, darf bis zu so viel (em) weiter weg liegen
const FALLBACK_MAX  = 600;   // Anzahl der Kandidaten für den Notfall (kein freier Platz gefunden)
const REFINE_PASSES = 2;     // Durchgänge, um Texte wieder näher an den Ursprung zu holen
const LEADER_MIN    = 1.0;   // Hilfslinie ab dieser Verschiebung (in em = eine Zeilenhöhe)
const LEADER_GAP    = 0.3;   // Hilfslinien kürzer als diese Länge (in em) werden weggelassen
const DELAY         = 120;   // Wartezeit (ms), bevor nach einer Änderung neu berechnet wird
const PRIORITY      = { kontakt: 3, signal: 2, weiche: 1, gleis: 0, fixed: 0 };  // höhere Priorität behält ihren Platz

// ---------------------------------------------------------------------------------------------
// Teil 1: 2D-Transformationen als Array [a, b, c, d, e, f] wie in SVG matrix(a b c d e f)
// Mit einer 3x3-Standard-Transformationsmatrix können auch Verschiebungen mit Matrixmultiplikation berechnet werden
//   a c e
//   b d f
//   0 0 1
// Transformation		SVG-Shortcut				Matrix-Darstellung: matrix(a, b, c, d, e, f)		Beschreibung
// Identität				Keine								matrix(1, 0, 0, 1, 0, 0)												Der Ausgangszustand (keine Veränderung).
// Verschiebung			translate(tx, ty)		matrix(1, 0, 0, 1, tx, ty)											Verschiebt das Objekt um tx nach rechts und ty nach unten.
// Skalierung				scale(sx, sy)				matrix(sx, 0, 0, sy, 0, 0)											Streckt/staucht das Objekt (z.B. 2 für doppelte Größe).
// Rotation					rotate(α)						matrix(cos(α), sin(α), -sin(α), cos(α), 0, 0)		Rotiert das Objekt um den Winkel α (im Uhrzeigersinn).
// Scherung X				skewX(α)						matrix(1, 0, tan(α), 1, 0, 0)										Neigt das Objekt horizontal entlang der X-Achse.
// Scherung Y				skewY(α)						matrix(1, tan(α), 0, 1, 0, 0)										Neigt das Objekt vertikal entlang der Y-Achse.

// ---------------------------------------------------------------------------------------------
const IDENTITY = [1, 0, 0, 1, 0, 0];

// Produkt A * B (B wird zuerst angewendet)
function mul(A, B) {
	return [
		A[0]*B[0] + A[2]*B[1],
		A[1]*B[0] + A[3]*B[1],
		A[0]*B[2] + A[2]*B[3],
		A[1]*B[2] + A[3]*B[3],
		A[0]*B[4] + A[2]*B[5] + A[4],
		A[1]*B[4] + A[3]*B[5] + A[5],
	];
}

// Punkt (x, y) mit der Transformation M transformieren
function applyTo(M, x, y) {
	return [ M[0]*x + M[2]*y + M[4], M[1]*x + M[3]*y + M[5] ];
}

// Wertet einen SVG-transform-String aus (matrix, translate, scale, rotate), von links nach rechts
// Ergebnis: [a, b, c, d, e, f] wie in matrix(a b c d e f)
function parseTransform(str) {
	let M = IDENTITY;
	if (!str) { return M; }
	// matrix(a b c d e f) oder translate(tx, ty) oder scale(sx, sy) oder rotate(angle) oder rotate(angle cx cy)
	const re = /(matrix|translate|scale|rotate)\s*\(([^)]*)\)/g;
	let found;
	while ((found = re.exec(str)) !== null) {
		const v = found[2].trim().split(/[\s,]+/).map(Number);
		let T = IDENTITY;
		if (found[1] === "matrix") {
			if (v.length === 6) { T = v; }
		} else if (found[1] === "translate") {
			T = [1, 0, 0, 1, v[0], (v.length > 1 ? v[1] : 0)];
		} else if (found[1] === "scale") {
			T = [v[0], 0, 0, (v.length > 1 ? v[1] : v[0]), 0, 0];
		} else { // rotate(angle) oder rotate(angle cx cy)
			const r = v[0] * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
			T = [c, s, -s, c, 0, 0];
			if (v.length >= 3) {
				T = mul(mul([1, 0, 0, 1, v[1], v[2]], T), [1, 0, 0, 1, -v[1], -v[2]]);
			}
		}
		M = mul(M, T);
	}
	return M;
}

// ---------------------------------------------------------------------------------------------
// Teil 2: Reine Geometrie
// ---------------------------------------------------------------------------------------------

// Rechteck des Textes (Textkoordinaten, um pad vergrößert und um (tx, ty) verschoben) in Weltkoordinaten
function makePoly(item, tx, ty, pad) {
	const b = item.box, f = item.frame;
	const xs = [ b.x0 - pad + tx, b.x1 + pad + tx ];
	const ys = [ b.y0 - pad + ty, b.y1 + pad + ty ];
	const pts = [];
	let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
	// Reihenfolge der Ecken: (x0,y0) (x1,y0) (x1,y1) (x0,y1)
	const order = [ [0, 0], [1, 0], [1, 1], [0, 1] ];
	for (const [ix, iy] of order) {
		const x = f[0]*xs[ix] + f[2]*ys[iy] + f[4];
		const y = f[1]*xs[ix] + f[3]*ys[iy] + f[5];
		pts.push(x, y);
		if (x < minx) { minx = x; } if (x > maxx) { maxx = x; }
		if (y < miny) { miny = y; } if (y > maxy) { maxy = y; }
	}
	if (!isFinite(minx + miny + maxx + maxy)) { return null; }
	return { pts: pts, minx: minx, miny: miny, maxx: maxx, maxy: maxy };
}

// Gibt es eine trennende Achse (Kantennormale von P), auf der sich P und Q nicht überlappen?
function separated(P, Q) {
	const p = P.pts, q = Q.pts;
	for (let i = 0; i < 2; i++) {
		const nx = -(p[2*i+3] - p[2*i+1]);
		const ny =   p[2*i+2] - p[2*i];
		const eps = 1e-6 * Math.hypot(nx, ny);
		let pmin = Infinity, pmax = -Infinity, qmin = Infinity, qmax = -Infinity;
		for (let k = 0; k < 4; k++) {
			const dp = p[2*k] * nx + p[2*k+1] * ny;
			const dq = q[2*k] * nx + q[2*k+1] * ny;
			if (dp < pmin) { pmin = dp; } if (dp > pmax) { pmax = dp; }
			if (dq < qmin) { qmin = dq; } if (dq > qmax) { qmax = dq; }
		}
		if (pmax <= qmin + eps || qmax <= pmin + eps) { return true; }
	}
	return false;
}

// Überlappen sich zwei Rechtecke? (Berühren zählt nicht)
function polysOverlap(P, Q) {
	if (P.maxx <= Q.minx || Q.maxx <= P.minx || P.maxy <= Q.miny || Q.maxy <= P.miny) { return false; }
	return !separated(P, Q) && !separated(Q, P);
}

// Raster zur schnellen Suche von Nachbarn. Die Elemente haben die Eigenschaft poly.
/* Diese JavaScript-Funktion implementiert ein Spatial Hash (räumliches Gitter), das verwendet wird, um 2D-Objekte basierend 
auf ihrer Position effizient im Raum zu verwalten. Anstatt bei Kollisionsprüfungen jedes Objekt mit jedem anderen zu 
vergleichen (O(N²)), teilt diese Struktur die Spielwelt in ein Raster aus quadratischen Zellen auf. So müssen nur Objekte 
in benachbarten Zellen geprüft werden. */
function SpatialHash(cellSize) {
	const cells = new Map();	// Dictionary, das die Raster-Zellen speichert. Als Schlüssel (key) dient eine eindeutige Zahl, der Wert ist ein Array mit den Objekten in dieser Zelle.
	let stamp = 0; // Zähler (Zeitstempel) für Suchabfragen, um zu verhindern, dass dasselbe Objekt mehrfach verarbeitet wird, wenn es sich über mehrere Zellen erstreckt.
	const OFFSET = 524288, FACTOR = 1048576;  // Konstanten, um negative Koordinaten in positive Schlüssel zu konvertieren. OFFSET verschiebt die Koordinaten, FACTOR sorgt dafür, dass die x- und y-Koordinaten eindeutig kombiniert werden.
	const key = (cx, cy) => (cx + OFFSET) * FACTOR + (cy + OFFSET);  // Hilfsfunktion, die die Rasterkoordinaten (cx, cy) in einen eindeutigen Schlüssel für das cells-Map umwandelt.

	// Fügt ein Objekt in das Spatial Hash ein, basierend auf seinem Begrenzungsrechteck (item.poly). Das Objekt kann mehrere Zellen belegen, daher wird es in allen relevanten Zellen gespeichert.
	this.insert = function(item) { 
		const p = item.poly;
		item.keys = [];
		// Berechnet die Rasterkoordinaten der Zellen, die das Rechteck des Objekts überlappen, und fügt das Objekt in jede dieser Zellen ein.
		const cx1 = Math.floor(p.maxx / cellSize), cy1 = Math.floor(p.maxy / cellSize);
		// Schleife über alle Zellen in der x-Richtung, die das Rechteck überlappen.
		for (let cx = Math.floor(p.minx / cellSize); cx <= cx1; cx++) {
			// Für jede Zelle in der x-Richtung, die das Rechteck überlappt, wird eine Schleife über die y-Richtung durchgeführt.
			for (let cy = Math.floor(p.miny / cellSize); cy <= cy1; cy++) {
				// Berechnet den eindeutigen Schlüssel für die aktuelle Zelle (cx, cy).
				const k = key(cx, cy);
				// Holt die Liste der Objekte, die bereits in dieser Zelle gespeichert sind.
				let list = cells.get(k);
				// Wenn die Zelle noch nicht existiert, wird ein neues Array erstellt und in das cells-Map eingefügt.
				if (!list) { list = []; cells.set(k, list); }
				// Fügt das Objekt in die Liste der Zelle ein und speichert den Schlüssel der Zelle im Objekt selbst, damit es später leicht entfernt werden kann.
				list.push(item);
				item.keys.push(k);
			}
		}
	};

	// Entfernt ein Objekt aus dem Spatial Hash. Es wird aus allen Zellen entfernt, in denen es zuvor gespeichert war.
	this.remove = function(item) {  
		for (const k of item.keys) {
			const list = cells.get(k);
			if (list) {
				const i = list.indexOf(item);
				if (i >= 0) { list.splice(i, 1); }
			}
		}
		item.keys = [];
	};

	// Ruft fn(item) für alle Elemente auf, deren Zellen das Rechteck poly berühren. Abbruch, wenn fn true liefert.
	this.query = function(poly, fn) {
		stamp++;
		// Berechnet die Rasterkoordinaten der Zellen, die das Rechteck poly überlappen.
		const cx1 = Math.floor(poly.maxx / cellSize), cy1 = Math.floor(poly.maxy / cellSize);
		for (let cx = Math.floor(poly.minx / cellSize); cx <= cx1; cx++) {
			// Für jede Zelle in der x-Richtung, die das Rechteck überlappt, wird eine Schleife über die y-Richtung durchgeführt.
			for (let cy = Math.floor(poly.miny / cellSize); cy <= cy1; cy++) {
				// Holt die Liste der Objekte, die in dieser Zelle gespeichert sind.
				const list = cells.get(key(cx, cy));
				if (!list) { continue; }
				for (const item of list) {
					// Verhindert, dass dasselbe Objekt mehrfach verarbeitet wird, wenn es sich über mehrere Zellen erstreckt.
					if (item.seen === stamp) { continue; }
					// Markiert das Objekt als gesehen und ruft die Callback-Funktion auf. Wenn fn true zurückgibt, wird die Abfrage abgebrochen.
					item.seen = stamp;
					// Ruft die Callback-Funktion auf und prüft, ob sie true zurückgibt. Wenn ja, wird die Abfrage abgebrochen.
					if (fn(item)) { return true; }
				}
			}
		}
		return false;
	};
}

// Kandidaten für Verschiebungen (in em), sortiert nach Verschiebung.
// side < 0: nur Verschiebung nach "oben" (ey <= 0), side > 0: nur nach "unten" (ey >= 0), side = 0: frei
const candidateCache = new Map();
function getCandidates(side) {
	const s = Math.sign(side || 0);
	if (candidateCache.has(s)) { return candidateCache.get(s); }
	const list = [];
	const nx = Math.round(RADIUS_X / STEP), ny = Math.round(RADIUS_Y / STEP);
	// Schleife über alle möglichen Verschiebungen im Raster, innerhalb der maximalen Verschiebung (RADIUS_X, RADIUS_Y).
	for (let ix = -nx; ix <= nx; ix++) {
		for (let iy = (s > 0 ? 0 : -ny); iy <= (s < 0 ? 0 : ny); iy++) {
			list.push({ ex: ix * STEP, ey: iy * STEP, cost: Math.hypot(ix, iy) * STEP });
		}
	}
	// Sortiert die Kandidatenliste nach Kosten (Verschiebung), dann nach Abstand in y-Richtung, dann nach x- und y-Koordinaten.
	list.sort((a, b) => (a.cost - b.cost) || (Math.abs(a.ey) - Math.abs(b.ey)) || (a.ex - b.ex) || (a.ey - b.ey));
	candidateCache.set(s, list);
	return list;
}

/* layoutLabels(items, options)
items: Array von Texten
	frame		[a b c d e f]	Textkoordinaten -> Weltkoordinaten
	box			{x0, y0, x1, y1}	Rechteck des Textes in Textkoordinaten (ohne Abstand)
	fixed		true: Hindernis, wird nie verschoben
	priority	höhere Zahl = behält ihren Platz
	side		-1 / +1: Verschiebung nur vom Gleis weg bzw. entlang des Gleises (Gleis = Linie y = 0 der Textkoordinaten,
				der Text liegt auf der Seite sign(side)); 0: keine Einschränkung
options:
	fontSize	Schriftgröße in Weltkoordinaten (Einheit der Verschiebung ist em = fontSize)
Ergebnis: { offsets: Array (je Text null oder {tx, ty, unresolved}), stats: {...} }
	tx, ty		Verschiebung in Textkoordinaten (Weltkoordinaten-Einheiten)
	unresolved	true: es wurde kein freier Platz gefunden
*/
function layoutLabels(items, options) {
	const F 	= (options && options.fontSize > 0 ? options.fontSize : 4);
	const pad	= PADDING * F;
	const offsets = new Array(items.length).fill(null);
	const t0 	= Date.now();  // Zeitmessung für Statistik

	// Elemente anlegen. state: fixed = Hindernis, pending = noch nicht platziert, placed = platziert
	const hash 	= new SpatialHash(8 * F);
	const recs 	= [];
	items.forEach(function(item, i) {
		const poly = makePoly(item, 0, 0, pad);
		if (!poly) { return; }	// unbrauchbare Daten (NaN)
		// Jedes Element wird als "rec" (record) gespeichert, das Informationen über den Text, seine Position und seinen Zustand enthält.
		const rec = { 
			index: i, 
			item: item, 
			poly: poly, 
			tx: 0, 
			ty: 0, 
			state: (item.fixed ? "fixed" : "pending"), 
			involved: false, 
			unresolved: false, 
			keys: [], 
			seen: 0 
		};
		recs.push(rec);
		hash.insert(rec);
	});

	// Prüft, ob ein Rechteck poly mit einem anderen Rechteck (außer rec) überlappt. Wenn includePending false ist, werden nur bereits platzierte Rechtecke berücksichtigt.
	function hit(rec, poly, includePending) {
		return hash.query(poly, function(other) {
			if (other === rec) { return false; }
			if (other.state === "pending" && !includePending) { return false; }
			return polysOverlap(poly, other.poly);
		});
	}

	// Zählt, wie viele Rechtecke (außer rec) mit dem Rechteck poly überlappen. Berücksichtigt nur bereits platzierte Rechtecke.
	function countHits(rec, poly) {
		let n = 0;
		hash.query(poly, function(other) {
			if (other !== rec && other.state !== "pending" && polysOverlap(poly, other.poly)) { n++; }
			return false;
		});
		return n;
	}

	// Verschiebt ein Rechteck rec auf die neue Position (tx, ty) und aktualisiert das Spatial Hash.
	function moveTo(rec, tx, ty, poly) {
		hash.remove(rec);
		rec.tx = tx;
		rec.ty = ty;
		rec.poly = poly;
		hash.insert(rec);
	}

	// Schritt 1: Konflikte suchen. Texte ohne Konflikt bleiben unverändert.
	for (const rec of recs) {
		if (rec.state === "fixed") { continue; }
		rec.involved = hash.query(rec.poly, function(other) {
			return other !== rec && polysOverlap(rec.poly, other.poly);
		});
		if (!rec.involved) { rec.state = "placed"; }
	}

	// Schritt 2: Texte mit Konflikt nach Priorität platzieren
	const todo = recs.filter(rec => rec.involved);
	// Bei gleicher Priorität behalten kürzere Texte (z.B. nur ein Icon) ihren Platz
	const width = rec => rec.item.box.x1 - rec.item.box.x0;
	todo.sort((a, b) => (b.item.priority - a.item.priority) || (width(a) - width(b)) || (a.index - b.index));

	for (const rec of todo) {
		const cands = getCandidates(rec.item.side);
		let relaxed = null;	// erster Platz, der keinen bereits platzierten Text stört
		let chosen 	= null;

		// Kandidaten durchgehen, bis ein freier Platz gefunden wird
		for (const c of cands) {
			if (relaxed && c.cost > relaxed.c.cost + SLACK) { break; }

			const tx = c.ex * F, ty = c.ey * F;
			const poly = makePoly(rec.item, tx, ty, pad);
			if (!poly || hit(rec, poly, false)) { continue; }

			if (!relaxed) {
				relaxed = { c: c, tx: tx, ty: ty, poly: poly };
				if (c.cost === 0) { break; }	// der ursprüngliche Platz ist frei, der Text mit höherer Priorität bleibt
			}
			if (!hit(rec, poly, true)) { chosen = { tx: tx, ty: ty, poly: poly }; break; }	// Platz stört auch keinen noch nicht platzierten Text
		}
		// Wenn kein Platz gefunden wurde, wird der erste Platz gewählt, der keinen bereits platzierten Text stört (relaxed).
		if (!chosen && relaxed) { chosen = relaxed; }

		// Wenn immer noch kein Platz gefunden wurde, wird ein Platz aus den ersten FALLBACK_MAX Kandidaten gewählt, der die wenigsten Konflikte verursacht.
		if (!chosen) {
			let best = null;
			const n = Math.min(cands.length, FALLBACK_MAX);
			// Durchläuft die Kandidaten und wählt denjenigen mit den wenigsten Konflikten (hits) aus.
			for (let k = 0; k < n; k++) {
				const c = cands[k];
				const tx = c.ex * F, ty = c.ey * F;
				const poly = makePoly(rec.item, tx, ty, pad);
				if (!poly) { continue; }

				const hits = countHits(rec, poly);
				if (!best || hits < best.hits) { best = { hits: hits, tx: tx, ty: ty, poly: poly }; }
				if (hits === 0) { break; }
			}
			chosen = best || { tx: 0, ty: 0, poly: rec.poly };
			rec.unresolved = true;
		}

		// Verschiebt das Rechteck rec auf die gewählte Position (chosen).
		if (chosen.tx !== 0 || chosen.ty !== 0) {
			moveTo(rec, chosen.tx, chosen.ty, chosen.poly);
		}
		rec.state = "placed";
	}

	// Schritt 3: Verschobene Texte wieder näher an den Ursprung holen, falls dort inzwischen Platz ist
	for (let pass = 0; pass < REFINE_PASSES; pass++) {
		let improved = false;
		for (const rec of todo) {
			const current = Math.hypot(rec.tx, rec.ty);
			if (current === 0) { continue; }
			// Kandidaten in der Reihenfolge der Verschiebung durchgehen, bis ein Platz gefunden wird, der näher am Ursprung liegt.
			for (const c of getCandidates(rec.item.side)) {
				if (c.cost * F >= current - 1e-9) { break; }
				const tx = c.ex * F, ty = c.ey * F;
				const poly = makePoly(rec.item, tx, ty, pad);
				// Wenn der Platz frei ist (keine Kollisionen), wird das Rechteck rec auf die neue Position verschoben.
				if (poly && !hit(rec, poly, true)) {
					moveTo(rec, tx, ty, poly);
					rec.unresolved = false;
					improved = true;
					break;
				}
			}
		}
		if (!improved) { break; }
	}

	// Schritt 4: Ergebnisse zusammenstellen
	const stats = { labels: recs.length, involved: todo.length, moved: 0, unresolved: 0, totalEm: 0, ms: 0 };
	// Für jeden Text, der verschoben wurde oder nicht aufgelöst werden konnte, werden die Verschiebungswerte (tx, ty) und der 
	// Auflösungsstatus (unresolved) in das offsets-Array eingefügt. Außerdem werden Statistiken über die Anzahl der verschobenen 
	// Texte, die Gesamtverschiebung in em und die Anzahl der nicht aufgelösten Texte gesammelt.
	for (const rec of todo) {
		if (rec.tx === 0 && rec.ty === 0 && !rec.unresolved) { continue; }
		offsets[rec.index] = { tx: rec.tx, ty: rec.ty, unresolved: rec.unresolved };
		if (rec.tx !== 0 || rec.ty !== 0) { stats.moved++; stats.totalEm += Math.hypot(rec.tx, rec.ty) / F; }
		if (rec.unresolved) { stats.unresolved++; }
	}
	stats.ms = Date.now() - t0; // Zeitmessung für Statistik
	return { offsets: offsets, stats: stats };
}

// ---------------------------------------------------------------------------------------------
// Teil 3: DOM-Anbindung
// ---------------------------------------------------------------------------------------------
const NS = "http://www.w3.org/2000/svg";
const labels = [];		// registrierte Texte
let enabled = true;		// Checkbox "Texte entzerren"
let timer = null;

// Breite eines Textes in em (Arial), einmalig per canvas gemessen
const widthCache = new Map();
let measureContext;
function measureEm(text) {
	let w = widthCache.get(text);
	if (w === undefined) {
		if (measureContext === undefined) {
			measureContext = document.createElement("canvas").getContext("2d");
			if (measureContext) { measureContext.font = "100px Arial"; }
		}
		w = (measureContext ? measureContext.measureText(text).width / 100 : 0.6 * text.length);
		widthCache.set(text, w);
	}
	return w;
}

// Länge eines Attributes wie dx / dy: "0.5em" oder "-2.3"
function parseLength(str) {
	if (str === null || str === undefined || str === "") { return { em: 0, u: 0 }; }
	const m = /^\s*(-?[\d.]+(?:e[+-]?\d+)?)\s*(em)?\s*$/i.exec(str);
	if (!m) { return { em: 0, u: 0 }; }
	return (m[2] ? { em: +m[1], u: 0 } : { em: 0, u: +m[1] });
}

// Alle registrierten Texte löschen (z.B. beim Neuzeichnen des Gleisplans)
function resetLabels() {
	labels.length = 0;
	if (timer !== null) { clearTimeout(timer); timer = null; }
}

/* Text für das Layout anmelden. Aufruf direkt nach dem Erzeugen des text-Elementes, wenn die Gruppen
   mit ihren transform-Attributen bereits vorhanden sind.
	el					text-Element (mit Attributen transform, dx, dy)
	options.kind		"kontakt", "signal", "weiche", "gleis" (werden verschoben) oder "fixed" (feste Hindernisse)
	options.anchor		"start", "middle", "end" (text-anchor)
*/
function registerLabel(el, options) {
	// Transformationen aller übergeordneten Gruppen (bis zum Wurzelelement sutrackpSVG)
	const chain = [];
	for (let n = el.parentElement; n && n.id !== "sutrackpSVG"; n = n.parentElement) { chain.push(n); }
	let M = IDENTITY;
	for (let k = chain.length - 1; k >= 0; k--) { M = mul(M, parseTransform(chain[k].getAttribute("transform"))); }

	// Transformation des Textes selbst (Textkoordinaten -> Koordinaten der Gruppe)
	const own = parseTransform(el.getAttribute("transform"));
	labels.push({
		el: 			el,
		kind: 			options.kind,
		anchor: 		options.anchor || "start",
		priority: 		PRIORITY[options.kind] || 0,
		fixed: 			options.kind === "fixed",
		text: 			el.textContent,
		dx: 			parseLength(el.getAttribute("dx")),
		dy: 			parseLength(el.getAttribute("dy")),
		own: 			own,				// transform des Textes selbst: Textkoordinaten -> Koordinaten der Gruppe
		frame: 			mul(M, own),		// Textkoordinaten -> Weltkoordinaten
		baseTransform: 	el.getAttribute("transform") || "",
		moved: 			false,
		leader: 		null,
	});
}

// Rechteck des Textes in Textkoordinaten
function buildItem(label, F) {
	const w 	= measureEm(label.text) * F;
	const xo 	= label.dx.em * F + label.dx.u;			// Beginn / Mitte / Ende des Textes je nach text-anchor
	const yb 	= label.dy.em * F + label.dy.u;			// Grundlinie
	let x0, x1;
	if      (label.anchor === "middle") { x0 = xo - w / 2; x1 = xo + w / 2; }
	else if (label.anchor === "end") 	{ x0 = xo - w;     x1 = xo; }
	else                              { x0 = xo;         x1 = xo + w; }
	const y0 	= yb - ASCENT * F;
	const y1 	= yb + DESCENT * F;

	// Signale und Kontakte: Das Gleis ist die Linie y = 0 der Textkoordinaten. Der Text bleibt auf seiner Seite.
	// Weichen- und Gleistexte: Der Text kann frei verschoben werden.
	const side 	= (label.kind === "signal" || label.kind === "kontakt" ? ((y0 + y1) / 2 < 0 ? -1 : 1) : 0);

	return { frame: label.frame, box: { x0: x0, y0: y0, x1: x1, y1: y1 }, fixed: label.fixed, priority: label.priority, side: side };
}

// Ist das Element sichtbar (nicht über die Klassen hidden / hiddenZ einer Gruppe ausgeblendet)?
function isVisible(el) {
	for (let n = el; n && n.id !== "sutrackpSVG"; n = n.parentElement) {
		const c = n.classList;
		if (c && (c.contains("hidden") || c.contains("hiddenZ"))) { return false; }
	}
	return true;
}

// Hilfslinie vom ursprünglichen Ankerpunkt zum verschobenen Text entfernen
function removeLeader(label) {
	if (label.leader) {
		label.leader.remove();
		label.leader = null;
	}
}

// Text wieder an den ursprünglichen Platz zurücksetzen
function clearOffset(label) {
	if (label.moved) {
		label.el.setAttribute("transform", label.baseTransform);
		label.moved = false;
	}
	removeLeader(label);
}

// Hilfslinie vom ursprünglichen Ankerpunkt zum verschobenen Text zeichnen
const fmt = v => String(+v.toFixed(3));

// Verschiebt den Text um (tx, ty) in Textkoordinaten und zeichnet eine Hilfslinie vom ursprünglichen Ankerpunkt zum verschobenen Text
function setOffset(label, item, tx, ty, F) {
	label.el.setAttribute("transform", (label.baseTransform + " translate(" + fmt(tx) + " " + fmt(ty) + ")").trim());
	label.moved = true;

	// Hilfslinie vom ursprünglichen Ankerpunkt zum verschobenen Text
	if (Math.hypot(tx, ty) < LEADER_MIN * F) { removeLeader(label); return; }

	const b = item.box;
	let sx, sy;
	if (item.side === 0) {		// Weichen- und Gleistexte: Ursprung der Textkoordinaten (Ende bzw. Mitte des Gleises)
		sx = 0;
		sy = 0;
	} else {					// Signale und Kontakte: Mitte der dem Gleis zugewandten Kante des ursprünglichen Textes
		sx = (b.x0 + b.x1) / 2;
		sy = (item.side < 0 ? b.y1 : b.y0);
	}
	const ex = Math.min(Math.max(sx, b.x0 + tx), b.x1 + tx);	// nächster Punkt des verschobenen Textes
	const ey = Math.min(Math.max(sy, b.y0 + ty), b.y1 + ty);
	if (Math.hypot(ex - sx, ey - sy) < LEADER_GAP * F) { removeLeader(label); return; }

	const p = applyTo(label.own, sx, sy);	// Koordinaten der übergeordneten Gruppe
	const q = applyTo(label.own, ex, ey);
	if (!label.leader) {
		const line = document.createElementNS(NS, "line");
		// Klassen des Textes (z.B. WeicheText, GleisID): die Hilfslinie wird zusammen mit dem Text ein- und ausgeblendet
		const cls = label.el.getAttribute("class");
		line.setAttribute("class", "leader" + (cls ? " " + cls : ""));
		label.el.parentNode.insertBefore(line, label.el.nextSibling);
		label.leader = line;
	}
	label.leader.setAttribute("x1", fmt(p[0]));
	label.leader.setAttribute("y1", fmt(p[1]));
	label.leader.setAttribute("x2", fmt(q[0]));
	label.leader.setAttribute("y2", fmt(q[1]));
}

// Berechnet die Verschiebungen der Texte und wendet sie an
function runLayout() {
	timer = null;
	const F = (global.fontSize > 0 ? global.fontSize : 4);

	// Alle Texte durchgehen und die Daten für das Layout zusammenstellen. Ausgeblendete Texte werden ignoriert.
	const items = [], used = [];
	for (const label of labels) {
		if (!enabled || !isVisible(label.el)) {	// ausgeblendete Texte stören nicht
			clearOffset(label);
			continue;
		}
		items.push(buildItem(label, F));
		used.push(label);
	}
	if (items.length === 0) { return; }

	// Layout berechnen
	const result = layoutLabels(items, { fontSize: F });
	for (let i = 0; i < used.length; i++) {
		const offset = result.offsets[i];
		if (offset && (offset.tx !== 0 || offset.ty !== 0)) {
			setOffset(used[i], items[i], offset.tx, offset.ty, F);
		} else {
			clearOffset(used[i]);
		}
	}

	// Statistik ausgeben
	const s = result.stats;
	console.log("label layout: " 
		+ s.labels + " labels, " 
		+ s.involved + " with conflicts, " 
		+ s.moved + " moved"
		+ (s.moved ? " (average " + (s.totalEm / s.moved).toFixed(1) + " em)" : "") + ", " 
		+ s.unresolved + " unresolved, " 
		+ s.ms + " ms"
	);
}

// Layout nach einer Änderung (Schriftgröße, Sichtbarkeit, Höhenfilter) mit kurzer Verzögerung neu berechnen
function scheduleLabelLayout() {
	if (labels.length === 0) { return; }
	if (timer !== null) { clearTimeout(timer); }
	timer = setTimeout(runLayout, DELAY);
}

// Layout aktivieren / deaktivieren
function setLabelLayoutEnabled(flag) {
	enabled = !!flag;
	scheduleLabelLayout();
}

})(this); // end module
