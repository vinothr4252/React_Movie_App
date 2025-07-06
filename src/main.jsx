import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import MovieDetail from './components/MovieDetail';
import {BrowserRouter,Route, Routes} from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<App/>}  />
     <Route path="/movie/:id" element={<MovieDetail />} />
    </Routes>
    </BrowserRouter>
  </StrictMode>,
)
