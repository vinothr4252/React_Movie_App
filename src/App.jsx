import { useState,useEffect} from 'react'
import {useDebounce} from 'react-use'
import './App.css'
import Search from "./components/Search.jsx";
import Spinner from "./components/spinner.jsx"
import MovieCard from './components/MovieCard.jsx';
import {getTrendingMovies, updateSearchCount} from "./appwrite.js"
 
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS ={
  method :'GET',
  headers :{
    accept:'application/json',
    Authorization : `Bearer ${API_KEY}`
  }
}

const App=()=> {

  
  const [SearchTerm,setSearchTerm] = useState('')
  const [errrorMessage,seterrorMessage]=useState(null)
  const [MovieList,setMovieList]=useState([])
  const[isLoading,setisLoading] =useState(false)
  const[debounceSearchTerm,setdebounceSearchTerm]=useState('')
  const [TrendingMovies,setTrendingMovies]=useState([])


  useDebounce(()=>setdebounceSearchTerm(SearchTerm),500,[SearchTerm])

const fetchMovies = async(query)=>{
  setisLoading(true)
  seterrorMessage('')
  try {
  
    const endpoint = query ?
     `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query) }`:
     `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`

    const response = await fetch(endpoint,API_OPTIONS);  
    
    if(!response.ok){
      throw new Error('Failed to fetch movies')
    }
    const data = await response.json()

   if(data.Response === 'False'){
      seterrorMessage(data.Error || 'Failed to fetch movies')
      setMovieList([]);
     return; 
    } 

    setMovieList(data.results || [] ); 

    if(query && data.results.length  >0 ){
      await updateSearchCount(query,data.results[0]);
    }
   

    
  } catch (error) {

    console.error(`Error fetching movies : ${error}`);
    seterrorMessage('Error fetching movies. Please try again later.')
    
  }finally{
    setisLoading(false)
  }
}

const loadTrendingMovies = async()=>{

  try {
    const movies = await getTrendingMovies();
    setTrendingMovies(movies)

  } catch (error) {
    console.error(`Error fetching trending movies: ${error}`)
  }
}

useEffect(()=>{
     fetchMovies(debounceSearchTerm); 
  },[debounceSearchTerm])

  useEffect(()=>{
    loadTrendingMovies();
  },[])



  return (
    <main>
      <div className='pattern'/>

       <div className='wrapper'>

         <header>
           <img src="./hero-poster.png" alt="Hero-Poster" />
            <h1> Find <span className='text-gradient'>Movies</span>  You'll Enjoy Without the Hassle</h1>
            <Search searchterm={SearchTerm}  setSearchTerm={setSearchTerm} />
          </header>
       
          {TrendingMovies.length > 1 && (
            <section className='trending'> 
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


        


          <section  className='all-movies'>
            <h2 >All Movies</h2>

            {isLoading ? (

              <Spinner/>

             ):errrorMessage ? (

              <p className='text-red-500'>{errrorMessage}</p>

             ) : (
                <ul>
                 {MovieList.map((movie)=>(
                  <MovieCard  key={movie.id} movie={movie} />
                 ))} 
                </ul>

             )
            }
          </section>


           

      </div> 
    
    </main> 
  )

}

export default App
