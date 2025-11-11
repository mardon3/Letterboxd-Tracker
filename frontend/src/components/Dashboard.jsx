import { useState, useEffect } from 'react';
import { GetAllMovies, SearchMovies, GetMoviesByRating, GetStats } from '../../wailsjs/go/main/App';
import MovieList from './MovieList';

export default function Dashboard() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadMovies();
    loadStats();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        handleSearch();
      } else if (filter !== 'all') {
        applyFilter(filter);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, filter]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const result = await GetAllMovies();
      setMovies(result || []);
      setError('');
    } catch (err) {
      setError('Failed to load movies: ' + err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await GetStats();
      setStats(result || {});
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchQuery.trim() === '') {
        loadMovies();
      } else {
        const result = await SearchMovies(searchQuery);
        setMovies(result || []);
      }
      setError('');
    } catch (err) {
      setError('Search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = async (filterType) => {
    try {
      setLoading(true);

      let result = [];
      switch (filterType) {
        case 'highRated':
          result = await GetMoviesByRating(4.0);
          break;
        default:
          result = await GetAllMovies();
      }

      setMovies(result || []);
      setError('');
    } catch (err) {
      setError('Filter failed: ' + err.message);
      console.error('Filter error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-8 py-8 max-w-[1600px] mx-auto">
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search your films..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-2xl px-6 py-4 bg-[#2c3440] border-2 border-[#456] rounded-lg text-white placeholder-[#678] focus:border-letterboxd-orange focus:outline-none text-lg"
          />
        </div>

        <div className="flex gap-3">
          <button
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
              filter === 'all' && searchQuery === ''
                ? 'bg-letterboxd-green text-white'
                : 'bg-[#456] text-letterboxd-light-gray hover:bg-[#567] hover:text-white'
            }`}
            onClick={() => {
              setSearchQuery('');
              setFilter('all');
              loadMovies();
            }}
          >
            All Films
          </button>
          <button
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
              filter === 'highRated'
                ? 'bg-letterboxd-green text-white'
                : 'bg-[#456] text-letterboxd-light-gray hover:bg-[#567] hover:text-white'
            }`}
            onClick={() => {
              setSearchQuery('');
              setFilter('highRated');
              applyFilter('highRated');
            }}
          >
            Highly Rated (★★★★+)
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#2c3440] border border-[#456] rounded-lg p-6 text-center hover:border-letterboxd-orange transition-colors">
          <div className="text-letterboxd-light-gray text-sm uppercase tracking-wide mb-2">Total Films</div>
          <div className="text-5xl font-bold text-letterboxd-orange">{stats.total_movies || 0}</div>
        </div>
        <div className="bg-[#2c3440] border border-[#456] rounded-lg p-6 text-center hover:border-letterboxd-green transition-colors">
          <div className="text-letterboxd-light-gray text-sm uppercase tracking-wide mb-2">Average Rating</div>
          <div className="text-5xl font-bold text-letterboxd-green">{(stats.average_rating || 0).toFixed(2)}</div>
          <div className="text-[#678] text-sm mt-1">out of 5.00</div>
        </div>
        <div className="bg-[#2c3440] border border-[#456] rounded-lg p-6 text-center hover:border-letterboxd-blue transition-colors">
          <div className="text-letterboxd-light-gray text-sm uppercase tracking-wide mb-2">Watch Time</div>
          <div className="text-2xl font-bold text-letterboxd-blue">{stats.total_runtime_formatted || 'N/A'}</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border-l-4 border-red-500 text-red-200 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {/* Movies Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-12 h-12 border-4 border-[#456] border-t-letterboxd-orange rounded-full animate-spin mb-4"></div>
          <p className="text-letterboxd-light-gray text-lg">Loading films...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-letterboxd-light-gray text-xl mb-4">No films found</p>
          <p className="text-[#678]">Try importing data from your Letterboxd account</p>
        </div>
      ) : (
        <div>
          <p className="text-letterboxd-light-gray text-sm mb-4">{movies.length} film{movies.length !== 1 ? 's' : ''}</p>
          <MovieList movies={movies} />
        </div>
      )}
    </div>
  );
}
