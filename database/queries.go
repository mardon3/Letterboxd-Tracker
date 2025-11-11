package database

import (
	"database/sql"
	"fmt"
	"sort"
	"strings"
	"time"
)

// AddMovie inserts a new movie, existing movies are checked
// so there would not be any conflicts
func (m *MovieDB) AddMovie(movie Movie) error {
	query := `
	INSERT INTO movies (
		letterboxd_id, title, year, letterboxd_url, rating, letterboxd_rating,
		length, date_added, poster_url, director, "cast", writers
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	stmt, err := m.db.Prepare(query)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	now := time.Now().Format(time.RFC3339)
	_, err = stmt.Exec(
		movie.LetterboxdID, movie.Title, movie.Year, movie.LetterboxdURL,
		movie.Rating, movie.LetterboxdRating, movie.Length, now, movie.PosterURL, movie.Director, movie.Cast, movie.Writers,
	)
	if err != nil {
		return fmt.Errorf("failed to execute insert: %w", err)
	}

	return nil
}


// GetAllMovies retrieves all movies from the database, ordered by date_added DESC
func (m *MovieDB) GetAllMovies() ([]Movie, error) {
	query := `
	SELECT letterboxd_id, title, year, letterboxd_url, rating, letterboxd_rating,
		   length, date_added, poster_url, director, "cast", writers
	FROM movies
	ORDER BY date_added DESC
	`

	rows, err := m.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query movies: %w", err)
	}
	defer rows.Close()

	var movies []Movie
	for rows.Next() {
		movie, err := scanMovie(rows)
		if err != nil {
			return nil, err
		}
		movies = append(movies, movie)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	fmt.Println(movies)
	return movies, nil
}

// GetMoviesByRating retrieves movies with a rating >= minRating
func (m *MovieDB) GetMoviesByRating(minRating float64) ([]Movie, error) {
	query := `
	SELECT letterboxd_id, title, year, letterboxd_url, rating, letterboxd_rating,
		   length, date_added, poster_url, director, "cast", writers
	FROM movies
	WHERE rating >= ?
	ORDER BY rating DESC
	`

	rows, err := m.db.Query(query, minRating)
	if err != nil {
		return nil, fmt.Errorf("failed to query movies by rating: %w", err)
	}
	defer rows.Close()

	var movies []Movie
	for rows.Next() {
		movie, err := scanMovie(rows)
		if err != nil {
			return nil, err
		}
		movies = append(movies, movie)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return movies, nil
}

// SearchByTitle searches for movies by title (case-insensitive)
func (m *MovieDB) SearchByTitle(title string) ([]Movie, error) {
	query := `
	SELECT letterboxd_id, title, year, letterboxd_url, rating, letterboxd_rating,
		   length, date_added, poster_url, director, "cast", writers
	FROM movies
	WHERE title LIKE ?
	ORDER BY title ASC
	`

	rows, err := m.db.Query(query, "%"+title+"%")
	if err != nil {
		return nil, fmt.Errorf("failed to search movies: %w", err)
	}
	defer rows.Close()

	var movies []Movie
	for rows.Next() {
		movie, err := scanMovie(rows)
		if err != nil {
			return nil, err
		}
		movies = append(movies, movie)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return movies, nil
}

// GetMoviesByYear retrieves all movies from a specific year
func (m *MovieDB) GetMoviesByYear(year int) ([]Movie, error) {
	query := `
	SELECT letterboxd_id, title, year, letterboxd_url, rating, letterboxd_rating,
		   length, date_added, poster_url, director, "cast", writers
	FROM movies
	WHERE year = ?
	ORDER BY date_added DESC
	`

	rows, err := m.db.Query(query, year)
	if err != nil {
		return nil, fmt.Errorf("failed to query movies by year: %w", err)
	}
	defer rows.Close()

	var movies []Movie
	for rows.Next() {
		movie, err := scanMovie(rows)
		if err != nil {
			return nil, err
		}
		movies = append(movies, movie)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return movies, nil
}

// GetStats calculates various statistics about the movie collection
func (m *MovieDB) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total movies watched
	var totalMovies int
	err := m.db.QueryRow("SELECT COUNT(*) FROM movies").Scan(&totalMovies)
	if err != nil {
		return nil, fmt.Errorf("failed to get total movies: %w", err)
	}
	stats["total_movies"] = totalMovies

	// Average personal rating
	var avgRating sql.NullFloat64
	err = m.db.QueryRow("SELECT AVG(rating) FROM movies WHERE rating > 0").Scan(&avgRating)
	if err != nil {
		return nil, fmt.Errorf("failed to get average rating: %w", err)
	}
	if avgRating.Valid {
		stats["average_rating"] = avgRating.Float64
	} else {
		stats["average_rating"] = 0.0
	}

	// Average letterboxd rating
	var avgLetterboxdRating sql.NullFloat64
	err = m.db.QueryRow("SELECT AVG(letterboxd_rating) FROM movies").Scan(&avgLetterboxdRating)
	if err != nil {
		return nil, fmt.Errorf("failed to get average letterboxd rating: %w", err)
	}
	if avgLetterboxdRating.Valid {
		stats["average_letterboxd_rating"] = avgLetterboxdRating.Float64
	} else {
		stats["average_letterboxd_rating"] = 0.0
	}

	// Total runtime in minutes
	var totalMinutes sql.NullInt64
	err = m.db.QueryRow("SELECT COALESCE(SUM(length), 0) FROM movies").Scan(&totalMinutes)
	if err != nil {
		return nil, fmt.Errorf("failed to get total runtime: %w", err)
	}

	runtimeMinutes := totalMinutes.Int64
	days := runtimeMinutes / (24 * 60)
	hours := (runtimeMinutes % (24 * 60)) / 60
	minutes := runtimeMinutes % 60

	stats["total_runtime_minutes"] = runtimeMinutes
	stats["total_runtime_formatted"] = fmt.Sprintf("%d days, %d hours, %d minutes", days, hours, minutes)

	// Total likes (removed - field no longer exists)
	stats["total_likes"] = 0

	// Total rewatches (removed - field no longer exists)
	stats["total_rewatches"] = 0

	// Movies by year (top 10 years)
	rows, err := m.db.Query(`
		SELECT year, COUNT(*) as count FROM movies 
		WHERE year > 0 
		GROUP BY year 
		ORDER BY count DESC 
		LIMIT 10
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get movies by year: %w", err)
	}
	defer rows.Close()

	moviesByYear := make(map[int]int)
	for rows.Next() {
		var year, count int
		if err := rows.Scan(&year, &count); err != nil {
			return nil, fmt.Errorf("failed to scan year stats: %w", err)
		}
		moviesByYear[year] = count
	}
	stats["movies_by_year"] = moviesByYear

	// Top rated movies
	topMovies, err := m.GetMoviesByRating(0)
	if err == nil && len(topMovies) > 10 {
		stats["top_movies"] = topMovies[:10]
	} else {
		stats["top_movies"] = topMovies
	}

	// Top directors
	topDirectors := m.getTopPeople("director", 10)
	stats["top_directors"] = topDirectors

	// Top actors
	topActors := m.getTopPeople("cast", 10)
	stats["top_actors"] = topActors

	// Top writers
	topWriters := m.getTopPeople("writers", 10)
	stats["top_writers"] = topWriters

	return stats, nil
}

