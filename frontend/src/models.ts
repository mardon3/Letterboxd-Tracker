// Movie interface for TypeScript migration
export interface Movie {
  id?: string;
  letterboxd_id?: string;
  title: string;
  year: number;
  poster_url?: string;
  rating?: number;
  letterboxd_rating?: number;
  length?: number;
  director?: string;
  cast?: string;
  writers?: string;
}