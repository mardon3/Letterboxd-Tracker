
import { useState, useEffect } from 'react';
import { GetStats } from '../../wailsjs/go/main/App';
import { Movie } from '../models';

interface PersonStat {
  name: string;
  movie_count: number;
}

interface StatsType {
  total_movies?: number;
  average_rating?: number;
  average_letterboxd_rating?: number;
  total_runtime_formatted?: string;
  total_runtime_minutes?: number;
  movies_by_year?: Record<string, number>;
  top_movies?: Movie[];
  top_directors?: PersonStat[];
  top_actors?: PersonStat[];
  top_writers?: PersonStat[];
}

export default function Stats() {
  const [stats, setStats] = useState<StatsType>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const result = await GetStats();
      setStats((result as StatsType) || {});
      setError('');
    } catch (err) {
      console.error('GetStats error:', err);
      setError('Failed to load statistics: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-letterboxd-orange mx-auto mb-4"></div>
          <p className="text-letterboxd-light-gray">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1f2937] border border-[#456] rounded-lg p-6 shadow-lg">
          <h3 className="text-letterboxd-light-gray text-sm font-medium mb-2">Total Movies Watched</h3>
          <p className="text-4xl font-bold text-white">{stats.total_movies || 0}</p>
        </div>

        <div className="bg-[#1f2937] border border-[#456] rounded-lg p-6 shadow-lg">
          <h3 className="text-letterboxd-light-gray text-sm font-medium mb-2">Average Personal Rating</h3>
          <p className="text-4xl font-bold text-letterboxd-orange">
            {(stats.average_rating || 0).toFixed(2)}
          </p>
          <p className="text-[#678] text-xs mt-1">/ 5.00</p>
        </div>

        <div className="bg-[#1f2937] border border-[#456] rounded-lg p-6 shadow-lg">
          <h3 className="text-letterboxd-light-gray text-sm font-medium mb-2">Average Letterboxd Rating</h3>
          <p className="text-4xl font-bold text-letterboxd-blue">
            {(stats.average_letterboxd_rating || 0).toFixed(2)}
          </p>
          <p className="text-[#678] text-xs mt-1">/ 5.00</p>
        </div>

        <div className="bg-[#1f2937] border border-[#456] rounded-lg p-6 shadow-lg">
          <h3 className="text-letterboxd-light-gray text-sm font-medium mb-2">Total Watch Time</h3>
          <p className="text-2xl font-bold text-letterboxd-green">
            {stats.total_runtime_formatted || 'N/A'}
          </p>
          <p className="text-[#678] text-xs mt-1">{stats.total_runtime_minutes || 0} minutes</p>
        </div>
      </div>

      {/* Most Watched Years */}
      {stats.movies_by_year && Object.keys(stats.movies_by_year).length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Most Watched Years</h2>
          <div className="bg-[#1f2937] border border-[#456] rounded-lg p-6 shadow-lg">
            <div className="space-y-4">
              {Object.entries(stats.movies_by_year)
                .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
                .map(([year, count]) => {
                  const maxCount = Math.max(...Object.values(stats.movies_by_year!));
                  const percentage = (Number(count) / maxCount) * 100;
                  return (
                    <div key={year} className="flex items-center gap-4">
                      <span className="text-white font-medium w-16">{year}</span>
                      <div className="flex-1 bg-[#0f1419] rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-linear-to-r from-letterboxd-orange to-[#ffaa00] h-full flex items-center justify-end pr-3 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 20 && (
                            <span className="text-white text-sm font-medium">{count as number}</span>
                          )}
                        </div>
                      </div>
                      {percentage <= 20 && (
                        <span className="text-letterboxd-light-gray font-medium w-8 text-right">{count as number}</span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Top Rated Movies */}
      {stats.top_movies && stats.top_movies.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Top Rated Movies</h2>
          <div className="bg-[#1f2937] border border-[#456] rounded-lg overflow-hidden shadow-lg">
            <div className="space-y-0">
              {stats.top_movies.slice(0, 10).map((movie, idx) => (
                <div
                  key={movie.id}
                  className="px-6 py-4 border-b border-[#456] last:border-b-0 hover:bg-[#2a3548] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-letterboxd-orange font-bold text-lg w-8">#{idx + 1}</span>
                    <span className="text-white font-medium flex-1">{movie.title}</span>
                  </div>
                  <span className="text-[#fbbf24] font-medium">
                    {typeof movie.rating === 'number' && movie.rating > 0 ? (
                      <>
                        {'★'.repeat(Math.floor(movie.rating))}
                        {movie.rating % 1 >= 0.5 ? '½' : ''}
                        <span className="text-letterboxd-light-gray ml-2 text-sm">{movie.rating.toFixed(1)}/5</span>
                      </>
                    ) : (
                      <span className="text-letterboxd-light-gray ml-2 text-sm">N/A</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Directors */}
      {stats.top_directors && stats.top_directors.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Top Directors</h2>
          <div className="bg-[#1f2937] border border-[#456] rounded-lg overflow-hidden shadow-lg">
            <div className="space-y-0">
              {stats.top_directors.map((director, idx) => (
                <div
                  key={idx}
                  className="px-6 py-4 border-b border-[#456] last:border-b-0 hover:bg-[#2a3548] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-letterboxd-orange font-bold text-lg w-8">#{idx + 1}</span>
                    <span className="text-white font-medium flex-1">{director.name}</span>
                  </div>
                  <span className="text-letterboxd-blue font-medium">
                    {director.movie_count} film{director.movie_count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Actors */}
      {stats.top_actors && stats.top_actors.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Top Actors</h2>
          <div className="bg-[#1f2937] border border-[#456] rounded-lg overflow-hidden shadow-lg">
            <div className="space-y-0">
              {stats.top_actors.map((actor, idx) => (
                <div
                  key={idx}
                  className="px-6 py-4 border-b border-[#456] last:border-b-0 hover:bg-[#2a3548] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-letterboxd-orange font-bold text-lg w-8">#{idx + 1}</span>
                    <span className="text-white font-medium flex-1">{actor.name}</span>
                  </div>
                  <span className="text-letterboxd-green font-medium">
                    {actor.movie_count} film{actor.movie_count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Writers */}
      {stats.top_writers && stats.top_writers.length > 0 && (
        <div className="mt-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Top Writers</h2>
          <div className="bg-[#1f2937] border border-[#456] rounded-lg overflow-hidden shadow-lg">
            <div className="space-y-0">
              {stats.top_writers.map((writer, idx) => (
                <div
                  key={idx}
                  className="px-6 py-4 border-b border-[#456] last:border-b-0 hover:bg-[#2a3548] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-letterboxd-orange font-bold text-lg w-8">#{idx + 1}</span>
                    <span className="text-white font-medium flex-1">{writer.name}</span>
                  </div>
                  <span className="text-[#a78bfa] font-medium">
                    {writer.movie_count} film{writer.movie_count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
