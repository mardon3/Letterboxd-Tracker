import MovieCard from './MovieCard';
import { Movie } from '../models';

interface MovieListProps {
  movies: Movie[];
}

export default function MovieList({ movies }: MovieListProps) {
  if (!movies || movies.length === 0) {
    return <div className="text-center py-10 text-letterboxd-light-gray">No movies to display</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id || movie.letterboxd_id} movie={movie} />
      ))}
    </div>
  );
}
