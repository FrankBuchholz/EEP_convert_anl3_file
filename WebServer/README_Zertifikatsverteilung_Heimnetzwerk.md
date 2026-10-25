# Zertifikat (.cer) auf Laptop und Tablet im Heimnetzwerk einrichten

Die Installationsskripte des [lokalen Webservers](README_WebServer.md "README_WebServer.md") erzeugen ein selbstsigniertes Zertifikat und legen eine `.cer`-Datei neben das Skript, z. B. `EEP Export Node.js (MEIN-PC).cer`. Auf dem **EEP-Rechner** ist das Zertifikat bereits vertrauenswürdig eingetragen. Jedes **andere Gerät** (Laptop, Tablet, Smartphone), das auf `https://<IP-Adresse>:3001/…` zugreift, muss es einmalig selbst als vertrauenswürdig einstufen. Sonst zeigt der Browser eine Zertifikatswarnung bzw. die Bridge meldet „Failed to fetch“.

Die `.cer`-Datei enthält **nur den öffentlichen Teil** des Zertifikats. Sie kann per E-Mail, Cloud oder USB weitergegeben werden. Der private Schlüssel bleibt auf dem EEP-Rechner.

Die Menünamen unterscheiden sich je nach Version, Hersteller und Sprache leicht. Maßgeblich ist die Reihenfolge der Schritte.

---

## Schritt 1: Datei auf das Zielgerät bringen

- **Netzwerkfreigabe** des Ordners mit der `.cer`-Datei (Laptop).
- **E-Mail an sich selbst** oder **Cloud-Speicher** (OneDrive, Google Drive, iCloud, Nextcloud).
- **AirDrop** (iPhone, iPad, Mac) oder **Quick Share** (Android) sowie **USB-Stick**.

Der Webserver selbst liefert die `.cer`-Datei nicht aus (nur `.json` und `.anl3`).

---

## Schritt 2: Zertifikat importieren

Wichtig ist immer der richtige Speicher: **Vertrauenswürdige Stammzertifizierungsstellen** (englisch *Trusted Root Certification Authorities*). Ein Import in „Eigene Zertifikate“ oder „Zwischenzertifizierungsstellen“ hilft nicht.

### Windows 11

1. Doppelklick auf die `.cer`-Datei, **Zertifikat installieren …**
2. Speicherort **Lokaler Computer** (braucht Administratorrechte, gilt für alle Benutzer) oder **Aktueller Benutzer** (nur für dieses Konto; Windows zeigt dann eine Sicherheitswarnung, die mit *Ja* bestätigt wird).
3. **Alle Zertifikate in folgendem Speicher speichern** → **Durchsuchen** → **Vertrauenswürdige Stammzertifizierungsstellen**.
4. Fertig stellen. Edge und Chrome nutzen diesen Speicher.

Kürzer in einer PowerShell als Administrator:

```powershell
Import-Certificate -FilePath "C:\Pfad\EEP Export Node.js (MEIN-PC).cer" -CertStoreLocation Cert:\LocalMachine\Root
```

Kontrolle: `certlm.msc` (bzw. `certmgr.msc` für den aktuellen Benutzer) → *Vertrauenswürdige Stammzertifizierungsstellen* → *Zertifikate*.

### macOS

1. **Schlüsselbundverwaltung** öffnen, die `.cer`-Datei in den Schlüsselbund **System** ziehen (Administratorkennwort).
2. Doppelklick auf das Zertifikat → **Vertrauen** → *Bei Verwendung dieses Zertifikats*: **Immer vertrauen**.

### iPhone und iPad (iOS / iPadOS)

1. `.cer`-Datei öffnen (aus *Dateien*, *Mail* oder per AirDrop). Aus Safari heraus zuerst den Download **Zulassen**.
2. Die Meldung **Profil geladen** erscheint oben in den *Einstellungen* (alternativ *Allgemein → VPN & Geräteverwaltung*). Profil öffnen und **Installieren**.
3. **Wichtig, getrennter Schritt:** *Einstellungen → Allgemein → Info → Zertifikatsvertrauenseinstellungen* und den Schalter für das Zertifikat einschalten. Ohne diesen Schritt bleibt es wirkungslos.

### Android

1. *Einstellungen → Sicherheit & Datenschutz → Weitere Sicherheitseinstellungen → Verschlüsselung & Anmeldedaten → Zertifikat installieren → **CA-Zertifikat***. Bei Samsung heißt der Pfad ähnlich (*Biometrie und Sicherheit → Weitere Sicherheitseinstellungen → Von Gerätespeicher installieren*).
2. Warnung mit **Trotzdem installieren** bestätigen, mit PIN/Muster entsperren, die `.cer`-Datei auswählen.
3. Kontrolle unter *Verschlüsselung & Anmeldedaten → Vertrauenswürdige Anmeldedaten → Nutzer*.

Seit Android 11 lässt sich ein CA-Zertifikat nicht mehr durch Antippen der Datei installieren, es geht nur über die Einstellungen. Eine Bildschirmsperre (PIN, Muster, Passwort) muss eingerichtet sein. Chrome vertraut so installierten Zertifikaten.

---

## Browser

Chrome, Edge, Safari und die Browser unter iOS nutzen den Zertifikatsspeicher des Betriebssystems. **Firefox** nutzt unter Windows, macOS und Android seit einiger Zeit standardmäßig ebenfalls die vom Betriebssystem eingetragenen Zertifikate. Hilft das nicht, unter *Einstellungen → Datenschutz & Sicherheit* prüfen, ob die Option zum automatischen Vertrauen von Stammzertifikaten Dritter aktiviert ist (`security.enterprise_roots.enabled` in `about:config`). Notfalls manuell importieren: *Zertifikate anzeigen → Zertifizierungsstellen → Importieren*.

---

## Wenn die Warnung bleibt

| Problem | Lösung |
|---|---|
| Zertifikat im falschen Speicher | Unter Windows *Vertrauenswürdige Stammzertifizierungsstellen* wählen. |
| iOS: Zertifikat installiert, Warnung bleibt | Schalter unter *Zertifikatsvertrauenseinstellungen* fehlt. |
| Adresse passt nicht zum Zertifikat | Das Zertifikat gilt für `localhost`, den PC-Namen und die IP-Adressen **zum Zeitpunkt der Installation**. Genau diese Adresse im Browser bzw. in der Bridge verwenden. |
| IP-Adresse des EEP-Rechners hat sich geändert (DHCP) | Skript erneut ausführen (erzeugt ein neues Zertifikat), die neue `.cer` importieren, die alte entfernen. Besser: dem EEP-Rechner eine feste IP geben. |
| Zertifikat abgelaufen | Es ist 2 Jahre gültig. Skript erneut ausführen und neu importieren. |
| Datum und Uhrzeit des Geräts falsch | Korrigieren, sonst gilt das Zertifikat als noch nicht gültig oder abgelaufen. |

## Wieder entfernen

- **Windows:** `certlm.msc` bzw. `certmgr.msc`, Zertifikat unter *Vertrauenswürdige Stammzertifizierungsstellen* löschen.
- **macOS:** In der Schlüsselbundverwaltung löschen.
- **iOS / iPadOS:** *Einstellungen → Allgemein → VPN & Geräteverwaltung →* Profil entfernen.
- **Android:** *Vertrauenswürdige Anmeldedaten → Nutzer →* Zertifikat auswählen und entfernen.

Nur Zertifikate importieren, deren Herkunft du kennst, denn ein als Stammzertifikat eingetragenes Zertifikat wird vom Gerät als vertrauenswürdig behandelt.
