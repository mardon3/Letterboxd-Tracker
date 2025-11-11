package scraper

import (
	"encoding/json"
	"fmt"
	"letterboxd-tracker/database"
	"log"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly/v2"
)

// Scraper orchestrates the two-pass scraping process
type Scraper struct {
	db *database.MovieDB
}

// NewScraper creates a new Scraper instance
func NewScraper(db *database.MovieDB) *Scraper {
	return &Scraper{db: db}
}

// ScrapeUser performs two-pass scraping of a Letterboxd user's films
// Pass 1: Collects all basic movie info from films list pages
// Pass 2: For each new movie, scrapes detailed info from detail pages
func (s *Scraper) ScrapeUser(username string) error {
	log.Printf("Starting scrape for user: %s\n", username)

	// Pass 1: Collect basic movie info
	basicMovies, err := s.scrapeFilmsList(username)
	if err != nil {
		return fmt.Errorf("pass 1 failed: %w", err)
	}

	log.Printf("Pass 1 complete: Found %d movies\n", len(basicMovies))

	// Pass 2: Scrape details for new movies only
	var totalScraped, skipped, failed int
	for i, movie := range basicMovies {
		// Check if movie already exists
		exists, err := s.db.MovieExists(movie.LetterboxdID)
		if err != nil {
			log.Printf("Error checking if movie exists: %v\n", err)
			failed++
			continue
		}

		if exists {
			log.Printf("[%d/%d] Skipping existing movie: %s\n", i+1, len(basicMovies), movie.Title)
			skipped++
			continue
		}

		// Scrape details for this movie
		log.Printf("[%d/%d] Scraping details for: %s\n", i+1, len(basicMovies), movie.Title)
		err = s.scrapeMovieDetails(&movie)
		if err != nil {
			log.Printf("Error scraping details for %s: %v\n", movie.Title, err)
			failed++
			continue
		}

		// Add movie to database
		err = s.db.AddMovie(movie)
		if err != nil {
			log.Printf("Error saving movie %s: %v\n", movie.Title, err)
			failed++
			continue
		}

		totalScraped++

		// Rate limiting: 500ms between requests
		time.Sleep(500 * time.Millisecond)
	}

	log.Printf("Pass 2 complete: Scraped %d, Skipped %d, Failed %d\n", totalScraped, skipped, failed)

	if failed > 0 {
		return fmt.Errorf("scraping completed with %d errors", failed)
	}

	return nil
}

// scrapeFilmsList scrapes the films list pages to get basic movie info
// Follows pagination using the .next selector
func (s *Scraper) scrapeFilmsList(username string) ([]database.Movie, error) {
	var allMovies []database.Movie
	pageNum := 1

	for {
		url := fmt.Sprintf("https://www.letterboxd.com/%s/films/page/%d/", username, pageNum)
		log.Printf("Scraping page %d: %s\n", pageNum, url)

		pageMovies, hasNext, err := s.scrapeFilmsPage(url)
		if err != nil {
			return nil, fmt.Errorf("failed to scrape page %d: %w", pageNum, err)
		}

		allMovies = append(allMovies, pageMovies...)

		if !hasNext {
			break
		}

		pageNum++
		time.Sleep(500 * time.Millisecond)
	}

	return allMovies, nil
}

// scrapeFilmsPage scrapes a single films list page
func (s *Scraper) scrapeFilmsPage(url string) ([]database.Movie, bool, error) {
	var movies []database.Movie
	hasNext := false

	c := colly.NewCollector()

	// Handle errors
	c.OnError(func(_ *colly.Response, err error) {
		log.Printf("Error scraping: %v\n", err)
	})

	// Extract movie data from grid items
	c.OnHTML("li.griditem", func(e *colly.HTMLElement) {
		// Extract basic movie info
		title := e.Attr("data-film-name")
		letterboxdURL := e.Attr("data-film-link")

		if title == "" || letterboxdURL == "" {
			// Try alternate selectors if primary ones fail
			title = e.ChildAttr("div.react-component[data-item-name]", "data-item-name")
			letterboxdURL = e.ChildAttr("div.react-component[data-item-link]", "data-item-link")
		}

		if title == "" || letterboxdURL == "" {
			return
		}

		// Extract rating
		ratingText := e.ChildText("p.poster-viewingdata span.rating")
		var rating float64
		if ratingText != "" {
			if r, err := symbolToRating(ratingText); err == nil {
				rating = r
			}
		}

		// Create basic movie entry
		movie := database.Movie{
			Title:        title,
			LetterboxdID: extractLetterboxdID(letterboxdURL),
			LetterboxdURL: letterboxdURL,
			Rating:       rating,
			DateAdded:    time.Now(),
		}

		movies = append(movies, movie)
	})

	// Check for next page
	c.OnHTML("a[class=next]", func(e *colly.HTMLElement) {
		hasNext = true
	})

	err := c.Visit(url)
	if err != nil {
		return nil, false, fmt.Errorf("failed to visit page: %w", err)
	}

	return movies, hasNext, nil
}

