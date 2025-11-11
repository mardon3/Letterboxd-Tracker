import { useState } from 'react';

export default function MovieCard({ movie }) {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatRating = (rating) => {
    if (!rating) return '';
    const stars = '★'.repeat(Math.floor(rating));
    const half = rating % 1 >= 0.5 ? '½' : '';
    return stars + half;
  };

  return (
    <>
      {/* Compact Card View */}
      {!expanded && (
        <div 
          className="group cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          <div className="relative poster-aspect bg-[#2c3440] rounded-md overflow-hidden border-2 border-transparent group-hover:border-letterboxd-orange transition-all shadow-lg group-hover:shadow-2xl group-hover:shadow-letterboxd-orange/20 group-hover:-translate-y-1">
            {movie.poster_url && !imageError ? (
              <img 
                src={movie.poster_url} 
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#678] text-sm p-4 text-center">
                No Poster
              </div>
            )}
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <div className="text-white font-semibold text-sm line-clamp-2 mb-1">
                {movie.title}
              </div>
              {movie.year > 0 && (
                <div className="text-letterboxd-light-gray text-xs mb-2">{movie.year}</div>
              )}
              {movie.rating > 0 && (
                <div className="text-letterboxd-orange text-lg star-rating">
                  {formatRating(movie.rating)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expanded Modal View */}
      {expanded && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          <div 
            className="bg-[#2c3440] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#456]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md:flex">
              {/* Poster */}
              <div className="md:w-1/3 text-letterboxd-dark">
                {movie.poster_url && !imageError ? (
                  <img 
                    src={movie.poster_url} 
                    alt={movie.title}
                    className="w-full h-auto object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="aspect-2/3 flex items-center justify-center text-[#678]">
                    No Poster
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="md:w-2/3 p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{movie.title}</h2>
                    {movie.year > 0 && (
                      <p className="text-letterboxd-light-gray text-lg">{movie.year}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setExpanded(false)}
                    className="text-letterboxd-light-gray hover:text-white text-3xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  {movie.rating > 0 && (
                    <div>
                      <div className="text-letterboxd-light-gray text-xs uppercase tracking-wide mb-1">Your Rating</div>
                      <div className="text-letterboxd-orange text-3xl star-rating">
                        {formatRating(movie.rating)}
                      </div>
                    </div>
                  )}

                  {movie.letterboxd_rating > 0 && (
                    <div>
                      <div className="text-letterboxd-light-gray text-xs uppercase tracking-wide mb-1">Letterboxd Rating</div>
                      <div className="text-white text-xl">{movie.letterboxd_rating.toFixed(2)} / 5.0</div>
                    </div>
                  )}

                  {movie.length > 0 && (
                    <div>
                      <div className="text-letterboxd-light-gray text-xs uppercase tracking-wide mb-1">Runtime</div>
                      <div className="text-white">{movie.length} minutes</div>
                    </div>
                  )}

                  {movie.director && (
                    <div>
                      <div className="text-letterboxd-light-gray text-xs uppercase tracking-wide mb-1">Director(s)</div>
                      <div className="text-white">{movie.director}</div>
                    </div>
                  )}

                  {movie.cast && (
                    <div>
                      <div className="text-letterboxd-light-gray text-xs uppercase tracking-wide mb-1">Cast</div>
                      <div className="text-white">{movie.cast}</div>
                    </div>
                  )}

                  {movie.writers && (
                    <div>
                      <div className="text-letterboxd-light-gray text-xs uppercase tracking-wide mb-1">Writer(s)</div>
                      <div className="text-white">{movie.writers}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
