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
	X : {
		DE : ``, 
		EN : ``, 
		FR : ``, 
	},
},
info : {
	Eisenbahn : {
		DE : `Eisenbahn`, 
		EN : `Railroad`, 
		FR : `Chemin de fer`, 
	},
	Strassenbahn : {
		DE : `Straßenbahn`, 
		EN : `Tram`, 
		FR : `Tram`, 
	},
	Strasse : {
		DE : `Straße`, 
		EN : `Road`, 
		FR : `Rue`, 
	},
	Wasserwege : {
		DE : `Wasserwege`, 
		EN : `Waterways`, 
		FR : `Voies navigables`, 
	},
	Steuerstrecken : {
		DE : `Steuerstrecken`, 
		EN : `Control routes`, 
		FR : `Contrôle d'itinéraires`, 
	},
	GBS : {
		DE : `Gleisbildstellpult`, 
		EN : `Track-control-desk`, 
		FR : `Tableau de commande optique`, 
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
		EN : `Track closure`,
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
		DE : `Stil`, 
		EN : `Style`, 
		FR : `Style`, 
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
		EN : `Thoroughfare`, 
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
		EN : `Predefined line`,
		FR : `Parcour prédéfini`,
	},
	'Fahrstraßen' : {
		DE : `Fahrstraßen`, 
		EN : `Predefined lines`,
		FR : `Parcours prédéfini`,
	},
	Route : { // 'Fahrstraßen' und 'Routen' sind in EEP verschiedene Objekte
		DE : `Route`, 
		EN : `Route`,
		FR : `Itinéraire`, 
	},
	Startsignal : {	// Startsignal einer Fahrstraße
		DE : `Startsignal`, 
		EN : `Start signal`, 
		FR : `Signal de démarrage`, 
	},
	Endesignal : {	// Endesignal einer Fahrstraße
		DE : `Endesignal`, 
		EN : `End signal`, 
		FR : `Signal de fin`, 
	},
	Zielsignal : {	// Zielsignal eines Kontaktes
		DE : `Zielsignal`, 
		EN : `Target signal`, 
		FR : `Signal cible`, 
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
	Kontakt : {
		DE : `Kontakt`, 
		EN : `Contact`, 
		FR : `Contact`, 
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
	Sekunden : {			// Sekunden
		DE : `Sekunden`, 
		EN : `seconds`, 
		FR : `secondes`, 
	},
	Kontakttyp : {
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
Beim Export wird die gesamte Graphik exportiert auch wenn dann nur der gewählte Ausschnitt gezeigt wird.<\/dd>
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
During export the whole graphic is exported, even if only a small selected part of the graphic is visible.<\/dd>
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
À l'exportation le graphique complet est exporté, même  si on ne voit que la partie sélectionnée.<\/dd>
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
		DE : `Weichenlaterne verstecken`, 
		EN : `Hide turnout lantern`, 
		FR : `Masquer la lanterne d'aiguillage`, 
	},
	'Weichenlaterne rechts' : {
		DE : `Weichenlaterne rechts`, 
		EN : `Turnout lantern on the right`, 
		FR : `Lanterne d'aiguillage à droite`, 
	},
	'Weichenlaterne links' : {
		DE : `Weichenlaterne links`, 
		EN : `Turnout lantern on the left`, 
		FR : `Lanterne d'aiguillage à gauche`, 
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
		FR : `Omégas`, 
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
	X : {
		DE : ``, 
		EN : ``, 
		FR : ``, 
	},
	XXX : {
		DE : `###de###`, 
		EN : `###en###`, 
		FR : `###fr###`, 
	},
},
/*
Additional texts in EEP_Gleisplan.html

<span lang="de">EEP-Gleisplan</span>
<span lang="en">EEP Track plan</span>
<span lang="fr">EEP Plan des voies</span>

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
