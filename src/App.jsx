import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "react-use";
import "./App.css";
import Search from "./components/Search.jsx";
import Spinner from "./components/spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [SearchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [MovieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceSearchTerm, setDebounceSearchTerm] = useState("");
  const [TrendingMovies, setTrendingMovies] = useState([]);
  const [Genres, setGenres] = useState([]);
  const [GenreMoviesCache, setGenreMoviesCache] = useState({});
  const [SelectedGenre, setSelectedGenre] = useState(null);

  useDebounce(() => setDebounceSearchTerm(SearchTerm), 500, [SearchTerm]);

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/genre/movie/list?language=en`,
        API_OPTIONS
      );
      const data = await res.json();
      setGenres(data.genres || []);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchMoviesByGenre = async (genreId) => {
    if (GenreMoviesCache[genreId]) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/discover/movie?with_genres=${genreId}&sort_by=popularity.desc`,
        API_OPTIONS
      );
      const data = await res.json();
      setGenreMoviesCache((prev) => ({
        ...prev,
        [genreId]: data.results.slice(0, 12),
      }));
    } catch (error) {
      console.error(`Error loading movies for genre ${genreId}:`, error);
    }
  };

  const fetchMovies = async (query) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error("Failed to fetch movies");

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadTrendingMovies();
      await fetchGenres();
    };
    init();
  }, []);

  useEffect(() => {
    if (Genres.length > 0 && !SelectedGenre) {
      const defaultGenre = Genres.find((g) => g.name === "Action");
      if (defaultGenre) setSelectedGenre(defaultGenre);
    }
  }, [Genres]);

  useEffect(() => {
    if (SelectedGenre) {
      fetchMoviesByGenre(SelectedGenre.id);
    }
  }, [SelectedGenre]);

  useEffect(() => {
    fetchMovies(debounceSearchTerm);
  }, [debounceSearchTerm]);

  const genreMovieList = useMemo(() => {
    return SelectedGenre ? GenreMoviesCache[SelectedGenre.id] || [] : [];
  }, [SelectedGenre, GenreMoviesCache]);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero-poster.png" alt="Hero-Poster" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchterm={SearchTerm} setSearchTerm={setSearchTerm} />

          {/* 🔍 Show Search Results Immediately Below Search Input */}
          {debounceSearchTerm && (
            <section className="search-results mt-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Search Results for:{" "}
                <span className="text-yellow-400">{debounceSearchTerm}</span>
              </h2>

              {isLoading ? (
                <Spinner />
              ) : errorMessage ? (
                <p className="text-red-500">{errorMessage}</p>
              ) : (
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                  {MovieList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </ul>
              )}
            </section>
          )}
        </header>

        {TrendingMovies.length > 1 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {TrendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Genre Buttons */}
        {Genres.length > 0 && (
          <section className="">
            <h2 className="mb-4 text-3xl font-bold"> Browse by Genre</h2>
            <div className="flex flex-wrap gap-2 ">
              {Genres.map((genre) => (
                <button
                  key={genre.id}
                  className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-lg border transition-all duration-300 ease-in-out
                    ${
                      SelectedGenre?.id === genre.id
                        ? "bg-white  font-black  shadow-lg  scale-105"
                        : "border border-gray-700 text-white "
                    }`}
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre.name}
                </button>
              ))}
            </div>

            {SelectedGenre && (
              <div className="genre-section">
                <h3 className="text-3xl text-white mt-6 font-bold mb-3">
                  {SelectedGenre.name} Movies
                </h3>
                {genreMovieList.length > 0 ? (
                  <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                    {genreMovieList.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </ul>
                ) : (
                  <iv className="flex justify-center text-gray-500 text-2xl font">
                    Loading ...
                  </iv>
                )}
              </div>
            )}
          </section>
        )}

        <section className="all-movies mt-10">
          <h2> All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {MovieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
