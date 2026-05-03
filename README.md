# Fitness Goal

Node.js (ESM) + Express backend pro Fitness Tracker — FinMan styl (`dtoIn` / `dtoOut`), DAO vrstva, **trvalé úložiště JSON**, souhrnné **statistiky**, CORS a Docker.

## Instalace

```bash
cd fitness-goal
npm install
cp .env.example .env   # volitelné
npm start
```

- **`npm run dev`** — watch režim (`node --watch`)
- **`npm test`** — jednoduché testy (`node --test`)

## Konfigurace (proměnné / `.env`)

| Proměnná | Význam |
|----------|--------|
| `PORT` | Výchozí `3000` |
| `GATEWAY_PREFIX` | Např. `/api` — prefix všech rout |
| `DATA_FILE` | Cesta k JSON souboru (výchozí `./data/fitness-goal.json`) |
| `CORS_ORIGIN` | `*` nebo čárkou oddělené origin URL |
| `REQUEST_LOG` | `0` = vypnout log řádků požadavku |

Data se po každé změně **debounce ukládají** (~75 ms); při **SIGINT/SIGTERM** proběhne ještě flush na disk.

## API — Fitness Goal

| Metoda | Cesta |
|--------|--------|
| GET | `/fitnessGoal/list` |
| POST | `/fitnessGoal/create` — `{ "name" }` |
| GET | `/fitnessGoal/get/:fitnessGoalId` |
| POST | `/fitnessGoal/update` — `{ "id", "name" }` |
| POST | `/fitnessGoal/remove` — `{ "fitnessGoalId" }` (smaže i navázaná cvičení) |

## API — Exercise

| Metoda | Cesta |
|--------|--------|
| POST | `/exercise/create` |
| GET | `/exercise/list` — volitelně `?year=&month=` |
| POST | `/exercise/update` |
| POST | `/exercise/remove` — `{ "exerciseId" }` |
| GET | `/exercise/listByFitnessGoalId?fitnessGoalId=` |

U záznamu cvičení jsou navíc **volitelná pole**: `note` (řetězec), `durationMinutes` (1–1440).

## API — Statistiky

| Metoda | Cesta |
|--------|--------|
| GET | `/stats/overview` — stejný volitelný filtr jako u listu: `?year=&month=` |

`dtoOut` obsahuje mimo jiné `totalExercises`, `totalSessionRepetitions` (součet `sets × repetitions`), `totalDurationMinutes`, `byFitnessGoal[]`.

## Docker

```bash
docker compose up --build
```

Svazek `fitness_data` drží `/app/data/fitness-goal.json`.

## Seed

Při prázdné databázi se založí cíl **Weight Loss** (`4f8a5c958ef486f428224943e757091d`). Pokud už z `DATA_FILE` existuje, seed se přeskočí.

## Verze

**1.2** — persistence, stats, volitelná pole u cvičení, CORS, Docker, testy.
