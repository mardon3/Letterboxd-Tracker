package scraper

import (
	"fmt"
	"strconv"
	"strings"
)

// symbolToRating converts Letterboxd star symbols to numeric ratings
func symbolToRating(symbol string) (float64, error) {
	ratingMap := map[string]float64{
		"½":       0.5,
		"★":       1.0,
		"★½":      1.5,
		"★★":      2.0,
		"★★½":     2.5,
		"★★★":     3.0,
		"★★★½":    3.5,
		"★★★★":    4.0,
		"★★★★½":   4.5,
		"★★★★★":   5.0,
	}

	if rating, exists := ratingMap[symbol]; exists {
		return rating, nil
	}

	return 0, fmt.Errorf("unknown rating symbol: %s", symbol)
}

// extractLetterboxdID extracts the unique identifier from a Letterboxd URL
// From: https://letterboxd.com/film/the-shawshank-redemption/
// To: the-shawshank-redemption
func extractLetterboxdID(url string) string {
	// Remove protocol and domain
	url = strings.TrimPrefix(url, "https://letterboxd.com/film/")
	url = strings.TrimPrefix(url, "http://letterboxd.com/film/")

	// Remove trailing slashes
	url = strings.TrimSuffix(url, "/")

	return url
}

// parseRuntime extracts runtime in minutes from runtime text
// From: "148 mins More" -> 148
// From: "2h 28m" -> 148
func parseRuntime(text string) int {
	text = strings.TrimSpace(text)

	// Handle format like "148 mins More"
	parts := strings.Fields(text)
	if len(parts) > 0 {
		if minutes, err := strconv.Atoi(parts[0]); err == nil {
			return minutes
		}
	}

	// Handle format like "2h 28m"
	if strings.Contains(text, "h") && strings.Contains(text, "m") {
		hours := 0
		minutes := 0

		// Extract hours
		hParts := strings.Split(text, "h")
		if len(hParts) > 0 {
			if h, err := strconv.Atoi(strings.TrimSpace(hParts[0])); err == nil {
				hours = h
			}
		}

		// Extract minutes
		mParts := strings.Split(hParts[len(hParts)-1], "m")
		if len(mParts) > 0 {
			if m, err := strconv.Atoi(strings.TrimSpace(mParts[0])); err == nil {
				minutes = m
			}
		}

		return hours*60 + minutes
	}

	return 0
}

// parseFloat safely parses a string to float64
func parseFloat(s string) float64 {
	s = strings.TrimSpace(s)
	f, _ := strconv.ParseFloat(s, 64)
	return f
}

// parseInt safely parses a string to int
func parseInt(s string) int {
	s = strings.TrimSpace(s)
	i, _ := strconv.Atoi(s)
	return i
}

// parseRating extracts rating from Letterboxd rating text
// From: "4.55 out of 5" -> 4.55
func parseRating(text string) float64 {
	text = strings.TrimSpace(text)
	parts := strings.Fields(text)
	if len(parts) > 0 {
		return parseFloat(parts[0])
	}
	return 0
}
