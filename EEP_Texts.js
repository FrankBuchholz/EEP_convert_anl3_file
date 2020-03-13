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
		DE : `Das Gleissystem $1 $2 existiert nicht`, 
		EN : `The track system $1 $2 does not exists`, 
		FR : `Le système de rails $1 $2 n'existe pas`, 
	},
	TrackNotExists : {
		DE : `Das Gleis $1 existiert nicht`, 
		EN : `The track $1 does not exists`, 
		FR : `La piste $1 n'existe pas`, 
	},
	SignalSwitchNotExists : {
		DE : `Das Signal bzw. die Weiche $1 existiert nicht`, 
		EN : `The signal respective switch $1 does not exists`, 
		FR : `La signal / commutateur $1 n'existe pas`, 
	},
	SignalLocation : {
		DE : `Das Signal $1 befindet sich auf $2 $3`, 
		EN : `The signal $1 is located at $2 $3`, 
		FR : ``, 
	},
	SwitchLocation : {
		DE : `Die Weiche $1 befindet sich auf $2 $3`, 
		EN : `The switch $1 is located at $2 $3`, 
		FR : ``, 
	},
	ContactLocation : {
		DE : `Der Kontakt befindet sich auf $1 $2`, 
		EN : `The contact is located at $1 $2`, 
		FR : ``, 
	},
	Camera : {
		DE : `Kamera $1`, 
		EN : `Camera $1`, 
		FR : `Caméra $1`, 
	},
	CameraNotExists : {
		DE : `Die Kamera $1 existiert nicht`, 
		EN : `The camera $1 does not exists`, 
		FR : ``, 
	},

	Positioning : {
		DE : `Positionierung auf $1 $2`, 
		EN : `Positioning on $1 $2`, 
		FR : `Positionnement sur $1 $2`, 
	},
},
info : {
	Gleisobjekt : {
		DE : `Gleisobjekt`, 
		EN : `Track object`, 
		FR : `Suivre l'objet`, 
	},
	Immobilie : {
		DE : `Immobilie`, 
		EN : `Real estate`, 
		FR : `L'immobilier`, 
	},
	Stil : {	// Gleisstil, attribute: stil
		DE : `Stil`, 
		EN : `Style`, 
		FR : `Le style`, 
	},
	Position : {
		DE : `Position`, 
		EN : `Position`, 
		FR : `Poste`, 
	},
	Anfang : {	// used to name track connection, too
		DE : `Anfang`, 
		EN : `Front`, 
		FR : `De face`, 
	},
	Mitte : {
		DE : `Mitte`, 
		EN : `Center`, 
		FR : `Centre`, 
	},
	Ende : {	// used to name track connection, too
		DE : `Ende`, 
		EN : `End`, 
		FR : `Fin`, 
	},
	EndeAbzweig : {	// track connection
		DE : `Abzweigung`, 
		EN : `Junction`, 
		FR : `Jonction`, 
	},
	EndeKoAbzweig : {	// track connection
		DE : `2. Abzweigung`, 
		EN : `2nd junction`, 
		FR : `2ème jonction`, 
	},
	Gleisart : {	// attribute: clsid
		DE : `Gleisart`, 
		EN : `Track type`, 
		FR : `Type de piste`, 
	},
	Datei : {		// attribute: gsbname
		DE : `Datei`, 
		EN : `File`, 
		FR : `Fichier`, 
	},
	'Länge' : {
		DE : `Länge`, 
		EN : `Length`, 
		FR : `La longueur`, 
	},
	'Höhe' : {
		DE : `Höhe`, 
		EN : `Height`, 
		FR : `La hauteur`, 
	},
	Kurventyp : {
		DE : `Kurventyp`, 
		EN : `Curve type`, 
		FR : `Type de courbe`, 
	},
	Weiche : {
		DE : `Weiche`, 
		EN : `Switch`, 
		FR : `Commutateur`, 
	},
	Weichenstellung : {
		DE : `Weichenstellung`, 
		EN : `Setting the course`, 
		FR : `Fixer le cap`, 
	},
	Kontaktziel : {
		DE : `Kontaktziel`, 
		EN : `Contact target`, 
		FR : `Cible de contact`, 
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
	Signalstellung : {
		DE : `Signalstellung`, 
		EN : `Signaling`, 
		FR : `Signalisation`, 
	},
	'Distanz zum Hauptsignal' : {
		DE : `Distanz zum Hauptsignal`, 
		EN : `Distance to the main signal`, 
		FR : `Distance au signal principal`, 
	},
	Gleisrichtung : {
		DE : `Gleisrichtung`, 
		EN : `Track direction`, 
		FR : `Direction de la piste`, 
	},
	'in Gleisrichtung' : {
		DE : `in Gleisrichtung`, 
		EN : `in the direction of the track`, 
		FR : `en direction de la piste`, 
	},
	'gegen Gleisrichtung' : {
		DE : `gegen Gleisrichtung`, 
		EN : `against track direction`, 
		FR : `contre la direction de la piste`, 
	},
	'beide Richtungen' : {
		DE : `beide Richtungen`, 
		EN : `both track directions`, 
		FR : `les deux directions de piste`, 
	},
	'Fahrstraßen' : {
		DE : `Fahrstraßen`, 
		EN : `Routes`,
		FR : `Itinéraires`, 
	},
	Zielsignal : {
		DE : `Zielsignal`, 
		EN : `Target signal`, 
		FR : `Signal cible`, 
	},
	Farbe : {
		DE : `Farbe`, 
		EN : `Colour`, 
		FR : `La couleur`, 
	},
	SignalData : {
		DE : `Signal Daten`, 
		EN : `Signal data`, 
		FR : `Données de signal`, 
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
		EN : `Switch`, 
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
	Kontakttyp : {
		DE : `Kontakttyp`, 
		EN : ``, 
		FR : ``, 
	},
	ImmoIdx : {
		DE : `Immobilien-Index`, 
		EN : ``, 
		FR : ``, 
	},
	'Auslösung' : {
		DE : `Auslösung`, 
		EN : ``, 
		FR : ``, 
	},
	'Zug-Zähler' : {
		DE : `Zug-Zähler`, 
		EN : ``, 
		FR : ``, 
	},
	'Zählerstand' : {
		DE : `Zählerstand`, 
		EN : ``, 
		FR : ``, 
	},
	'Zeitverzögerung' : {
		DE : `Zeitverzögerung`, 
		EN : ``, 
		FR : ``, 
	},
	'Zeit abgelaufen' : {
		DE : `Zeit abgelaufen`, 
		EN : ``, 
		FR : ``, 
	},
	'für Route' : {
		DE : `für Route`, 
		EN : ``, 
		FR : ``, 
	},
	'für Zug' : {
		DE : `für Zug`, 
		EN : ``, 
		FR : ``, 
	},
	'Zug-Filter' : {
		DE : `Zug-Filter`, 
		EN : ``, 
		FR : ``, 
	},
	'Neuer Zugname' : {
		DE : `Neuer Zugname`, 
		EN : ``, 
		FR : ``, 
	},
	LuaFn : {
		DE : `Lua-Funktion`, 
		EN : ``, 
		FR : ``, 
	},
	'zu Stellung' : {
		DE : `zu Stellung`, 
		EN : ``, 
		FR : ``, 
	},
	Blickrichtung : {
		DE : `Blickrichtung`, 
		EN : ``, 
		FR : ``, 
	},
	Neigung : {
		DE : `Neigung`, 
		EN : ``, 
		FR : ``, 
	},
	Kippung : {
		DE : `Kippung`, 
		EN : ``, 
		FR : ``, 
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

}

	const masterLanguage = 'DE';
	let language = masterLanguage;
	function setLanguage(langu) {
		language = langu;
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
		setLanguage : setLanguage,
		getText : getText,
	};

})();

function _(...args) {	// define shortcut
	return EEP_Texts.getText('info', ...args);
}
