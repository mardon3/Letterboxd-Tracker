package database

import "time"

// Movie represents a movie record in the database
// json tags tell Go to name fields in snake_case
// with no capitals (serializes to json for frontend)
type Movie struct {
	LetterboxdID     string    `json:"letterboxd_id"`
	Title            string    `json:"title"`
	Year             int       `json:"year"`
	LetterboxdURL    string    `json:"letterboxd_url"`
	Rating           float64   `json:"rating"`
	LetterboxdRating float64   `json:"letterboxd_rating"`
	Length           int       `json:"length"`
	DateAdded        time.Time `json:"date_added"`
	PosterURL        string    `json:"poster_url"`
	Director         string    `json:"director"`
	Cast             string    `json:"cast"`
	Writers          string    `json:"writers"`
}
