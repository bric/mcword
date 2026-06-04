# Wortspiel

Ein browserbasiertes deutsches Worträtsel, inspiriert von Wordle. Die Spieler haben 6 Versuche, ein geheimes deutsches Wort mit 5 Buchstaben zu erraten. Nach jedem Versuch zeigt farblich codiertes Feedback, welche Buchstaben korrekt und an der richtigen Stelle stehen (grün), korrekt aber an der falschen Stelle sind (gelb) oder gar nicht im Wort vorkommen (grau).

## Funktionen

- 6×5-Spielfeld — bis zu 6 Versuche, je 5 Buchstaben
- Farblich codiertes Buchstaben-Feedback (grün / gelb / grau) nach Wordle-Regeln
- Bildschirmtastatur im QWERTZ-Layout mit buchstabengenauer Statusanzeige
- Wortvalidierung anhand einer kuratierten Liste von 1.540 deutschen 5-Buchstaben-Wörtern
- Schaltfläche „Neues Spiel" zum Neustart mit einem zufällig gewählten Wort
- Läuft vollständig im Browser — kein Backend erforderlich

## Screenshots

```
W O R T E      ← grau  / gelb / grün / grau  / grau
S P I E L      ← nach 6 Versuchen aufgedeckt (oder Gewinnmeldung)
```

## Technologien

| Ebene     | Technologie                     |
|-----------|---------------------------------|
| Frontend  | Vanilla JavaScript + HTML/CSS   |
| Bundler   | [Vite](https://vitejs.dev/)     |
| Wörter    | `frontend/words.lst` — 1.540 kuratierte deutsche 5-Buchstaben-Wörter |

## Erste Schritte

### Voraussetzungen

- [Node.js](https://nodejs.org/) 18 oder neuer
- npm (im Lieferumfang von Node.js enthalten)

### Entwicklung

```bash
cd frontend
npm install
npm run dev
```

Der Entwicklungsserver startet unter `http://localhost:5173` und öffnet den Browser automatisch.

### Produktions-Build

```bash
cd frontend
npm install
npm run build
```

Die kompilierte Ausgabe wird in `frontend/dist/` geschrieben. Mit einem beliebigen Static-File-Server ausliefern, z. B.:

```bash
npm run preview   # stellt den Build lokal zum Testen bereit
```

## Projektstruktur

```
mcword/
├── frontend/
│   ├── src/
│   │   ├── main.js       # Spiellogik und Rendering
│   │   └── style.css     # Styles
│   ├── words.lst         # kuratierte deutsche 5-Buchstaben-Wortliste
│   ├── index.html        # Einstiegspunkt
│   └── package.json
├── specs/                # Funktionsspezifikationen und Planungsdokumente
├── vite.config.js        # Vite-Konfiguration (Root → frontend/)
└── README.md
```

## Spielanleitung

1. Das Spiel wählt beim Laden ein zufälliges geheimes Wort aus der Wortliste.
2. Tippe ein deutsches Wort mit 5 Buchstaben über die physische Tastatur oder die QWERTZ-Bildschirmtastatur ein.
3. Drücke **Enter**, um deinen Versuch abzuschicken.
4. Lies das Farb-Feedback:
   - **Grün** — richtiger Buchstabe, richtige Position
   - **Gelb** — richtiger Buchstabe, falsche Position
   - **Grau** — Buchstabe kommt nicht im Wort vor
5. Du hast 6 Versuche. Viel Erfolg!

## Lizenz

MIT
