// src/components/MovieDetail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}`, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch movie details');

        const data = await response.json();
        setMovie(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load movie. Please try again later.');
      }
    };

    fetchMovie();
  }, [id]);

  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  if (!movie)
    return <div className="text-center text-white mt-10">Loading movie details...</div>;

  return (
    <section className="min-h-screen w-full bg-primary text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-block text-sm bg-light-200 text-dark-100 px-4 py-2 rounded hover:bg-light-100 transition"
          >
            ← Back to Movies
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-10 bg-dark-100 rounded-2xl p-6 shadow-2xl">
          <div className="md:w-1/3">
            <img
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-movie.png'}
              alt={movie.title}
              className="rounded-xl w-full object-cover shadow-lg"
            />
          </div>

          <div className="md:w-2/3 space-y-4 overflow-y-auto">
            <h1 className="text-4xl font-bold leading-tight">{movie.title}</h1>
            {movie.tagline && <p className="italic text-light-200">{movie.tagline}</p>}
            <p className="text-gray-300 leading-relaxed">{movie.overview}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-sm text-gray-200">
              <p><strong>⭐ Rating:</strong> {movie.vote_average}</p>
              <p><strong>📆 Release Date:</strong> {movie.release_date}</p>
              <p><strong>⏱ Runtime:</strong> {movie.runtime} minutes</p>
              <p><strong>🌐 Language:</strong> {movie.original_language?.toUpperCase()}</p>
              <p><strong>🎮 Genres:</strong> {movie.genres?.map(g => g.name).join(', ')}</p>
              <p><strong>📺 Status:</strong> {movie.status}</p>
              <p><strong>💲 Budget:</strong> ${movie.budget?.toLocaleString()}</p>
              <p><strong>💵 Revenue:</strong> ${movie.revenue?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MovieDetail;