// scrapeMovieDetails scrapes detailed information from a movie's detail page
func (s *Scraper) scrapeMovieDetails(movie *database.Movie) error {
	c := colly.NewCollector()

	c.OnError(func(_ *colly.Response, err error) {
		log.Printf("Error scraping movie details: %v\n", err)
	})

	// Extract year
	c.OnHTML("span.releasedate", func(e *colly.HTMLElement) {
		yearText := e.Text
		movie.Year = parseInt(yearText)
	})

	// Extract runtime
	c.OnHTML("p.text-link.text-footer", func(e *colly.HTMLElement) {
		runtimeText := e.Text
		if len(runtimeText) > 0 {
			movie.Length = parseRuntime(runtimeText)
		}
	})

	// Extract Letterboxd rating
	c.OnHTML("meta[name='twitter:data2']", func(e *colly.HTMLElement) {
		content := e.Attr("content")
		if content != "" {
			movie.LetterboxdRating = parseRating(content)
		}
	})

	// Extract poster
	c.OnHTML("script[type='application/ld+json']", func(e *colly.HTMLElement) {
		raw := e.Text

		// Some LD+JSON blocks may include HTML comment markers or CDATA wrappers
		raw = strings.TrimSpace(raw)
		raw = strings.TrimPrefix(raw, "/* <![CDATA[ */")
		raw = strings.TrimSuffix(raw, "/* ]]> */")

		// Parse JSON
		var data map[string]interface{}
		if err := json.Unmarshal([]byte(raw), &data); err != nil {
			return
		}

		// Extract poster image
		if movie.PosterURL == "" {
			if img, ok := data["image"].(string); ok {
				movie.PosterURL = img
			}
		}
	})


	// Extract directors (comma-separated)
	c.OnHTML("span.directorlist a", func(e *colly.HTMLElement) {
		director := e.Text
		if director != "" {
			if movie.Director == "" {
				movie.Director = director
			} else {
				movie.Director += ", " + director
			}
		}
	})

	// Extract cast (top 30 actors, comma-separated), but stop at "Show All" link
	castCount := 0
	c.OnHTML("div.cast-list a.text-slug", func(e *colly.HTMLElement) {
		// Stop if this is the 'Show All' link (id or text)
		if e.Attr("id") == "has-cast-overflow" || strings.Contains(strings.ToLower(e.Text), "show all") {
			return
		}
		if castCount < 30 {
			actor := strings.TrimSpace(e.Text)
			if actor != "" {
				if movie.Cast == "" {
					movie.Cast = actor
				} else {
					movie.Cast += ", " + actor
				}
				castCount++
			}
		}
	})

	// Extract directors - collect main directors (exclude assistant directors)
	c.OnHTML("div#tab-crew", func(e *colly.HTMLElement) {
		// Find all h3 headings in the crew section
		e.ForEach("h3", func(_ int, h *colly.HTMLElement) {
			heading := strings.TrimSpace(h.Text)
			// Look specifically for the Directors heading; exclude assistant or original variants
			if strings.Contains(heading, "Director") && !strings.Contains(heading, "Assistant") && !strings.Contains(heading, "Original") {
				nextDiv := h.DOM.Next()
				var directors []string
				nextDiv.Find("a.text-slug").Each(func(_ int, sel *goquery.Selection) {
					if len(directors) >= 5 {
						return
					}
					name := strings.TrimSpace(sel.Text())
					if name != "" {
						directors = append(directors, name)
					}
				})
				if len(directors) > 0 {
					movie.Director = strings.Join(directors, ", ")
				}
			}
		})
	})

	// Extract writers - collect main writers (exclude Original Writers, Story, Screenplay variants)
	c.OnHTML("div#tab-crew", func(e *colly.HTMLElement) {
		e.ForEach("h3", func(_ int, h *colly.HTMLElement) {
			heading := strings.TrimSpace(h.Text)
			if strings.Contains(heading, "Writer") && !strings.Contains(heading, "Original") && !strings.Contains(heading, "Story") && !strings.Contains(heading, "Screenplay") {
				nextDiv := h.DOM.Next()
				var writers []string
				nextDiv.Find("a.text-slug").Each(func(_ int, sel *goquery.Selection) {
					if len(writers) >= 5 {
						return
					}
					name := strings.TrimSpace(sel.Text())
					if name != "" {
						writers = append(writers, name)
					}
				})
				if len(writers) > 0 {
					movie.Writers = strings.Join(writers, ", ")
				}
			}
		})
	})

	// Ensure full URL for visiting
	visitURL := movie.LetterboxdURL
	if !strings.HasPrefix(visitURL, "http") {
		visitURL = "https://letterboxd.com" + visitURL
	}

	err := c.Visit(visitURL)
	if err != nil {
		return fmt.Errorf("failed to visit movie page: %w", err)
	}

	return nil
}
