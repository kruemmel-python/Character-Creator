# Installation und Ausfuehrung

Diese Anleitung gilt fuer den Fork **Character Creator** von **Ralf Kruemmel**:

- Repository: `https://github.com/kruemmel-python/Character-Creator`

## 1. Voraussetzungen

- Node.js (empfohlen: aktuelle LTS)
- npm

Versionen pruefen:

```powershell
node -v
npm -v
```

## 2. Projekt holen

```powershell
git clone https://github.com/kruemmel-python/Character-Creator.git
cd Character-Creator
```

Falls das Projekt schon lokal vorhanden ist, nur in den Ordner wechseln.

## 3. Abhaengigkeiten installieren

```powershell
npm install
```

## 4. Entwicklungsserver starten

```powershell
npm start
```

Danach im Browser oeffnen:

- `http://localhost:8080/`
- oder den von webpack angezeigten Port (z. B. `8081`)

## 5. Builds

Entwicklungsbuild:

```powershell
npm run build
```

Release-Build:

```powershell
npm run release
```

Ausgabe liegt in `dist/`.

## 6. Tests

```powershell
npm test
```

## 7. Optionaler Security-Check

```powershell
npm audit --json
```
