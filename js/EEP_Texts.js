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
	// EEP_Zip.js: Fehlertexte beim Laden
	'prefix' : {
		DE : `Fehler`,
		EN : `Error`,
		FR : `Erreur`,
	},
	'http' : {
		DE : `Der Server antwortete mit HTTP $1.`,
		EN : `The server answered with HTTP $1.`,
		FR : `Le serveur a répondu avec HTTP $1.`,
	},
	'http404' : {
		DE : `Der Server antwortete mit HTTP $1 (Datei nicht gefunden).`,
		EN : `The server answered with HTTP $1 (file not found).`,
		FR : `Le serveur a répondu avec HTTP $1 (fichier introuvable).`,
	},
	'http403' : {
		DE : `Der Server antwortete mit HTTP $1 (Zugriff verweigert).`,
		EN : `The server answered with HTTP $1 (access denied).`,
		FR : `Le serveur a répondu avec HTTP $1 (accès refusé).`,
	},
	'offline' : {
		DE : `Es besteht keine Internetverbindung.`,
		EN : `There is no internet connection.`,
		FR : `Il n'y a pas de connexion Internet.`,
	},
	'mixed' : {
		DE : `Eine http-URL kann nicht von einer https-Seite geladen werden (Mixed Content). Verwende eine https-URL.`,
		EN : `An http URL cannot be loaded from an https page (mixed content). Use an https URL.`,
		FR : `Une URL http ne peut pas être chargée depuis une page https (contenu mixte). Utilisez une URL https.`,
	},
	'file' : {
		DE : `Die URL konnte nicht geladen werden. Da das Programm direkt als Datei (file://) geöffnet wurde, blockiert der Browser den Zugriff, wenn der Server CORS nicht erlaubt (Access-Control-Allow-Origin). Lade die Datei herunter und wähle sie aus, oder öffne das Programm über einen Webserver.`,
		EN : `The URL could not be loaded. Because the program was opened directly as a file (file://), the browser blocks access unless the server allows CORS (Access-Control-Allow-Origin). Download the file and select it, or open the program via a web server.`,
		FR : `L'URL n'a pas pu être chargée. Le programme ayant été ouvert directement comme fichier (file://), le navigateur bloque l'accès si le serveur n'autorise pas CORS (Access-Control-Allow-Origin). Téléchargez le fichier et sélectionnez-le, ou ouvrez le programme via un serveur web.`,
	},
	'net' : {
		DE : `Die URL konnte nicht geladen werden: Der Server ist nicht erreichbar, die URL ist falsch, oder der Server erlaubt keinen Zugriff von dieser Seite aus (CORS).`,
		EN : `The URL could not be loaded: the server is unreachable, the URL is wrong, or the server does not allow access from this page (CORS).`,
		FR : `L'URL n'a pas pu être chargée : serveur inaccessible, URL incorrecte, ou le serveur n'autorise pas l'accès depuis cette page (CORS).`,
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
	TrackObjectNotExists : {
		DE : `Das Gleisobjekt $1 existiert nicht`, 
		EN : `The track object $1 does not exist`, 
		FR : `L'objet de la voie n'existe pas`, 
	},
	Positioning : {
		DE : `Positionierung auf $1 $2`, 
		EN : `Positioning on $1 $2`, 
		FR : `Positionnement sur $1 $2`, 
	},
	wrongCommand : {
		DE : `Unbekanntes/unvollständiges Kommando $1`, 
		EN : `Unknown/incomplete command $1`, 
		FR : `Commande inconnue/incomplète $1`, 
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
	LuaProgramBlockControl : {
		DE : `Lua-Programm für Modul 'blockControl.lua' für Gleisart '$1'`, 
		EN : `Lua program for module 'blockControl.lua' for track system '$1'`, 
		FR : `Programme Lua pour le module 'blockControl.lua' pour le système de voies '$1'`, 
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
		FR : `Itinéraires de contrôle`, 
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
		EN : `Buffer stop`,	// End track
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
	Icon : {
		DE : `Icon`, 
		EN : `Icon`, 
		FR : `Icône`, 
	},
	Reset : {
		DE : `Zurücksetzen`, 
		EN : `Reset`, 
		FR : `Réinitialiser`, 
	},
	'Kopfbereich einklappen' : {
		DE : `Kopfbereich einklappen`,
		EN : `Collapse header`,
		FR : `Replier l'en-tête`,
	},
	'Kopfbereich ausklappen' : {
		DE : `Kopfbereich ausklappen`,
		EN : `Expand header`,
		FR : `Déplier l'en-tête`,
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
	Gebaeudesammlung : {
		DE : `Gebäudesammlung`, 
		EN : `Building collection`, 
		FR : `Collection de bâtiments`, 
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
		EN : `Diverging route`, 
		FR : `Embranchement`, 
	},
	KoAbzweig : {	// Weichenstellung
		DE : `2. Abzweigung`, 
		EN : `2nd diverging route`, 
		FR : `2ème branche`, 
	},
	Spezial : {	// Weichenstellung
		DE : `Spezial`, 
		EN : `Special`, 
		FR : `Spécial`, 
	},
	EndeAbzweig : {	// track connection
		DE : `Abzweigung`, 
		EN : `Diverging route`, 
		FR : `Embranchement`, 
	},
	EndeKoAbzweig : {	// track connection
		DE : `2. Abzweigung`, 
		EN : `2nd diverging route`, 
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
	Modelltyp : {
		DE : `Modelltyp`, 
		EN : `Model type`, 
		FR : `Type de modèle`, 
	},
	modelType_1 : {
		DE : `Tenderlok`, 
		EN : `Tank locomotive`, 
		FR : `Locomotive-tender`, 
	},
	modelType_2 : {
		DE : `Schlepptenderlok`, 
		EN : `Tender locomotive`, 
		FR : `Locomotive à tender séparé`, 
	},
	modelType_3 : {
		DE : `Tender`, 
		EN : `Tender`, 
		FR : `Tender`, 
	},
	modelType_4 : {
		DE : `Elektrolok`, 
		EN : `Electric locomotive`, 
		FR : `Locomotive électrique`, 
	},
	modelType_5 : {
		DE : `Diesellok`, 
		EN : `Diesel locomotive`, 
		FR : `Locomotive diesel`, 
	},
	modelType_6 : {
		DE : `Triebwagen`, 
		EN : `Railcar`, 
		FR : `Autorail`, 
	},
	modelType_7 : {
		DE : `U- oder S-Bahn`, 
		EN : `Metro/suburban train`, 
		FR : `Métro ou train de banlieue`, 
	},
	modelType_8 : {
		DE : `Straßenbahn`, 
		EN : `Tram`, 
		FR : `Tramway`, 
	},
	modelType_9 : {
		DE : `Güterwaggon`, 
		EN : `Freight wagon`, 
		FR : `Wagon de marchandises`, 
	},
	modelType_10 : {
		DE : `Personenwaggon`, 
		EN : `Passenger wagon`, 
		FR : `Voiture voyageurs`, 
	},
	modelType_11 : {
		DE : `Luftfahrzeug`, 
		EN : `Aircraft`, 
		FR : `Aéronef`, 
	},
	modelType_12 : {
		DE : `Maschine (z.B. Kran)`, 
		EN : `Machine (e.g. crane)`, 
		FR : `Machine (p. ex. grue)`, 
	},
	modelType_13 : {
		DE : `Wasserfahrzeug`, 
		EN : `Ship`, 
		FR : `Bateau`, 
	},
	modelType_14 : {
		DE : `LKW`, 
		EN : `Truck`, 
		FR : `Camion`, 
	},
	modelType_15 : {
		DE : `PKW`, 
		EN : `Car`, 
		FR : `Voiture`, 
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
	'Hauptsignal' : {
		DE : `Hauptsignal`, 
		EN : `Main signal`, 
		FR : `Signal principal`, 
	},
	'Vorsignal' : {
		DE : `Vorsignal`, 
		EN : `Approach signal`, 
		FR : `Signal d'approche`,
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
	'Distanz zum Vorsignal' : {
		DE : `Distanz zum Vorsignal`, 
		EN : `Distance to the approach signal`, 
		FR : `Distance du signal d'approche`,
	},
	'Halteabstand' : {
		DE : `Halteabstand`, 
		EN : `Stopping distance`, 
		FR : `Distance de freinage`,
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
		FR : `Parcours prédéfini`,		// Itinéraire prédéfini
	},
	'Fahrstraßen' : {
		DE : `Fahrstraßen`, 
		EN : `Predefined lines`,		// Pre-set routes
		FR : `Parcours prédéfinis`,		// Itinéraires prédéfini
	},
	'zeigen' : { // Fahrstaßen werden in entsprechender Farbe angezeigt
		DE : `an`,
		EN : `on`,
		FR : `afficher`,
	},
	'verstecken' : { // Fahrstaßen werden nicht mehr in entsprechender Farbe angezeigt
		DE : `aus`,
		EN : `off`,
		FR : `masquer`,
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
	'Schaltverbindung' : {
		DE : `Schaltverbindung`,	// Schaltverbindung zu einem anderen Signal bzw. Weiche 
		EN : `Logic connection`, 	// Logic connection to another signal or switch
		FR : `Connexion logique`, 	// Connexion logique à une autre signalisation ou aiguillage
	},
	'Anzahl gekoppelter Stellungen' : { // zu einer Schaltverbindung zu einem anderen Signal bzw. Weiche 
		DE : `Anzahl gekoppelter Stellungen`, 
		EN : `Number of coupled positions`,
		FR : `Nombre de positions couplées`,
	},
	'Schaltet' : {
		DE : `Schaltet`, 
		EN : `Switches`, 
		FR : `Commute`, 
	},
	'Wird geschaltet von' : {
		DE : `Wird geschaltet von`, 
		EN : `Is switched by`, 
		FR : `Est commuté par`, 
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
	'Verfolgerkamera' : {
		DE : `Verfolgerkamera`,
		EN : `Follow camera`,
		FR : `Caméra de suivi`,
	},
	'KameraAufrufen' : {
		DE : `Kamera aufrufen`,
		EN : `Show camera`,
		FR : `Afficher la caméra`,
	},
	Sichtfeld : {
		DE : `Sichtfeld`,
		EN : `Field of view`,
		FR : `Champ de vision`,
	},
	Standard : {
		DE : `Standard`,
		EN : `default`,
		FR : `par défaut`,
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
	AxisPos : {
		DE : `Achsen - Position/Gruppe`, 
		EN : `Moveable elements - position/group`,
		FR : `Eléments mobiles - position/groupe`,
	},
	Achsengruppe : {
		DE : `Achsengruppe`, 
		EN : `Moveable elements group`,
		FR : `Groupe d'éléments mobiles`,
	},
	Ein : { // Ein - Aus
		DE : `Ein`, 
		EN : `On`,
		FR : `Activé`,
	},
	Achsenfilter : {
		DE : `Achsenfilter`,
		EN : `Moveable element filter`, 
		FR : `Filtre d'éléments mobiles`, 
	},	
	'Anzahl Achsen' : {
		DE : `Anzahl Achsen`,
		EN : `Count of moveable elements`, 
		FR : `Nombre d'éléments mobiles`, 
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
Nur Bilder in diesem Format können direkt in das <a $3>EEP-Forum<\/a> hochgeladen werden: <i>Die Bilder dürfen die Dateiendungen jpg, jpeg besitzen und sie dürfen maximal 2 MB groß sein. Die minimale Bildgröße beträgt 800×500 Pixel und die maximale Größe beträgt 1920×1080 Pixel.<\/i> Daher wird die Größe der exportierten Graphik nach Möglichkeit auf diese Werte begrenzt.<\/dd>
<dt>SVG<\/dt>
<dd>Beliebig zoombare, verlustfreie Vektor-Graphik; ideal zur Weiterverarbeitung in anderen Programmen<br>
Es wird nur der gewählte Ausschnitt exportiert.<\/dd>
<\/dl>
`, 
		EN : `
<p>Select the size $1 and the desired data format:<\/p>
<dl>
<dt>PNG<\/dt>
<dd>Loss-free pixel graphic format; ideal for computer graphics<\/dd>
<dt>JPG<\/dt>
<dd>Pixel-picture with quality-loss; ideal for photos.<br>
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
	'Fahrzeug' : {						// ID_CONTACT_COMBO_TXT4
		DE : `Fahrzeug`, 
		EN : `Vehicle`, 
		FR : `Véhicule`, 
	},
	'Fahrzeuge' : {
		DE : `Fahrzeuge`, 
		EN : `Vehicles`, 
		FR : `Véhicules`, 
	},
	'angetrieben' : {
		DE : `angetrieben`, 
		EN : `driven`, 
		FR : `entraîné`, 
	},
	'Geschwindigkeit' : {				// IDC_STATIC_SETSPEED	
		DE : `Geschwindigkeit`, 
		EN : `Speed`, 
		FR : `Vitesse`, 
	},
	'nicht langsamer als $1 km/h' : {	// IDC_RADIO_MIN
		DE : `nicht langsamer als $1 km/h`, 
		EN : `not slower than $1 km/h`, 
		FR : `pas moins de $1 km/h`, 
	},
	'nicht schneller als $1 km/h' : {	// IDC_RADIO_MAX
		DE : `nicht schneller als $1 km/h`, 
		EN : `not faster than $1 km/h`, 
		FR : `pas plus vite que $1 km/h`, 
	},
	'festlegen auf $1 km/h' : {			// IDC_RADIO_SET
		DE : `festlegen auf $1 km/h`, 
		EN : `set to $1 km/h`, 
		FR : `fixe $1 km/h`, 
	},
	'Fahrtrichtungsumkehr' : {			// IDC_CHECK_REVERSE
		DE : `Fahrtrichtungsumkehr`, 
		EN : `Reverse direction`, 
		FR : `Direction inverse`, 
	},
	'wiederherstellen' : {				// IDC_CHECK_SPEEDSAVE
		DE : `wiederherstellen`, 
		EN : `restore`, 
		FR : `restaure`, 
	},
	'vormerken' : {						// IDC_CHECK_SPEEDSAVE
		DE : `vormerken`, 
		EN : `store`, 
		FR : `mémorise`, 
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
		FR : `Convois ferroviaires dans les dépôts`, 
	},
	'Status' : {
		DE : `Status`, 
		EN : `Status`, 
		FR : `Statut`, 
	},
	'Anzahl Zugverbände' : {
		DE : `Anzahl Zugverbände`, 
		EN : `Number of train sets`, 
		FR : `Nombre de convois ferroviaires`, 
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
		EN : `Automatic release`, 
		FR : `Sortie automatique`, 
	},
	'Auto-Zeit nach' : {
		DE : `Auto-Zeit nach`, 
		EN : `Auto time after`, 
		FR : `Temps automatique après`, 
	},
	'Zufall' : {
		DE : `Zufall`, 
		EN : `Random`, 
		FR : `Aléatoire`, 
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
		EN : `Rear`, 
		FR : `Queue`, 
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
		EN : `Number of signal positions`,
		FR : `Nombre de positions du signal`,
	},
	'Anzahl Fahrstraßen' : {
		DE : `Anzahl Fahrstraßen`,
		EN : `Number of predefined lines`,
		FR : `Nombre d'itinéraires`,
	},
	'Anzahl wartender Zugverbände' : {
		DE : `Anzahl wartender Zugverbände`, 
		EN : `Number of waiting train sets`, 
		FR : `Nombre de trains en attente`,
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
	virtualConnection : {
		DE : `Virtuelle Verbindung zwischen`, 
		EN : `Virtual connection between`, 
		FR : `Connexion virtuelle entre`, 
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
	aktiverZugverband : {
		DE : `aktiver Zugverband`,
		EN : `Active train set`,
		FR : `Convoi ferroviaire actif`,
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
	Kupplung : {
		DE : `Kupplung`,
		EN : `Coupling`,
		FR : `Attelage`,
	},
	coupling_1 : {
		DE : `scharf`,
		EN : `active`,
		FR : `engagé`,
	},
	coupling_2 : {
		DE : `abstoßen`,
		EN : `inactive`,
		FR : `désengagé`,
	},
	coupling_3 : {
		DE : `gekuppelt`,
		EN : `coupled`,
		FR : `attelé`,
	},
	vorne : {
		DE : `vorne`,
		EN : `front`,
		FR : `avant`,
	},
	hinten : {
		DE : `hinten`,
		EN : `rear`,
		FR : `arrière`,
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
		EN : `Filter active`,
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
		EN : `Further information`,
		FR : `Informations supplémentaires`,
	},
	'Keine zum Filter passende Einträge vorhanden' : {
		DE : `Keine zum Filter passende Einträge vorhanden`,
		EN : `No suitable records present for filtering`,
		FR : `Aucun enregistrement présent adapté au filtre`,
	},
	'Sichtbarkeit der Spalten verwalten' : {
		DE : `Sichtbarkeit der Spalten verwalten`,
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
/* not needed anymore
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
*/
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
	// EEP_Export_Bridge.html, Kompass, Kurzformen
	'dir_W' : {
		DE : `W`,
		EN : `W`,
		FR : `O`,
	},
	'dir_WNW' : {
		DE : `WNW`,
		EN : `WNW`,
		FR : `ONO`,
	},
	'dir_NW' : {
		DE : `NW`,
		EN : `NW`,
		FR : `NO`,
	},
	'dir_NNW' : {
		DE : `NNW`,
		EN : `NNW`,
		FR : `NNO`,
	},
	'dir_N' : {
		DE : `N`,
		EN : `N`,
		FR : `N`,
	},
	'dir_NNO' : {
		DE : `NNO`,
		EN : `NNE`,
		FR : `NNE`,
	},
	'dir_NO' : {
		DE : `NO`,
		EN : `NE`,
		FR : `NE`,
	},
	'dir_ONO' : {
		DE : `ONO`,
		EN : `ENE`,
		FR : `ENE`,
	},
	'dir_O' : {
		DE : `O`,
		EN : `E`,
		FR : `E`,
	},
	'dir_OSO' : {
		DE : `OSO`,
		EN : `ESE`,
		FR : `ESE`,
	},
	'dir_SO' : {
		DE : `SO`,
		EN : `SE`,
		FR : `SE`,
	},
	'dir_SSO' : {
		DE : `SSO`,
		EN : `SSE`,
		FR : `SSE`,
	},
	'dir_S' : {
		DE : `S`,
		EN : `S`,
		FR : `S`,
	},
	'dir_SSW' : {
		DE : `SSW`,
		EN : `SSW`,
		FR : `SSO`,
	},
	'dir_SW' : {
		DE : `SW`,
		EN : `SW`,
		FR : `SO`,
	},
	'dir_WSW' : {
		DE : `WSW`,
		EN : `WSW`,
		FR : `OSO`,
	},
	'FStartKurz' : {
		DE : `Fs`,
		EN : `Ls`,
		FR : `Id`,
	},
	'FZielKurz' : {
		DE : `Fz`,
		EN : `Le`,
		FR : `Ia`,
	},
	'Fehler' : {
		DE : `Fehler`,
		EN : `Error`,
		FR : `Erreur`,
	},
	'Datei live verfolgen' : {
		DE : `Datei öffnen`, 		// `Datei live verfolgen`
		EN : `Open file`,			// `Follow file live`
		FR : `Ouvrir un fichier`,	// `Suivre le fichier en direct`
	},
	'alle' : {
		DE : `alle`,
		EN : `every`,
		FR : `toutes les`,
	},
	'URL abfragen' : {
		DE : `URL abfragen`,
		EN : `Poll URL`,
		FR : `Interroger l'URL`,
	},
	'an Gleisplan senden' : {
		DE : `an Gleisplan senden`,
		EN : `Send to track plan`,
		FR : `Envoyer au plan de voies`,
	},
	'Gleisplan öffnen' : {
		DE : `Gleisplan öffnen`,
		EN : `Open track plan`,
		FR : `Ouvrir le plan de voies`,
	},
	'Gleisbildstellpult öffnen' : {
		DE : `Gleisbildstellpult öffnen`,
		EN : `Open control desk`,
		FR : `Ouvrir le pupitre de commande`,
	},
	'keine Daten' : {
		DE : `keine Daten`,
		EN : `no data`,
		FR : `aucune donnée`,
	},
	'ZuletztURL' : {
		DE : `Zuletzt: URL $1`,
		EN : `Last: URL $1`,
		FR : `Dernier : URL $1`,
	},
	'ZuletztDatei' : {
		DE : `Zuletzt: Datei $1`,
		EN : `Last: file $1`,
		FR : `Dernier : fichier $1`,
	},
	'ZeitWetter' : {
		DE : `Zeit & Wetter`,
		EN : `Time & weather`,
		FR : `Heure & météo`,
	},
	'Züge' : {
		DE : `Züge`,
		EN : `Trains`,
		FR : `Trains`,
	},
	'Zug' : {
		DE : `Zug`,
		EN : `Train`,
		FR : `Train`,
	},
	'Folgen' : {
		DE : `Folgen`,
		EN : `Follow`,
		FR : `Suivre`,
	},
	'kein Zug' : {
		DE : `– kein Zug –`,
		EN : `– no train –`,
		FR : `– aucun train –`,
	},
	'sigNoteGleisplan' : {
		DE : `(Farben aus Gleisplan)`,
		EN : `(colours from track plan)`,
		FR : `(couleurs du plan de voies)`,
	},
	'sigNoteNeutral' : {
		DE : `(neutral – Gleisplan nicht verbunden)`,
		EN : `(neutral – track plan not connected)`,
		FR : `(neutre – plan de voies non connecté)`,
	},
	'Soll' : {
		DE : `Soll`,
		EN : `Target`,
		FR : `Cible`,
	},
	'Stellung' : {
		DE : `Stellung`,
		EN : `Position`,
		FR : `Position`,
	},
	'Zeige' : {
		DE : `Zeige`,
		EN : `Show`,
		FR : `Afficher`,
	},
	'GleisInfo' : {
		DE : `Gleis-Info`,
		EN : `Track info`,
		FR : `Info voie`,
	},
	'EEPZeit' : {
		DE : `EEP-Zeit`,
		EN : `EEP time`,
		FR : `Heure EEP`,
	},
	'Wolken' : {
		DE : `Wolken`,
		EN : `Clouds`,
		FR : `Nuages`,
	},
	'Nebel' : {
		DE : `Nebel`,
		EN : `Fog`,
		FR : `Brouillard`,
	},
	'Regen' : {
		DE : `Regen`,
		EN : `Rain`,
		FR : `Pluie`,
	},
	'Schnee' : {
		DE : `Schnee`,
		EN : `Snow`,
		FR : `Neige`,
	},
	'Hagel' : {
		DE : `Hagel`,
		EN : `Hail`,
		FR : `Grêle`,
	},
	'Wind' : {
		DE : `Wind`,
		EN : `Wind`,
		FR : `Vent`,
	},
	'Aktiver Zug' : {
		DE : `Aktiver Zug`,
		EN : `Active train`,
		FR : `Train actif`,
	},
	'Lok' : {
		DE : `Lok`,
		EN : `Loco`,
		FR : `Loco`,
	},
	'KupplungVH' : {
		DE : `Kupplung v/h`,
		EN : `Coupling f/r`,
		FR : `Attelage av/ar`,
	},
	'UngueltigesJSON' : {
		DE : `Ungültiges JSON`,
		EN : `Invalid JSON`,
		FR : `JSON invalide`,
	},
	'KeinEEPExport' : {
		DE : `Kein EEP-Export (global/trains fehlen)`,
		EN : `Not an EEP export (global/trains missing)`,
		FR : `Pas un export EEP (global/trains manquants)`,
	},
	'ExportStatus' : {
		DE : `Export von EEP-Zeit $1, letzte Änderung vor $2 s`,
		EN : `Export from EEP time $1, last change $2 s ago`,
		FR : `Export de l'heure EEP $1, dernier changement il y a $2 s`,
	},
	
	'CmdAktiv' : {
		DE : `Befehle an EEP aktiv`,
		EN : `Commands to EEP active`,
		FR : `Commandes vers EEP actives`,
	},
	'CmdGesendet' : {
		DE : `gesendet`,
		EN : `sent`,
		FR : `envoyé`,
	},
	'CmdFehler' : {
		DE : `Befehl nicht gesendet`,
		EN : `Command not sent`,
		FR : `Commande non envoyée`,
	},
	'CmdZeichen' : {
		DE : `Name oder Wert enthält nicht erlaubte Zeichen`,
		EN : `Name or value contains invalid characters`,
		FR : `Nom ou valeur avec caractères non autorisés`,
	},
	'CmdStellungSetzen' : {
		DE : `Stellung setzen`,
		EN : `Set position`,
		FR : `Régler la position`,
	},
	'CmdNichtVerfuegbar' : {
		DE : `Befehle an EEP sind nicht verfügbar`,
		EN : `Commands to EEP are not available`,
		FR : `Commandes vers EEP non disponibles`,
	},
	'CmdUngueltig' : {
		DE : `Ungültiger Befehl`,
		EN : `Invalid command`,
		FR : `Commande invalide`,
	},
	'Senden' : {
		DE : `Senden`,
		EN : `Send`,
		FR : `Envoyer`,
	},
	'CmdKeineAntwort' : {
		DE : `Keine Antwort der Export Bridge (ist sie geöffnet?)`,
		EN : `No answer from the Export Bridge (is it open?)`,
		FR : `Pas de réponse de l'Export Bridge (est-elle ouverte ?)`,
	},

	allowedBlocks : {
		DE : `Erlaubte Blöcke mit Wartezeit`, 
		EN : `Allowed blocks with wait time`, 
		FR : `Blocages autorisés avec temps d'attente`, 
	},
	
	X : {
		DE : ``, 
		EN : ``, 
		FR : ``, 
	},
	// EEP_GBS.html
	'gbs.on' : {
		DE : `Ein`,
		EN : `On`,
		FR : `Marche`,
	},
	'gbs.off' : {
		DE : `Aus`,
		EN : `Off`,
		FR : `Arrêt`,
	},
	'gbs.unknownSymbol' : {
		DE : `Symbol $1: Darstellung noch nicht bekannt`,
		EN : `Symbol $1: appearance unknown`,
		FR : `Symbole $1 : aspect inconnu`,
	},
	'gbs.showGbs' : {
		DE : `Als .gbs anzeigen`,
		EN : `Show as .gbs`,
		FR : `Afficher en .gbs`,
	},
	'gbs.showAnl3' : {
		DE : `Als anl3-Text anzeigen`,
		EN : `Show as anl3 text`,
		FR : `Afficher en texte anl3`,
	},
	'gbs.saveText' : {
		DE : `Text speichern`,
		EN : `Save text`,
		FR : `Enregistrer`,
	},
	'gbs.noDesks' : {
		DE : `Keine Stellpulte in dieser Anlage.`,
		EN : `No control desks in this layout.`,
		FR : `Aucun pupitre dans ce réseau.`,
	},
	'gbs.liveAge' : {
		DE : `Live-Daten vor $1 s`,
		EN : `Live data $1 s ago`,
		FR : `Données en direct il y a $1 s`,
	},
	'gbs.noLive' : {
		DE : `Keine Live-Daten – Export Bridge öffnen und „an Gleisplan senden“ einschalten`,
		EN : `No live data – open the Export Bridge and enable "Send to track plan"`,
		FR : `Pas de données en direct – ouvrir l'Export Bridge et activer « Envoyer au plan des voies »`,
	},
	'gbs.startSelected' : {
		DE : `Startsignal $1 gewählt – jetzt Zielsignal anklicken`,
		EN : `Start signal $1 selected – now click the end signal`,
		FR : `Signal de départ $1 choisi – cliquer sur le signal de fin`,
	},
	'gbs.clickStartFirst' : {
		DE : `Erst ein Startsignal (S) anklicken`,
		EN : `Click a start signal (S) first`,
		FR : `Cliquer d'abord sur un signal de départ (S)`,
	},
	'gbs.noRoute' : {
		DE : `Keine Fahrstraße von Signal $1 nach $2`,
		EN : `No predefined line from signal $1 to $2`,
		FR : `Aucun parcours prédéfini du signal $1 au signal $2`,
	},
	'gbs.noObjData' : {
		DE : `Keine Live-Daten zu diesem Objekt`,
		EN : `No live data for this object`,
		FR : `Pas de données en direct pour cet objet`,
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
<span lang="fr">Objets de voie</span>

<span lang="de">Kameras</span>
<span lang="en">Cameras</span>
<span lang="fr">Caméras</span>

<span lang="de">Rahmen</span>
<span lang="en">Frame</span>
<span lang="fr">Cadre</span>

*/

}
;

	// ---------------------------------------------------------------------------------------
	// Kern: Sprache, Texte holen, Platzhalter ersetzen, Sprachwechsel melden
	// ---------------------------------------------------------------------------------------
	const masterLanguage = 'DE';		// Ausgangssprache: fehlt eine Übersetzung, wird dieser Text verwendet
	const languages = [					// unterstützte Sprachen (Reihenfolge = Reihenfolge in der Dropdown-Liste)
		{ code: 'DE', name: 'Deutsch' },
		{ code: 'EN', name: 'English' },
		{ code: 'FR', name: 'Français' },
	];
	const listeners = [];				// Funktionen, die bei einem Sprachwechsel aufgerufen werden
	const warned = new Set();			// fehlende Texte nur einmal melden
	let language = null;

	// 'de', 'en-US', 'FR' ... -> 'DE' | 'EN' | 'FR', sonst null
	function normalize(code) {
		const c = String(code || '').slice(0, 2).toUpperCase();
		return languages.some(l => l.code === c) ? c : null;
	}

	function storedLanguage() {
		try { return normalize(localStorage.getItem("language")); } catch (e) { return null; }
	}

	// Sprache des Browsers (erste unterstützte Sprache aus navigator.languages), sonst Ausgangssprache
	function detectLanguage() {
		const preferred = (typeof navigator !== "undefined" && navigator.languages) ? navigator.languages : [];
		for (const code of preferred) {
			const c = normalize(code);
			if (c) { return c; }
		}
		return masterLanguage;
	}

	// Liefert 'DE', 'EN' oder 'FR' (Großbuchstaben wie bisher)
	function getLanguage() {
		if (!language) {
			language = storedLanguage() || detectLanguage();
		}
		return language;
	}

	// Sprache wechseln: Attribut lang setzen, speichern, Texte mit data-t neu setzen, Listener aufrufen
	function setLanguage(code) {
		const c = normalize(code);
		if (!c) { return; }

		const changed = (c !== getLanguage());
		language = c;
		document.documentElement.lang = c.toLowerCase();
		try { localStorage.setItem("language", c); } catch (e) {}
		syncSelects();

		if (changed) {
			apply();
			for (const fn of listeners.slice()) {
				try { fn(c); } catch (e) { console.error(e); }
			}
		}
	}

	// Registriert fn(sprache), die nach jedem Sprachwechsel aufgerufen wird (auch bei Wechsel in einem anderen Tab).
	// Mit runNow = true wird fn sofort einmal aufgerufen. Liefert eine Funktion zum Abmelden.
	function onChange(fn, runNow) {
		listeners.push(fn);
		if (runNow) { fn(getLanguage()); }
		return function() {
			const i = listeners.indexOf(fn);
			if (i >= 0) { listeners.splice(i, 1); }
		};
	}

	// Text in der aktuellen Sprache, ersatzweise in der Ausgangssprache; undefined wenn es ihn nicht gibt
	function lookup(topic, key) {
		const has = Object.prototype.hasOwnProperty;
		const entry = (has.call(texts, topic) && has.call(texts[topic], key)) ? texts[topic][key] : null;
		return entry ? (entry[getLanguage()] || entry[masterLanguage] || undefined) : undefined;
	}

	// Platzhalter $1, $2 ... in einem Durchlauf ersetzen: ein Argument, das selbst "$2" enthält, wird nicht nochmals ersetzt,
	// und $10 wird nicht als $1 + "0" missverstanden. Fehlt das Argument, bleibt der Platzhalter stehen.
	function format(text, args) {
		return text.replace(/\$(\d+)/g, (match, n) => (args[n - 1] !== undefined ? String(args[n - 1]) : match));
	}

	function getText(topic, key, ...args) {
		const text = lookup(topic, key);
		if (text === undefined) {
			const id = topic + '.' + key;
			if (!warned.has(id)) {
				warned.add(id);
				console.warn("EEP_Texts: Text fehlt: " + id);
			}
			return id;
		}
		return args.length ? format(text, args) : text;
	}

	// Text aus einem Objekt {DE, EN, FR} (oder einen String) in der aktuellen bzw. in der angegebenen Sprache.
	// Ersatz: Ausgangssprache, dann Englisch. Wird z.B. für die Signaldaten in EEP_Signale_Daten.js verwendet.
	function pick(obj, lang) {
		if (typeof obj === "string") { return obj; }
		if (!obj) { return ""; }
		const l = normalize(lang) || getLanguage();
		return obj[l] || obj[masterLanguage] || obj.EN || "";
	}

	// Name und Stellungstexte eines Signals; def = Eintrag aus Signalstellung[Dateiname] (oder undefined)
	function signalName(def) {
		return pick(def && def.Name);
	}
	function signalPosition(def, position) {
		const text = pick(def && def.Pos && def.Pos[position]);
		if (text === "Fahrt") { return getText('info', 'Fahrt'); }		// Standardtexte übersetzen
		if (text === "Halt")  { return getText('info', 'Halt'); }
		return text;
	}

	// ---------------------------------------------------------------------------------------
	// DOM: Texte mit data-t, Dropdown-Liste für die Sprache
	// ---------------------------------------------------------------------------------------
	// <span data-t="Schlüssel"> setzt den Text, data-t-title den Tooltip, data-t-placeholder den Platzhalter (Topic 'info')
	function apply(root) {
		root = root || document;
		root.querySelectorAll("[data-t]").forEach(e => { e.textContent = getText('info', e.dataset.t); });
		root.querySelectorAll("[data-t-title]").forEach(e => { e.title = getText('info', e.dataset.tTitle); });
		root.querySelectorAll("[data-t-placeholder]").forEach(e => { e.placeholder = getText('info', e.dataset.tPlaceholder); });
	}

	// Jedes <select data-lang-select> wird mit den Sprachen gefüllt und auf die aktuelle Sprache gestellt.
	// Die Optionen tragen bewusst kein lang-Attribut, sonst würde die CSS-Regel sie ausblenden.
	function syncSelects() {
		document.querySelectorAll("select[data-lang-select]").forEach(sel => {
			if (!sel.options.length) {
				for (const l of languages) { sel.add(new Option(l.name, l.code)); }
			}
			sel.value = getLanguage();
		});
	}

	function init() {
		syncSelects();
		apply();
	}

	document.documentElement.lang = getLanguage().toLowerCase();	// so früh wie möglich, damit nichts flackert

	// Auswahl in der Dropdown-Liste (Event-Delegation: gilt auch für später eingefügte Listen)
	document.addEventListener("change", ev => {
		const sel = ev.target && ev.target.closest && ev.target.closest("select[data-lang-select]");
		if (sel) { setLanguage(sel.value); }
	});

	// Sprachwechsel in einem anderen Tab übernehmen (das Ereignis kommt nur bei geänderten Werten, daher keine Schleife)
	if (typeof window !== "undefined") {
		window.addEventListener("storage", ev => {
			if (ev.key === "language" && normalize(ev.newValue)) { setLanguage(ev.newValue); }
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}

	return {
		getLanguage : getLanguage,
		setLanguage : setLanguage,
		getText : getText,
		pick : pick,
		signalName : signalName,
		signalPosition : signalPosition,
		apply : apply,
		onChange : onChange,
		masterLanguage : masterLanguage,
		languages : languages.map(l => ({ code: l.code, name: l.name })),
	};

})();

function _(...args) {	// define shortcut
	return EEP_Texts.getText('info', ...args);
}
