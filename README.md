# Letterboxd Tracker

Letterboxd Tracker is a desktop application for macOS (Wails: Go + React) that lets you import, browse, and analyze your Letterboxd movie history locally. It scrapes your public Letterboxd profile, stores all your films and metadata in a local SQLite database, and provides a fast, modern UI for searching and statistics.

## Features
- **Import**: Scrape your Letterboxd account by username. Only new films are added; existing ones are skipped.
- **Dashboard**: Browse your entire film collection, search by title, and filter by rating.
- **Statistics**: View total films, average ratings, watch time, most-watched years, top-rated movies, and top directors/actors/writers.
- **Local Storage**: All data is stored locally. No data is sent to any server.
- **Letterboxd Inspired UI**: Dark-themed interface using React and Tailwind CSS.

## Quick Start
1. **Install dependencies:**
   - Go 1.25+
   - Node.js + npm
   - Wails v2 CLI
2. **Install Go modules:**
   ```sh
   go mod download
   go mod tidy
   ```
3. **Install frontend dependencies:**
   ```sh
   cd frontend && npm install && cd ..
   ```
4. **Run in development:**
   ```sh
   wails dev
   ```
5. **Build for production:**
   ```sh
   wails build
   ```

## Usage
- **Import**: Go to the Import tab, enter your Letterboxd username, and click Import. Progress and errors are shown in the UI.
- **Dashboard**: Search, filter, and browse all your films. Click a film for details (if implemented).
- **Statistics**: See summary stats, top movies, and people analytics.

## Data Model
- **Database**: SQLite, stored at `~/Library/Application Support/LetterboxdTracker/letterboxd.db`
- **Movie fields**: `letterboxd_id`, `title`, `year`, `letterboxd_url`, `rating`, `letterboxd_rating`, `length`, `date_added`, `poster_url`, `director`, `cast`, `writers`

## Project Structure
- `app.go`, `main.go`: Wails app entry and backend API
- `database/`: Go code for DB connection, schema, and queries
- `scraper/`: Go code for scraping Letterboxd
- `frontend/`: React app (Vite + Tailwind)
  - `src/components/`: Dashboard, Scraper, Stats, Settings, etc.

## Development Notes
- All scraping is done client-side; no external API or server is used.
- The app is designed for personal use and privacy.
- The codebase is fully up to date as of November 2025.
