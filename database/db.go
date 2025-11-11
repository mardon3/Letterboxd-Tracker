package database

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

// MovieDB represents the database connection and operations
type MovieDB struct {
	db *sql.DB
}

// NewMovieDB creates and initializes a new database connection
func NewMovieDB(dbPath string) (*MovieDB, error) {
	// Create directory if it doesn't exist
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create database directory: %w", err)
	}

	// Open SQLite database
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	movieDB := &MovieDB{db: db}

	// Create tables
	if err := movieDB.createTables(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to create tables: %w", err)
	}

	return movieDB, nil
}

// createTables creates the necessary database tables and indexes
func (m *MovieDB) createTables() error {
	schema := `
	CREATE TABLE IF NOT EXISTS movies (
		letterboxd_id TEXT PRIMARY KEY,
		title TEXT NOT NULL,
		year INTEGER,
		letterboxd_url TEXT NOT NULL,
		rating REAL,
		letterboxd_rating REAL,
		length INTEGER,
		date_added TEXT NOT NULL,
		poster_url TEXT,
		director TEXT,
		cast TEXT,
		writers TEXT
	);

	CREATE INDEX IF NOT EXISTS idx_title ON movies(title);
	CREATE INDEX IF NOT EXISTS idx_rating ON movies(rating);
	CREATE INDEX IF NOT EXISTS idx_year ON movies(year);
	`

	_, err := m.db.Exec(schema)
	if err != nil {
		return fmt.Errorf("failed to execute schema: %w", err)
	}

	return nil
}

// Close closes the database connection
func (m *MovieDB) Close() error {
	return m.db.Close()
}

// MovieExists checks if a movie with the given letterboxd_id already exists
func (m *MovieDB) MovieExists(letterboxdID string) (bool, error) {
	var count int

	query := "SELECT COUNT(*) FROM movies WHERE letterboxd_id = ?"
	err := m.db.QueryRow(query, letterboxdID).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check if movie exists: %w", err)
	}

	return count > 0, nil
}

// GetDB returns the underlying sql.DB connection for testing purposes
func (m *MovieDB) GetDB() *sql.DB {
	return m.db
}