// scanMovie scans a single movie from database rows to Movie struct
func scanMovie(rows *sql.Rows) (Movie, error) {
	var movie Movie
	var rating sql.NullFloat64
	var letterboxdRating sql.NullFloat64
	var length sql.NullInt64
	var posterURL sql.NullString
	var director sql.NullString
	var cast sql.NullString
	var writers sql.NullString
	var dateAddedStr sql.NullString

	err := rows.Scan(
		&movie.LetterboxdID,
		&movie.Title,
		&movie.Year,
		&movie.LetterboxdURL,
		&rating,
		&letterboxdRating,
		&length,
		&dateAddedStr,
		&posterURL,
		&director,
		&cast,
		&writers,
	)
	if err != nil {
		return movie, fmt.Errorf("failed to scan movie row: %w", err)
	}

	// Parse date
	if dateAddedStr.Valid {
		parsed, err := time.Parse("2006-01-02 15:04:05", dateAddedStr.String)
		if err == nil {
			movie.DateAdded = parsed
		} 
	}

	// Handle other NULL values
	if rating.Valid {
		movie.Rating = rating.Float64
	}
	if letterboxdRating.Valid {
		movie.LetterboxdRating = letterboxdRating.Float64
	}
	if length.Valid {
		movie.Length = int(length.Int64)
	}
	if posterURL.Valid {
		movie.PosterURL = posterURL.String
	}
	if director.Valid {
		movie.Director = director.String
	}
	if cast.Valid {
		movie.Cast = cast.String
	}
	if writers.Valid {
		movie.Writers = writers.String
	}

	return movie, nil
}

// GetStats calculates and returns total number of movies for easy access
func (m *MovieDB) GetMovieCount() (int, error) {
	var count int
	err := m.db.QueryRow("SELECT COUNT(*) FROM movies").Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get movie count: %w", err)
	}
	return count, nil
}

// getTopPeople returns top N people (directors, actors, or writers)
// by counting comma-separated values inside the column.
// field must be one of: "director", "cast", "writers"
func (m *MovieDB) getTopPeople(field string, limit int) []map[string]interface{} {
    results := []map[string]interface{}{}

    validFields := map[string]string{
        "director": "director",
        "cast":     `"cast"`,
        "writers":  "writers",
    }

    column, ok := validFields[field]
    if !ok {
        fmt.Printf("invalid field name: %s\n", field)
        return results
    }

    // Query raw strings, let Go do the splitting
    query := fmt.Sprintf(`SELECT %s FROM movies WHERE %s IS NOT NULL AND %s != ''`,
        column, column, column)

    rows, err := m.db.Query(query)
    if err != nil {
        fmt.Printf("failed to query %s: %v\n", field, err)
        return results
    }
    defer rows.Close()

    // Count map
    counts := make(map[string]int)

    for rows.Next() {
        var raw string
        if err := rows.Scan(&raw); err != nil {
            continue
        }

        // Split by comma
        parts := strings.Split(raw, ",")
        for _, p := range parts {
            name := strings.TrimSpace(p)
            if name == "" {
                continue
            }
            counts[name]++
        }
    }

    // Convert map -> slice
    type person struct {
        Name  string
        Count int
    }

    list := make([]person, 0, len(counts))
    for name, c := range counts {
        list = append(list, person{Name: name, Count: c})
    }

    // Sort descending by count
    sort.Slice(list, func(i, j int) bool {
        return list[i].Count > list[j].Count
    })

    // Limit results
    for i := 0; i < len(list) && i < limit; i++ {
        results = append(results, map[string]interface{}{
            "name":        list[i].Name,
            "movie_count": list[i].Count,
        })
    }

    return results
}
