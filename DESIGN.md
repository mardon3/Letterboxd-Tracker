# Letterboxd Tracker — Design

## Overview
Letterboxd Tracker is a privacy-first desktop app for macOS that lets you import, browse, and analyze your Letterboxd movie history. It is built with Go (Wails) for the backend and React (Vite + Tailwind) for the frontend. All data is stored locally in SQLite.

## Architecture
- **Backend (Go + Wails):**
  - Exposes methods for the frontend: import (scrape), query, and statistics.
  - Handles all database operations and scraping logic.
- **Frontend (React):**
  - Modern, responsive UI with Dashboard, Import, Statistics, and Settings tabs.
  - Communicates with Go backend via Wails bindings.

## Data Model
- **Movie fields:**
  - `letterboxd_id` (unique)
  - `title`, `year`, `letterboxd_url`
  - `rating` (user), `letterboxd_rating` (site)
  - `length` (runtime, min), `date_added` (imported)
  - `poster_url`, `director`, `cast`, `writers`
- **Database:**
  - SQLite, single table `movies` with indexes on title, rating, year.
  - Path: `~/Library/Application Support/LetterboxdTracker/letterboxd.db`

## Key Backend Functions
- `GetAllMovies()`: Returns all movies, newest first.
- `GetStats()`: Returns total count, averages, runtime, movies by year, top movies, top directors/actors/writers.
- `ScrapeUserData(username)`: Scrapes all films for a Letterboxd user, skipping already-imported ones.
- `SearchMovies(query)`: Case-insensitive title search.
- `GetMoviesByRating(minRating)`: Returns all movies with rating >= minRating.
- `GetMoviesByYear(year)`: Returns all movies from a given year.

## Scraper
- **How it works:**
  - User enters Letterboxd username in the Import tab.
  - Scraper fetches all public films, parses metadata, and stores new entries.
  - Skips films already in the database (by `letterboxd_id`).
  - Rate-limited to avoid hitting Letterboxd too fast.
```
                    ┌─────────────────────────────┐
                    │       Start Scraper         │
                    │   ScraperUser(username)     │
                    └────────────┬────────────────┘
                                 │
                ┌────────────────┴─────────────────┐
                │                                  │
      Pass 1: Scrape basic info           Pass 2: Detailed info
   ┌─────────────────────────┐        ┌─────────────────────────┐
   │ scrapeFilmsList(username)│       │ For each new movie:     │
   │                         │        │                         │
   │ Loop over pages         │        │ Check if movie exists   │
   │ - scrapeFilmsPage(url)  │        │ - MovieExists(db)       │
   │   - Colly: li.griditem  │        │ If exists → skip        │
   │   - Extract title, URL  │        │ Else:                   │
   │   - Extract user rating │        │ - Scrape movie details  │
   │   - Set DateAdded = now │        │ - AddMovie(db, movie)   │
   └─────────────┬───────────┘        └─────────────┬───────────┘
                 │                                  │
          Collect all movies                  Save new movies
                 │                                  │
                 └─────────────┬────────────────────┘
                               │
                      ┌────────┴────────┐
                      │  End Scraper    │
                      │ Logs summary:   │
                      │ Total Scraped   │
                      │ Total Skipped   │
                      │ Total Failed    │
                      └─────────────────┘
```


## Frontend UI
- **Tabs:** Dashboard, Import, Statistics, Settings
- **Dashboard:**
  - Search and filter films, see summary stats.
- **Import:**
  - Enter username, import progress and errors shown inline.
- **Statistics:**
  - Total films, average ratings, watch time, most-watched years, top movies, top directors/actors/writers.
- **Settings:**
  - For future configuration.

## Privacy
- All data is stored locally. No external API or server is used.

## Extensibility
- Code is modular: backend and frontend can be extended independently.
- Scraper can be updated if Letterboxd changes its HTML.

## Last updated
November 2025
