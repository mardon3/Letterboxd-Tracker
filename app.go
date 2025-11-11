package main

import (
	"context"
	"fmt"
	"letterboxd-tracker/database"
	"letterboxd-tracker/scraper"
	"log"
	"os"
	"path/filepath"
)

// App struct
type App struct {
	ctx context.Context
	db  *database.MovieDB
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Initialize database
	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Printf("Error getting home directory: %v\n", err)
		return
	}

	dbPath := filepath.Join(homeDir, "Library", "Application Support", "LetterboxdTracker", "letterboxd.db")
	log.Printf("Initializing database at: %s\n", dbPath)

	db, err := database.NewMovieDB(dbPath)
	if err != nil {
		log.Printf("Error initializing database: %v\n", err)
		return
	}

	a.db = db
}

// shutdown is called when the app is shutting down
func (a *App) shutdown(ctx context.Context) {
	if a.db != nil {
		a.db.Close()
	}
}

// GetAllMovies returns all movies from the database
func (a *App) GetAllMovies() ([]database.Movie, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.GetAllMovies()
}

// GetStats returns statistics about the movie collection
func (a *App) GetStats() (map[string]interface{}, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.GetStats()
}

// ScrapeUserData scrapes data for a Letterboxd user and stores it in the database
func (a *App) ScrapeUserData(username string) error {
	if a.db == nil {
		return fmt.Errorf("database not initialized")
	}

	s := scraper.NewScraper(a.db)
	return s.ScrapeUser(username)
}

// SearchMovies searches for movies by title
func (a *App) SearchMovies(query string) ([]database.Movie, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.SearchByTitle(query)
}

// GetMoviesByRating returns movies with a rating >= minRating
func (a *App) GetMoviesByRating(minRating float64) ([]database.Movie, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.GetMoviesByRating(minRating)
}

// GetMoviesByYear returns all movies from a specific year
func (a *App) GetMoviesByYear(year int) ([]database.Movie, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.GetMoviesByYear(year)
}
