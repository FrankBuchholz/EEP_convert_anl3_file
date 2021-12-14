"use strict";
const EEP_Texts = (function () {

const texts = {
	
err : {
	'001' : {
		DE : `Die 'file API' wird in diesem Browser noch nicht unterstützt.`, 
		EN : `The 'file API' isn't supported on this browser yet.`, 
		FR : `L'API du fichier n'est pas encore prise en charge dans ce navigateur.`, 
	},
	'002' : {
		DE : `Bitte wählen sie eine Datei bevor sie auf 'Laden' klicken.`, 
		EN : `Please select a file before clicking 'Load'.`, 
		FR : `Veuillez sélectionner un fichier avant de cliquer sur «Charger».`, 
	},
	'003' : {
		DE : `Fehler beim Lesen der Datei`, 
		EN : `Error while reading the file`, 
		FR : `Erreur de lecture du fichier`, 
	},
	'003a' : {
		DE : `in Zeile`, 
		EN : `in line`, 
		FR : `en ligne`, 
	},
},
msg : {
	TrackSystemNotExists : {
		DE : `Das Gleissystem $1 existiert nicht`, 
		EN : `The track system $1 does not exist`, 
		FR : `Le système de voies $1 n'existe pas`, 
	},
	TrackNotExists : {
		DE : `Das Gleis $1 $2 existiert nicht`, 
		EN : `The track $1 $2 does not exist`, 
		FR : `La voie $1 $2 n'existe pas`, 
	},
	SignalSwitchNotExists : {
		DE : `Das Signal bzw. die Weiche $1 existiert nicht`, 
		EN : `The signal, respective the switch $1 does not exist`, 
		FR : `Le signal, resp.le aiguillage $1 n'existe pas`, 
	},
	SignalLocation : {
		DE : `Das Signal $1 befindet sich auf $2 $3`, 
		EN : `The signal $1 is located at $2 $3`, 
		FR : `Le signal $1 se trouve à $2 $3`, 
	},
	SwitchLocation : {
		DE : `Die Weiche $1 befindet sich auf $2 $3`, 
		EN : `The switch $1 is located at $2 $3`, 
		FR : `L'aiguillage $1 se trouve à $2 $3`, 
	},
	ContactLocation : {
		DE : `Der Kontakt befindet sich auf $1 $2`, 
		EN : `The contact is located at $1 $2`, 
		FR : `Le contact se trouve à $1 $2`, 
	},
	Camera : {
		DE : `Kamera $1`, 
		EN : `Camera $1`, 
		FR : `Caméra $1`, 
	},
	CameraNotExists : {
		DE : `Die Kamera $1 existiert nicht`, 
		EN : `The camera $1 does not exist`, 
		FR : `La caméra n'existe pas`, 
	},
	Positioning : {
		DE : `Positionierung auf $1 $2`, 
		EN : `Positioning on $1 $2`, 
		FR : `Positionnement sur $1 $2`, 
	},
	'Dateityp nicht unterstützt' : {
		DE : `Der Dateityp "$1" wird nicht unterstützt`, 
		EN : `The type of file "$1" is not supported`, 
		FR : `Le type de fichier "$1" n'est pas soutenu`, 
	},
	'Zu groß, Export nicht möglich' : {
		DE : `Zu groß, Export nicht möglich $1`, 
		EN : `Too big, Export not possible $1`, 
		FR : `Trop grand, Export impossible $1`, 
	},
	'Graphik-Export' : {
		DE : `Graphik von Typ $1 in Größe $2 exportiert`, 
		EN : `Graphic of type $1 exported in size $2`, 
		FR : `Graphique de type $1 exportee à la dimension $2`, 
	},
	'automatic stroke width' : {
		DE : `Automatische Linienbreite`, 
		EN : `Automatic line width`, 
		FR : `Largeur de ligne automatique`, 
	},
	'manual stroke width' : {
		DE : `Manuelle Linienbreite`, 
		EN : `Manual line width`, 
		FR : `Largeur de ligne manuelle`, 
	},
	X : {
		DE : ``, 
		EN : ``, 
		FR : ``, 
	},
},
info : {
	Gleissystem : {
		DE : `Gleissystem`, 
		EN : `Track system`, 
		FR : `Système de voies`, 
	},
	Gleis : {
		DE : `Gleis`, 
		EN : `Track`, 
		FR : `Voie`, 
	},
	Gleise : {
		DE : `Gleise`, 
		EN : `Tracks`, 
		FR : `Voies`, 
	},
	Eisenbahn : {
		DE : `Eisenbahn`, 
		EN : `Railroad`, 
		FR : `Ferroviaire`, 
	},
	Strassenbahn : {
		DE : `Straßenbahn`, 
		EN : `Tram`, 
		FR : `Tram`, 
	},
	Strasse : {
		DE : `Straße`, 
		EN : `Road`, 
		FR : `Routière`, 
	},
	Wasserwege : {
		DE : `Wasserwege`, 
		EN : `Waterways`, 
		FR : `Navigable`, // Cours d'eau
	},
	Steuerstrecken : {
		DE : `Steuerstrecken`, 
		EN : `Control routes`, 
		FR : `Contrôle d'itinéraires`, 
	},
	GBS : {
		DE : `Gleisbildstellpult`, 
		EN : `Track-control-desk`, 
		FR : `Pupitre de commande`, 
	},
	Stellpulte : {
		DE : `Stellpulte`, 
		EN : `Control-desks`, 
		FR : `Pupitres de commande`, 
	},
	Stellpult : {
		DE : `Stellpult`, 
		EN : `Control-desk`, 
		FR : `Pupitre de commande`, 
	},
	Kamera : {
		DE : `Kamera`, 
		EN : `Camera`, 
		FR : `Caméra`, 
	},
	Hintergrund : {
		DE : `Hintergrund`, 
		EN : `Background`, 
		FR : `Arrière-plan`, 
	},
	Normal : {	// Gleisart
		DE : `Normal`, 
		EN : `Normal`, 
		FR : `Normale`, 
	},
	'3-Weg-Weiche' : {	// Gleisart
		DE : `3-Weg-Weiche`, 
		EN : `3-way switch`, 
		FR : `Aiguillage à 3 embranchements`, 
	},
	Prellbock : {	// Gleisart
		DE : `Prellbock`, 
		EN : `Track closure`,	// End track
		FR : `Butoir`,
	},
	Landschaftselemente : {	// Gebäudesammlung
		DE : `Landschaftselemente`, 
		EN : `Landscape elements`, 
		FR : `Éléments de paysage`, 
	},
	Sonstiges : {	// Gebäudesammlung
		DE : `Sonstiges`, 
		EN : `Others`, 
		FR : `Autres`, 
	},
	Reset : {
		DE : `Zurücksetzen`, 
		EN : `Reset`, 
		FR : `Réinitialiser`, 
	},
	Gleisobjekt : {
		DE : `Gleisobjekt`, 
		EN : `Track object`, 
		FR : `Objet de voie`,
	},
	'Gleisobjekte' : {
		DE : `Gleisobjekte`, 
		EN : `Track objects`, 
		FR : `Objets de voie`, 
	},
	'Gleisobjekte Straßen' : {
		DE : `Gleisobjekte Straßen`, 
		EN : `Objects of roadtracks`, 
		FR : `Objets de voie routière`, 
	},
	Immobilie : {
		DE : `Immobilie`, 
		EN : `Real estate`, 
		FR : `Immeuble`, 
	},
	Immobilien : {
		DE : `Immobilien`, 
		EN : `Real estates`, 
		FR : `Immobilier`, 
	},
	Stil : {	// Gleisstil, attribute: stil
		DE : `Gleisstil`, 
		EN : `Track style`, 
		FR : `Style de voie`, 
	},
	Gleisstile : {
		DE : `Gleisstile`, 
		EN : `Track styles`, 
		FR : `Styles de voie`, 
	},
	Position : {
		DE : `Position`, 
		EN : `Position`, 
		FR : `Position`, 
	},
	Anfang : {	// used to name track connection, too
		DE : `Anfang`, 
		EN : `Beginning`, 
		FR : `Début`, 
	},
	Mitte : {
		DE : `Mitte`, 
		EN : `Center`, 
		FR : `Milieu`, 
	},
	Ende : {	// used to name track connection, too
		DE : `Ende`, 
		EN : `End`, 
		FR : `Fin`, 
	},
	Durchfahrt : {	// Weichenstellung
		DE : `Durchfahrt`, 
		EN : `Main line`, 
		FR : `Branche principale`,
	},
	Abzweig : {	// Weichenstellung
		DE : `Abzweigung`, 
		EN : `Junction`, 
		FR : `Embranchement`, 
	},
	KoAbzweig : {	// Weichenstellung
		DE : `2. Abzweigung`, 
		EN : `2nd junction`, 
		FR : `2ème branche`, 
	},
	Spezial : {	// Weichenstellung
		DE : `Spezial`, 
		EN : `Special`, 
		FR : `Spécial`, 
	},
	EndeAbzweig : {	// track connection
		DE : `Abzweigung`, 
		EN : `Junction`, 
		FR : `Embranchement`, 
	},
	EndeKoAbzweig : {	// track connection
		DE : `2. Abzweigung`, 
		EN : `2nd junction`, 
		FR : `2ème branche`, 
	},
	Gleisart : {	// attribute: clsid
		DE : `Gleisart`, 
		EN : `Track type`, 
		FR : `Type de voie`, 
	},
	Datei : {		// attribute: gsbname
		DE : `Datei`, 
		EN : `File`, 
		FR : `Fichier`, 
	},
	'Länge' : {
		DE : `Länge`, 
		EN : `Length`, 
		FR : `Longueur`, 
	},
	'Höhe' : {
		DE : `Höhe`, 
		EN : `Height`, 
		FR : `Hauteur`, 
	},
	Kurventyp : {
		DE : `Kurventyp`, 
		EN : `Curve type`, 
		FR : `Type de courbe`, 
	},
	Weiche : {
		DE : `Weiche`, 
		EN : `Switch`, 
		FR : `Aiguillage`,
	},
	Weichen : {
		DE : `Weichen`, 
		EN : `Switches`, 
		FR : `Aiguillages`, 
	},
	Weichenstellung : {
		DE : `Weichenstellung`, 
		EN : `Switch position`, 
		FR : `Position de l'aiguillage`, 
	},
	Kontaktziel : {
		DE : `Kontaktziel`, 
		EN : `Contact target`, 
		FR : `Cible du contact`, 
	},
	Signal : {
		DE : `Signal`, 
		EN : `Signal`, 
		FR : `Signal`, 
	},
	Signale : {
		DE : `Signale`, 
		EN : `Signals`, 
		FR : `Signaux`, 
	},
	Name : {
		DE : `Name`, 
		EN : `Name`, 
		FR : `Nom`, 
	},
	auf : {
		DE : `auf`, 
		EN : `on`, 
		FR : `sur`, 
	},
	Signalstellung : {
		DE : `Signalstellung`, 
		EN : `Signal position`,		// Falls Signalzustand gemeint ist, dann state, resp. état
		FR : `Position du signal`, 
	},
	Signalstellungen : {
		DE : `Signalstellungen`, 
		EN : `Signal positions`,
		FR : `Positions du signal`, 
	},
	'Distanz zum Hauptsignal' : {
		DE : `Distanz zum Hauptsignal`, 
		EN : `Distance to the main signal`, 
		FR : `Distance du signal principal`, 
	},
	Gleisrichtung : {
		DE : `Gleisrichtung`, 
		EN : `Track direction`, 
		FR : `Sens de voie`,
	},
	'in Gleisrichtung' : {
		DE : `in Gleisrichtung`, 
		EN : `in the direction of the track`, 
		FR : `dans le sens de la voie`, 
	},
	'gegen Gleisrichtung' : {
		DE : `gegen Gleisrichtung`, 
		EN : `against track direction`, 
		FR : `à contre-sens de la voie`,  
	},
	'beide Richtungen' : {
		DE : `beide Richtungen`, 
		EN : `both track directions`, 
		FR : `dans les deux sens`, 
	},
	'Fahrstraße' : { // 'Fahrstraßen' und 'Routen' sind in EEP verschiedene Objekte
		DE : `Fahrstraße`, 
		EN : `Predefined line`,			// Pre-set route
		FR : `Parcour prédéfini`,		// Itinéraire prédéfini
	},
	'Fahrstraßen' : {
		DE : `Fahrstraßen`, 
		EN : `Predefined lines`,		// Pre-set routes
		FR : `Parcours prédéfini`,		// Itinéraires prédéfini
	},
	Route : { // 'Fahrstraßen' und 'Routen' sind in EEP verschiedene Objekte
		DE : `Route`, 
		EN : `Route`,
		FR : `Itinéraire`, 
	},
	Startsignal : {	// Startsignal einer Fahrstraße
		DE : `Startsignal`, 
		EN : `Start signal`, 
		FR : `Signal de démarrage`, // Signal de départ
	},
	Endesignal : {	// Endesignal einer Fahrstraße
		DE : `Endesignal`, 
		EN : `End signal`, 
		FR : `Signal de fin`, 		// Signal d'arrivée
	},
	Zielsignal : {	// Zielsignal eines Kontaktes
		DE : `Zielsignal`, 
		EN : `Target signal`, 
		FR : `Signal ciblé`, 
	},
	Farbe : {
		DE : `Farbe`, 
		EN : `Colour`, 
		FR : `Couleur`,
	},
	SignalData : {
		DE : `Signal Daten`, 
		EN : `Signal data`, 
		FR : `Données du signal`, 
	},
	Kamera : {
		DE : `Kamera`, 
		EN : `Camera`, 
		FR : `Caméra`, 
	},
	Kameras : {
		DE : `Kameras`, 
		EN : `Cameras`, 
		FR : `Caméras`, 
	},
	Kontakt : {
		DE : `Kontakt`, 
		EN : `Contact`, 
		FR : `Contact`, 
	},
	Kontakte : {
		DE : `Kontakte`, 
		EN : `Contacts`, 
		FR : `Contacts`, 
	},
	unbekannt : {
		DE : `unbekannt`, 
		EN : `unknown`, 
		FR : `inconnu`, 
	},
	Umschalter : {
		DE : `Umschalter`, 
		EN : `Changeover switch`, 
		FR : `Commutateur`, 
	},
	Kameratyp : {
		DE : `Kameratyp`, 
		EN : `Camera type`, 
		FR : `Type de caméra`, 
	},
	statisch : {
		DE : `statisch`, 
		EN : `static`, 
		FR : `statique`, 
	},
	dynamisch : {
		DE : `dynamisch`, 
		EN : `dynamic`, 
		FR : `dynamique`, 
	},
	nach : {
		DE : `nach`, 
		EN : `after`, 
		FR : `après`, 
	},
	Sekunden : {
		DE : `Sekunden`, 
		EN : `seconds`, 
		FR : `secondes`, 
	},
	Kontakttypcode : {	// SetType
		DE : `Kontakttypcode`, 
		EN : `Type of contact`, 
		FR : `Type de contact`, 
	},
	Kontakttyp : {	// Text zum Kontakttyp
		DE : `Kontakttyp`, 
		EN : `Type of contact`, 
		FR : `Type de contact`, 
	},
	ImmoIdx : {
		DE : `Immobilien-Index`, 
		EN : `Property index`, 
		FR : `Indexe immobilier`, 
	},
	'Auslösung' : {
		DE : `Auslösung`, 
		EN : `Trigger`, 
		FR : `Déclenchement`, 
	},
	'Zug-Zähler' : {
		DE : `Zug-Zähler`, 
		EN : `Train-counter`, 
		FR : `Compteur de trains`, 
	},
	'Zählerstand' : {
		DE : `Zählerstand`, 
		EN : `State of counter`, 
		FR : `État du compteur`, 
	},
	'Zeitverzögerung' : {
		DE : `Zeitverzögerung`, 
		EN : `Delay`, 
		FR : `Retardement`, 
	},
	'Zeit abgelaufen' : {
		DE : `Zeit abgelaufen`, 
		EN : `Elapsed time`, 
		FR : `Temps écoulé`, 
	},
	Zugposition : {
		DE : `Zugposition`, 
		EN : `Train position`, 
		FR : `Position du train`, 
	},
	'für Route' : {
		DE : `für Route`, 
		EN : `for route`, 
		FR : `pour l'itinéraire`,
	},
	'für Zug' : {
		DE : `für Zug`, 
		EN : `for train`, 
		FR : `pour train`, 
	},
	'auf Zug' : {
		DE : `auf Zug`, 
		EN : `on train`, 
		FR : `dans train`, 
	},
	'Zug-Filter' : {
		DE : `Zug-Filter`, 
		EN : `Train filter`, 
		FR : `Filtre de train`, 
	},
	'Neuer Zugname' : {
		DE : `Neuer Zugname`, 
		EN : `New train name`, 
		FR : `Nouveau nom de train`, 
	},
	LuaFn : {
		DE : `Lua-Funktion`, 
		EN : `Lua function`, 
		FR : `Fonction Lua`, 
	},
	'zu Stellung' : {
		DE : `zu Stellung`, 
		EN : `at position`, 
		FR : `à la position`, 
	},
	Blickrichtung : {
		DE : `Blickrichtung`, 
		EN : `Direction of sight`, 
		FR : `Sens de la vue`, 
	},
	Neigung : {
		DE : `Neigung`, 
		EN : `Incline`, 
		FR : `Inclinaison`, 
	},
	Kippung : {
		DE : `Kippung`, 
		EN : `Tilting`, 
		FR : `Bascule`, 
	},
	'Gleisplan exportieren' : {
		DE : `Gleisplan exportieren`, 
		EN : `Export track map`, 
		FR : `Exporter le plan de voies`, 
	},
	exportWindow : {
		DE : `
<p>Wähle die Größe $1 und das gewünschte Datenformat:<\/p>
<dl>
<dt>PNG<\/dt>
<dd>Verlustfreie Pixel-Graphik in bestimmter Größe; ideal für Computergraphik<\/dd>
<dt>JPG<\/dt>
<dd>Verlustbehaftetes Pixel-Bild in bestimmter Größe und Qualität; ideal für Fotos.<br>
Qualität (%): $2<br><br>
Nur Bilder in diesem Format können direkt in das <a $3>EEP-Forum<\/a> hochgeladen werden: <i>Die Bilder dürfen die Dateiendungen jpg, jpeg besitzen und sie dürfen maximal 2 MB groß sein. Die minimale Bildgröße beträgt 800×500 Pixel und die maximale Größe beträgt 1920×1080 Pixel.<\/i> Daher wird die Größe der exportieren Graphik nach Möglichkeit auf diese Werte begrenzt.<\/dd>
<dt>SVG<\/dt>
<dd>Beliebig zoombare, verlustfreie Vektor-Graphik; ideal zur Weiterverarbeitung in anderen Programmen<br>
Es wird nur der gewählte Ausschnitt exportiert.<\/dd>
<\/dl>
`, 
		EN : `
<p>Select the size $1 and the desired data format:<\/p>
<dl>
<dt>PNG<\/dt>
<dd>Loss-free pixel graphic format; ideal for computergraphic<\/dd>
<dt>JPG<\/dt>
<dd>Pixel-picture with quality-loss; ideal for fotos.<br>
Quality (%): $2<br><br>
Only pictures of this format may be directly uploaded to the <a $3>EEP-Forum<\/a>: <i>The file must have the extension .jpg or .jpeg and their size must remain under 2 MB. The minimal picture size is 800×500 Pixel up to 1920×1080 pixels.<\/i> The size of the exported graphics will be reduced to fulfil these limitations.<\/dd>
<dt>SVG<\/dt>
<dd>Freely zoomable, loss-free vector-graphic; ideal for further processing by other programs<br>
Only the selected section is exported.<\/dd>
<\/dl>`, 
		FR : `
<p>Sélectionnez la dimension $1 et le format désirés:<\/p>
<dl>
<dt>PNG<\/dt>
<dd>Format graphique en pixels sans perte de qualité et de dimension définie; Idéal pour graphiques informatiques.<\/dd>
<dt>JPG<\/dt>
<dd>Format de fichier graphique permettant des taux de compression impressionnants mais au détriment de la qualité de l'image; Idéal pour photos.<br>
Qualité (%): $2<br><br>
Uniquement les images de ce type peuvent être téléchargées dans le <a $3>forum EEP<\/a>: <i>Les images doivent être du type jpg ou jpeg et ne doivent pas dépasser 2 MB.La dimension minimale est de 800×500 pixels et de 1920×1080 pixels maximum.<\/i> Adapter le fichier à exporter à ces limitations.<\/dd>
<dt>SVG<\/dt>
<dd>Format de fichier graphique vectoriel sans perte de qualité, zoomable à volonté; Idéal pour un traitement ultérieur dans d'autres programmes.<br>
Seule la section sélectionnée est exportée.<\/dd>
<\/dl>
`, 
	},
	'Farben wählen' : {
		DE : `Farben wählen`, 
		EN : `Choose colour`, 
		FR : `Choisissez la couleur`, 
	},
	grau : {
		DE : `grau`, 
		EN : `grey`, 
		FR : `gris`, 
	},
	rot : {
		DE : `rot`, 
		EN : `red`, 
		FR : `rouge`, 
	},
	'grün' : {
		DE : `grün`, 
		EN : `green`, 
		FR : `vert`, 
	},
	blau : {
		DE : `blau`, 
		EN : `blue`, 
		FR : `bleu`, 
	},
	gelb : {
		DE : `gelb`, 
		EN : `yellow`, 
		FR : `jaune`, 
	},
	pink : {
		DE : `pink`, 
		EN : `pink`, 
		FR : `rose`, 
	},
	hellblau : {
		DE : `hellblau`, 
		EN : `light blue`, 
		FR : `bleu clair`, 
	},
	orange : {
		DE : `orange`, 
		EN : `orange`, 
		FR : `orange`, 
	},
	Oberleitung : {	// GleisData
		DE : `Oberleitung`, 
		EN : `Catenary`, 
		FR : `Caténaire`, 
	},
	'Weichenlaterne verstecken' : {
		DE : `Weichenlaterne versteckt`, 
		EN : `Turnout lantern hidden`, 
		FR : `Lanterne masquée`, 	// Lanterne d'aiguillage masquée
	},
	'Weichenlaterne rechts' : {
		DE : `Weichenlaterne rechts`, 
		EN : `Turnout lantern on the right`, 
		FR : `Lanterne à droite`,	// Lanterne d'aiguillage à droite 
	},
	'Weichenlaterne links' : {
		DE : `Weichenlaterne links`, 
		EN : `Turnout lantern on the left`, 
		FR : `Lanterne à gauche`, 	// Lanterne d'aiguillage à gauche
	},
	'Weichenlaterne als Immobilie/Straßen-T-Kreuzung' : {
		DE : `Weichenlaterne als Immobilie/Straßen-T-Kreuzung`, 
		EN : `Turnout lantern as property/T-crossing`, 
		FR : `Lanterne d'aiguillage comme immobilier/carrefour en T`,  
	},
	Doppelkreuzungsweiche : {
		DE : `Doppelkreuzungsweiche`, 
		EN : `Double slip switch`, 
		FR : `Traversée jonction`,  
	},
	'Straßen-T-Kreuzung' : {
		DE : `Straßen-T-Kreuzung`, 
		EN : `T-road crossing`, 
		FR : `Carrefour routier en T`, 
	},
	'Weiche/Signal' : {
		DE : `Weiche/Signal`, 
		EN : `Switch/Signal`, 
		FR : `Aiguillage/Signal`, 
	},
	'Fahrzeug +$1 km/h max' : {
		DE : `Fahrzeug +$1 km/h max`, 
		EN : `Vehicle +$1 km/h max`, 
		FR : `Véhicule +$1 km/h max`, 
	},
	'Fahrzeug +$1 km/h min' : {
		DE : `Fahrzeug +$1 km/h min`, 
		EN : `Vehicle +$1 km/h min`, 
		FR : `Véhicule +$1 km/h min`, 
	},
	'Fahrzeug +$1 km/h soll' : {
		DE : `Fahrzeug +$1 km/h soll`, 
		EN : `Vehicle +$1 km/h setpoint`, 
		FR : `Véhicule +$1 km/h consigne`, 
	},
	'Fahrzeug -$1 km/h max' : {
		DE : `Fahrzeug -$1 km/h max`, 
		EN : `Vehicle -$1 km/h max`, 
		FR : `Véhicule -$1 km/h max`, 
	},
	'Fahrzeug -$1 km/h min' : {
		DE : `Fahrzeug -$1 km/h min`, 
		EN : `Vehicle -$1 km/h min`, 
		FR : `Véhicule -$1 km/h min`, 
	},
	'Fahrzeug -$1 km/h soll' : {
		DE : `Fahrzeug -$1 km/h soll`, 
		EN : `Vehicle -$1 km/h setpoint`, 
		FR : `Véhicule -$1 km/h consigne`, 
	},
	'Halt $1 m' : {
		DE : `Halt $1 m`, 
		EN : `Stop $1 m`, 
		FR : `Arrêt $1 m`, 
	},
	Omegas : {
		DE : `Omegas`, 
		EN : `Omegas`, 
		FR : `Omégas`, // Personnages / Humains
	},
	Sound : {
		DE : `Sound`, 
		EN : `Sound`, 
		FR : `Son`, 
	},
	'DKW/EKW' : {
		DE : `DKW/EKW`, 
		EN : `DSS/SSS`, 
		FR : `TJD/TJS`, 
	},
	'Depot' : {
		DE : `Depot`, 
		EN : `Depot`, 
		FR : `Dépôt`, 
	},
	'Depots' : {
		DE : `Depots`, 
		EN : `Depots`, 
		FR : `Dépôts`, 
	},
	'Zugverbände in Depots' : {
		DE : `Zugverbände in Depots`, 
		EN : `Train sets in depots`, 
		FR : `Convoi ferroviaires dans les dépôts`, 
	},
	'Status' : {
		DE : `Status`, 
		EN : `Status`, 
		FR : `Statut`, 
	},
	'Anzahl Zugverbände' : {
		DE : `Anzahl Zugverbände`, 
		EN : `Number of train sets`, 
		FR : `Nombre de convoi ferroviaire`, 
	},
	'Einfahrt Depot' : {
		DE : `Einfahrt Depot`, 
		EN : `Entrance depot`, 
		FR : `Entrée dépôt`, 
	},
	'Ausfahrt Depot' : {
		DE : `Ausfahrt Depot`, 
		EN : `Exit depot`, 
		FR : `Sortie dépôt`, 
	},
	'Auto-Auslass' : {
		DE : `Auto-Auslass`, 
		EN : `Auto outlet`, 
		FR : `Prise automatique`, 
	},
	'Auto-Zeit nach' : {
		DE : `Auto-Zeit nach`, 
		EN : `Auto time after`, 
		FR : `Temps automatique après`, 
	},
	'Zufall' : {
		DE : `Zufall`, 
		EN : `Chance`, 
		FR : `Coïncidence`, 
	},
	'Abfahrtzeit' : {
		DE : `Abfahrtzeit`, 
		EN : `Departure time`, 
		FR : `Heure de départ`, 
	},
	'individuelle Abfahrtzeit' : {
		DE : `Individuelle Abfahrtzeit`, 
		EN : `Individual departure time`, 
		FR : `Heure de départ individuelle`, 
	},
	'Signalgesteuert' : {
		DE : `Signalgesteuert`, 
		EN : `Signal controlled`, 
		FR : `Signal contrôlé`, 
	},
	'Warten' : {
		DE : `Warten`, 
		EN : `Waiting`, 
		FR : `En attendant`, 
	},
	'In Fahrt' : {
		DE : `In Fahrt`, 
		EN : `In motion`, 
		FR : `En mouvement`, 
	},
	'Richtung' : {
		DE : `Richtung`, 
		EN : `Direction`, 
		FR : `Direction`, 
	},
	'eins' : {
		DE : `eins`, 
		EN : `one`, 
		FR : `une`, 
	},
	'zwei' : {
		DE : `zwei`, 
		EN : `two`, 
		FR : `deux`, 
	},
	Animationen : {
		DE : `Animationen`, 
		EN : `Animations`, 
		FR : `Animations`, 
	},
	'Gruppen-Kontaktpunkt' : {	// Kontaktpunkt
		DE : `Gruppen-Kontaktpunkt`, 
		EN : `Group contact point`, 
		FR : `Groupe de contacts`,
	},
	'keine Perspektive festgelegt' : {	// Kameraperspektive
		DE : `keine Perspektive festgelegt`, 
		EN : `no perspective set`, 
		FR : `Perspective non définie`,  
	},
	'Fahrzeug von links' : {
		DE : `Fahrzeug von links`, 
		EN : `Vehicle from the left`, 
		FR : `Véhicule de gauche`, 
	},
	'Fahrzeug von rechts' : {
		DE : `Fahrzeug von rechts`, 
		EN : `Vehicle from the right`, 
		FR : `Véhicule de droite`, 
	},
	'Fahrzeug von links oben' : {
		DE : `Fahrzeug von links oben`, 
		EN : `Vehicle from top left`, 
		FR : `Véhicule d'en haut à gauche`, 
	},
	'Fahrzeug von rechts oben' : {
		DE : `Fahrzeug von rechts oben`, 
		EN : `Vehicle from top right`, 
		FR : `Véhicule d'en haut à droite`, 
	},
	'Sicht in Fahrtrichtung' : {
		DE : `Sicht in Fahrtrichtung`, 
		EN : `View in the direction of travel`, 
		FR : `Vue dans le sens de marche`, 
	},
	'Rückwärtige Sicht' : {
		DE : `Rückwärtige Sicht`, 
		EN : `Rear view`, 
		FR : `Vue arrière`, 
	},
	Folgemodus : {
		DE : `Folgemodus`, 
		EN : `Follow mode`, 
		FR : `Mode suivi`, 
	},
	'Sicht in Kabine' : {
		DE : `Sicht in Kabine`, 
		EN : `View into the cabin`, 
		FR : `Vue dans la cabine`, 
	},
	Umschalter : {	// DKW/EKW Weichenstellung
		DE : `Umschalter`, 
		EN : `Change-over switch`, 
		FR : `Position suivante`, 
	},
	'links-links' : {
		DE : `links-links`, 
		EN : `left-left`, 
		FR : `gauche-gauche`, 
	},
	'links-rechts' : {
		DE : `links-rechts`, 
		EN : `left-right`, 
		FR : `gauche-droite`, 
	},
	'rechts-rechts' : {
		DE : `rechts-rechts`, 
		EN : `right-right`, 
		FR : `droite-droite`, 
	},
	'rechts-links' : {
		DE : `rechts-links`, 
		EN : `right-left`, 
		FR : `droite-gauche`, 
	},
	Spitze : {	// Train side
		DE : `Spitze`, 
		EN : `Front`, 
		FR : `Tête`, 
	},
	'Schluss' : {
		DE : `Schluss`, 
		EN : `End`, 
		FR : `Fin`, 
	},
	virtuell : {	// Gleisverbindung
		DE : `virtuell`, 
		EN : `virtual`, 
		FR : `virtuel`, 
	},
	
	// EEP_Inventar.html

	'EEP-Version' : {
		DE : `EEP-Version`,
		EN : `EEP-version`,
		FR : `Version d'EEP`,
	},
	Anzahl : {
		DE : `Anzahl`,
		EN : `Number`,
		FR : `Nombre`,
	},
	'Anzahl Objekte' : {
		DE : `Anzahl Objekte`,
		EN : `Number of objects`,
		FR : `Nombre d'objets`,
	},
	'Anzahl Gleise' : {
		DE : `Anzahl Gleise`,
		EN : `Number of tracks`,
		FR : `Nombre de voies`,
	},
	'Anzahl Rollmaterialien' : {
		DE : `Anzahl Rollmaterialien`,
		EN : `Number of rolling stock`,
		FR : `Nombre de matériel roulant`,
	},
	'Anzahl Signalstellungen' : {
		DE : `Anzahl Signalstellungen`,
		EN : `Number of signals`,
		FR : `Nombre de signaux`,
	},
	'Anzahl Fahrstraßen' : {
		DE : `Anzahl Fahrstraßen`,
		EN : `Number of driveways`,
		FR : `Nombre d'itinéraires`,
	},
	Breite : {	// Dimension der Anlage in x-Richtung
		DE : `Breite`,
		EN : `Width`,
		FR : `Largeur`,
	},
	Tiefe : { // Dimension der Anlage in y-Richtung
		DE : `Tiefe`,
		EN : `Depth`,
		FR : `Profondeur`,
	},
	'Verwendeter Bereich' : {
		DE : `Verwendeter Bereich`,
		EN : `Used range`,
		FR : `Plage utilisée`,
	},
	'Min./max Höhe' : {
		DE : `Min./max Höhe`,
		EN : `Min./max height`,
		FR : `Hauteur min./max`,
	},
	GleisData : {
		DE : `Gleis-Daten`,
		EN : `Track-data`,
		FR : `Données de voie`,
	},
	'nicht vorhanden' : {
		DE : `nicht vorhanden`,
		EN : `not present`,
		FR : `absent`,
	},
	TipTxt : {
		DE : `Tipp-Text`,
		EN : `Tip's text`,
		FR : `Info-texte`,
	},
	virtualConnections : {
		DE : `Virtuelle Verbindungen`, 
		EN : `Virtual Connections`, 
		FR : `Connexions virtuelles`, 
	},
	Anschluss : {
		DE : `Anschluss`, 
		EN : `Connection`, 
		FR : `Connexion`, 
	},
	Zugverband : {
		DE : `Zugverband`,
		EN : `Train set`,
		FR : `Convoi ferroviaire`,
	},
	'Zugverbände' : {
		DE : `Zugverbände`,
		EN : `Train sets`,
		FR : `Convois ferroviaires`,
	},
	'Ausrichtung' : {
		DE : `Ausrichtung`,
		EN : `Orientation`,
		FR : `Orientation`,
	},
	Geschwindigkeit : {
		DE : `Geschwindigkeit`,
		EN : `Speed`,
		FR : `Vitesse`,
	},
	Sollgeschwindigkeit : {
		DE : `Sollgeschwindigkeit`,
		EN : `Nominal speed`,
		FR : `Vitesse-cible`,
	},
	Automatik : {
		DE : `Automatik`,
		EN : `Automatic`,
		FR : `Automatique`,
	},
	'Rollmaterialien' : {
		DE : `Rollmaterialien`,
		EN : `Rolling stock`,
		FR : `Matériel roulant`,
	},
	'Angetrieben' : {	//### new
		DE : `Angetrieben`,
		EN : `Propelled`,
		FR : `propulsé`,
	},
	'Leistung' : {	//### new
		DE : `Leistung (kW)`,
		EN : `Power (kW)`,
		FR : `Puissance kW`,
	},
	'vUeberhang' : {	//### new
		DE : `Vorderer Überhang (cm)`,
		EN : `Front overhang (cm)`,
		FR : `Porte-à-faux avant (cm)`,
	},
	'hUeberhang' : {	//### new
		DE : `Hinterer Überhang (cm)`,
		EN : `Rear overhang (cm)`,
		FR : `Porte-à-faux arrière (cm)`,
	},
	'RollIdx' : {	//### new
		DE : `RollIdx`,
		EN : `RollIdx`,
		FR : `RollIdx`,
	},
	'Filter' : {
		DE : `Filter`,
		EN : `Filter`,
		FR : `Filtre`,
	},
	'Filter aktiv' : {
		DE : `Filter aktiv`,
		EN : `Filter activ`,
		FR : `Filtre actif`,
	},
	'Filter löschen' : {
		DE : `Filter löschen`,
		EN : `Clear filters`,
		FR : `Effacer filtres`,
	},
	'Filter-Operatoren' : {
		DE : `Filter-Operatoren`,
		EN : `Filter-operators`,
		FR : `Opérateurs filtres`,
	},
	nicht : { // logical operator
		DE : `nicht`,
		EN : `not`,
		FR : `non`,
	},
	oder : { // logical operator
		DE : `oder`,
		EN : `or`,
		FR : `ou`,
	},
	und : {	// logical operator
		DE : `und`,
		EN : `and`,
		FR : `et`,
	},
	'beginnt mit' : { // Filter expression
		DE : `beginnt mit`,
		EN : `starting with`,
		FR : `commençant par`,
	},
	'endet mit' : {	 // Filter expression
		DE : `endet mit`,
		EN : `ending with`,
		FR : `se terminant par`,
	},
	'Weitere Informationen' : {
		DE : `Weitere Informationen`,
		EN : `Further informations`,
		FR : `Informations supplémentaires`,
	},
	'Keine zum Filter passende Einträge vorhanden' : {
		DE : `Keine zum Filter passende Einträge vorhanden`,
		EN : `No suitable records present for filtering`,
		FR : `Aucun enregistrement présent adapté au filtre`,
	},
	'Sichbarkeit der Spalten verwalten' : {
		DE : `Sichbarkeit der Spalten verwalten`,
		EN : `Manage the visibility of the columns`,
		FR : `Gérer la visibilité des colonnes`,
	},
	'Spalten verstecken' : {
		DE : `Spalten verstecken`,
		EN : `Hide columns`,
		FR : `Cacher les colonnes`,
	},
	'Versteckte Spalten' : {
		DE : `Versteckte Spalten`,
		EN : `Hidden columns`,
		FR : `Colonnes cachées`,
	},
	'Schließen' : {
		DE : `Schließen`,
		EN : `Close`,
		FR : `Fermer`,
	},
	'Alle auswählen' : {
		DE : `Alle auswählen`,
		EN : `Select all`,
		FR : `Sélectionner tout`,
	},
	'Sichtbarkeit der Filter' : {
		DE : `Sichtbarkeit der Filter`,
		EN : `Visibility of the filters`,
		FR : `Visibilité des filtres`,
	},
	'Weiche ist verknüpft mit Signal/Weiche' : {	// SignalData
		DE : `Weiche ist verknüpft mit Signal/Weiche`,
		EN : `Switch is linked to signal/Switch`,
		FR : `L'aiguillage est lié au signal ou à l'aiguillage`,
	},
	'Signal ist verknüpft mit Signal/Weiche' : {	// SignalData
		DE : `Signal ist verknüpft mit Signal/Weiche`,
		EN : `Signal is linked to signal/Switch`,
		FR : `Le signal est lié au signal ou à l'aiguillage`,
	},
	'Wenn Weiche auf "Durchfahrt" steht dann verknüpfte ID in angegebene Stellung schalten' : {	// NextSigFn1
		DE : `Wenn die Weiche auf "Durchfahrt" steht, dann verknüpfte ID in angegebene Stellung schalten`,
		EN : `If the switch is in position "Main line", then switch the linked ID to the given position`,
		FR : `Si l'aiguillage se trouve en positon "Branche principale", alors commuter l'ID connectée en la position indiquée`,
	},
	'Wenn Weiche auf "Abzweig" steht dann verknüpfte ID in angegebene Stellung schalten' : {	// NextSigFn2
		DE : `Wenn Weiche auf "Abzweig" steht dann verknüpfte ID in angegebene Stellung schalten`,
		EN : `If the switch is in position "Diverging line", then switch the linked ID to the given position`,
		FR : `Si l'aiguillage se trouve en positon "Embranchement", alors commuter l'ID connectée en la position indiquée`,
	},
	Fahrt: {	// Signals
		DE: `Fahrt`,
		EN: `Go`,		// `Clear`, `Open` 
		FR: `Voie libre`,
	},
	Halt: {
		DE: `Halt`,
		EN: `Stop`,		// `Danger`, `Close` 
		FR: `Arrêt`,
	},
// begin of not used signal positions
	'Fahrt - Fahrt erwarten': {
		DE: `Fahrt - Fahrt erwarten`,
		EN: ``,
		FR: ``,
	},
	'Fahrt - Fahrt mit $1km/h erwarten': {
		DE: `Fahrt - Fahrt mit $1km/h erwarten`,
		EN: ``,
		FR: ``,
	},
	'Fahrt - Halt erwarten': {
		DE: `Fahrt - Halt erwarten`,
		EN: ``,
		FR: ``,
	},
	'Fahrt dann Fahrt': {
		DE: `Fahrt dann Fahrt`,
		EN: ``,
		FR: ``,
	},
	'Fahrt dann $1km/h': {
		DE: `Fahrt dann $1km/h`,
		EN: ``,
		FR: ``,
	},
	'Fahrt dann Fahrt mit $1km/h': {
		DE: `Fahrt dann Fahrt mit $1km/h`,
		EN: ``,
		FR: ``,
	},
	'Fahrt dann Halt': {
		DE: `Fahrt dann Halt`,
		EN: ``,
		FR: ``,
	},
	'Fahrt mit $1km/h': {
		DE: `Fahrt mit $1km/h`,
		EN: `Slow at $1km/h`,
		FR: `Marche à vue $1km/h`,
	},
	'Fahrt mit $1km/h - Fahrt erwarten': {
		DE: `Fahrt mit $1km/h - Fahrt erwarten`,
		EN: ``,
		FR: ``,
	},
	'Fahrt mit $1km/h - Fahrt mit $2km/h erwarten': {
		DE: `Fahrt mit $1km/h - Fahrt mit $2km/h erwarten`,
		EN: ``,
		FR: ``,
	},
	'Fahrt mit $1km/h - Halt erwarten': {
		DE: `Fahrt mit $1km/h - Halt erwarten`,
		EN: ``,
		FR: ``,
	},
	'Fahrt mit $1km/h dann Fahrt': {
		DE: `Fahrt mit $1km/h dann Fahrt`,
		EN: ``,
		FR: ``,
	},
	'Fahrt mit $1km/h dann $2km/h': {
		DE: `Fahrt mit $1km/h dann $2km/h`,
		EN: ``,
		FR: ``,
	},
	'Fahrt mit $1km/h dann Fahrt mit $2km/h': {
		DE: `Fahrt mit $1km/h dann Fahrt mit $2km/h`,
		EN: ``,
		FR: ``,
	},
	'Fahrt mit $1km/h dann Halt': {
		DE: `Fahrt mit $1km/h dann Halt`,
		EN: ``,
		FR: ``,
	},
	'Sh1 - Rangierfahrt': {
		DE: `Sh1 - Rangierfahrt`,
		EN: ``,
		FR: ``,
	},
	'Fahrt, Grün': { // Ampel
		DE: `Fahrt, Grün`,
		EN: `Green`,
		FR: ``,
	},
	'Halt, Gelb': { // Ampel
		DE: `Halt, Gelb`,
		EN: `Yellow`,
		FR: ``,
	},
	'Halt, Rot': { // Ampel
		DE: `Halt, Rot`,
		EN: `Red`,
		FR: ``,
	},
	'Max. Geschwindigkeit 50 km/h, Gelb blinkend': { // Ampel
		DE: `Max. Geschwindigkeit 50 km/h, Gelb blinkend`,
		EN: `Yellow flashing`,
		FR: ``,
	},
	'Ziel': { // Schalter
		DE: `Ziel`,
		EN: ``,
		FR: ``,
	},
	'frei': { // Schalter
		DE: `frei`,
		EN: ``,
		FR: ``,
	}, // Schalter
	'eingestellt': {
		DE: `eingestellt`,
		EN: ``,
		FR: ``,
	},
	'Störung': { // Schalter
		DE: `Störung`,
		EN: ``,
		FR: ``,
	},
// end of not used signal positions

	X : {
		DE : ``, 
		EN : ``, 
		FR : ``, 
	},
},
/*
Additional texts in EEP_Gleisplan.html and EEP_Inventar.html

<span lang="de">EEP-Gleisplan</span>
<span lang="en">EEP Track plan</span>
<span lang="fr">EEP Plan des voies</span>

<span lang="de">EEP-Inventar</span>
<span lang="en">EEP Inventory</span>
<span lang="fr">EEP Inventaire</span>

<span lang="de">Lade</span>
<span lang="en">Load</span>
<span lang="fr">Charge</span>

<span lang="de">Tauschen</span>
<span lang="en">Swap</span>
<span lang="fr">Échanger</span>

<span lang="de">Export</span>	// Short text because it's used on a button
<span lang="en">Export</span>
<span lang="fr">Exp.</span>

<span lang="de">Farben</span>
<span lang="en">Colours</span>
<span lang="fr">Couleurs</span>

<span lang="de">Zoom zurücksetzen</span>	// Short text because it's used on a button
<span lang="en">Reset zoom</span>
<span lang="fr">Réinit. le zoom</span>

<span lang="de">Alles zurücksetzen</span>	// Short text because it's used on a button
<span lang="en">Reset all</span>
<span lang="fr">Réinit. tout</span>

<span lang="de">Linie</span>
<span lang="en">Line</span>
<span lang="fr">Ligne</span>

<span lang="de">Schrift</span>
<span lang="en">Font</span>
<span lang="fr">Écriture</span>

<span lang="de">Zeige Objekt</span>
<span lang="en">Show object</span>
<span lang="fr">Afficher l'objet</span>

<span lang="de">Min/Max Höhe der Anlage</span>
<span lang="en">Min / Max height of the system</span>
<span lang="fr">Hauteur min / max du système</span>

<span lang="de">Sichtbarer Bereich</span>
<span lang="en">Visible area</span>
<span lang="fr">Zone visible</span>

<span lang="de">Zentrum des Bereichs</span>
<span lang="en">Center of the area</span>
<span lang="fr">Centre de la zone</span>

<span lang="de">Cursor</span>
<span lang="en">Cursor</span>
<span lang="fr">Curseur</span>

<span lang="de">Gleis ID</span>
<span lang="en">Track ID</span>
<span lang="fr">ID de voie</span>

<span lang="de">Weichen</span>
<span lang="en">Switches</span>
<span lang="fr">Aiguilles</span>

<span lang="de">Signale</span>
<span lang="en">Signals</span>
<span lang="fr">Signaux</span>

<span lang="de">Kontakte</span>
<span lang="en">Contacts</span>
<span lang="fr">Contacts</span>

<span lang="de">aktiv</span>
<span lang="en">active</span>
<span lang="fr">actif</span>

<span lang="de">inaktiv</span>
<span lang="en">inactive</span>
<span lang="fr">inactif</span>

<span lang="de">unsichtbar</span>
<span lang="en">invisible</span>
<span lang="fr">invisible</span>

<span lang="de">Marker</span>
<span lang="en">Marker</span>
<span lang="fr">Marqueurs</span>

<span lang="de">Gleisobjekte</span>
<span lang="en">Track objects</span>
<span lang="fr">Suivre l'objets</span>

<span lang="de">Kameras</span>
<span lang="en">Cameras</span>
<span lang="fr">Caméras</span>

<span lang="de">Rahmen</span>
<span lang="en">Frame</span>
<span lang="fr">Cadre</span>

*/

}

	// Get language of the browser: navigator.language (de, en_US ...)
	// Get language of the html document: document.documentElement.lang (as defined with html tag)
	
	const masterLanguage = 'DE';
	let language;
	function getLanguage() {
		if (!language) {
			language = localStorage.getItem("language");
			if (!language) {
				language = masterLanguage;
			}
		}
		return language;
	}
	function setLanguage(langu) {
		document.documentElement.lang = langu.toLowerCase();
		language = langu.toUpperCase();
		localStorage.setItem("language", language);
	}

	function getText(topic, key, ...args) {
		if ( texts[topic] && texts[topic][key] ) {
			// get text
			let text = texts[topic][key][language]
			// in case of missing translation get text in master language
			if (!text || text === ``) {
				text = texts[topic][key][masterLanguage];
			}
			// replace parameters $1 , $2 , ...
			let i = 1;
			for (const arg of args) {
				text = text.replace('$'+i, arg);
				i += 1;
			}
			return text;
		} else {
			return topic + '.' + key;
		} 
	}

	return {
		getLanguage : getLanguage,
		setLanguage : setLanguage,
		getText : getText,
	};

})();

function _(...args) {	// define shortcut
	return EEP_Texts.getText('info', ...args);
}
